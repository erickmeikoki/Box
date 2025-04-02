import express from "express";
import * as movieController from "../controllers/movieController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/search", movieController.searchMovies);
router.get("/trending", movieController.getTrendingMovies);
router.get("/:id", movieController.getMovieDetails);

// Protected routes
router.post(
	"/:id/watchlist",
	authenticateToken,
	movieController.addToWatchlist
);
router.delete(
	"/:id/watchlist",
	authenticateToken,
	movieController.removeFromWatchlist
);
router.get("/:id/reviews", movieController.getMovieReviews);

export default router;
