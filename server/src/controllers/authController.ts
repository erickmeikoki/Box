import { Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import { AppError } from "../middleware/errorHandler";

const generateToken = (id: string): string => {
	const secret = process.env.JWT_SECRET || ("your_jwt_secret_key" as Secret);
	const options: SignOptions = {
		expiresIn: process.env.JWT_EXPIRES_IN || ("7d" as string)
	};
	return jwt.sign({ userId: id }, secret, options);
};

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { username, email, password } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			throw new AppError(
				"User with this email or username already exists",
				400
			);
		}

		// Create new user
		const user = (await User.create({
			username,
			email,
			password
		})) as IUser & { _id: mongoose.Types.ObjectId };

		// Generate token
		const token = generateToken(user._id.toString());

		res.status(201).json({
			status: "success",
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				avatar: user.avatar
			}
		});
	} catch (error) {
		next(error);
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password } = req.body;

		// Check if email and password exist
		if (!email || !password) {
			throw new AppError("Please provide email and password", 400);
		}

		// Check if user exists && password is correct
		const user = (await User.findOne({ email }).select("+password")) as
			| (IUser & { _id: mongoose.Types.ObjectId })
			| null;
		if (!user || !(await user.comparePassword(password))) {
			throw new AppError("Incorrect email or password", 401);
		}

		// Generate token
		const token = generateToken(user._id.toString());

		res.status(200).json({
			status: "success",
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				avatar: user.avatar
			}
		});
	} catch (error) {
		next(error);
	}
};

export const getCurrentUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.status(200).json({
			status: "success",
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				avatar: user.avatar,
				watchlist: user.watchlist
			}
		});
	} catch (error) {
		next(error);
	}
};
