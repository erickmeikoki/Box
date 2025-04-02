import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post(
	"/avatar",
	authenticateToken,
	upload.single("avatar"),
	userController.uploadAvatar
);

export default router;
