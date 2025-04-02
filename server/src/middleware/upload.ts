import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Not an image! Please upload an image."));
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024 // 5MB limit
	}
});
