import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { config } from "../config/config";
import { AppError } from "../middleware/errorHandler";
import cloudinary from "../config/cloudinary";

export const register = async (req: Request, res: Response) => {
	try {
		const { email, password, username } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		// Create new user
		const user = new User({ email, password, username });
		await user.save();

		// Generate token
		const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
			expiresIn: "7d"
		});

		res.status(201).json({ user, token });
	} catch (error) {
		res.status(400).json({ error: "Error creating user" });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Generate token
		const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
			expiresIn: "7d"
		});

		res.json({ user, token });
	} catch (error) {
		res.status(400).json({ error: "Error logging in" });
	}
};

export const getProfile = async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.json(user);
	} catch (error) {
		res.status(400).json({ error: "Error fetching profile" });
	}
};

export const uploadAvatar = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.file) {
			throw new AppError("Please upload an image", 400);
		}

		const userId = req.user._id;

		// Convert buffer to base64
		const b64 = Buffer.from(req.file.buffer).toString("base64");
		const dataURI = `data:${req.file.mimetype};base64,${b64}`;

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(dataURI, {
			folder: "moviebox/avatars",
			public_id: `user_${userId}`,
			overwrite: true
		});

		// Update user's avatar URL
		const user = await User.findByIdAndUpdate(
			userId,
			{ avatar: result.secure_url },
			{ new: true }
		).select("-password");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.status(200).json({
			status: "success",
			message: "Avatar updated successfully",
			user
		});
	} catch (error) {
		next(error);
	}
};
