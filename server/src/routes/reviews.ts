import express from "express";
import * as reviewController from "../controllers/reviewController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", reviewController.getReviews);

// Protected routes
router.use(authenticateToken);
router.post("/", reviewController.createReview);
router.get("/user", reviewController.getUserReviews);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.post("/:id/like", reviewController.likeReview);
router.post("/:id/dislike", reviewController.dislikeReview);

export default router;
