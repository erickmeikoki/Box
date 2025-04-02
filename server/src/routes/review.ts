import express from "express";
import * as reviewController from "../controllers/reviewController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post("/", reviewController.createReview);
router.get("/:id", reviewController.getReview);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.post("/:id/like", reviewController.likeReview);
router.post("/:id/dislike", reviewController.dislikeReview);

export default router;
