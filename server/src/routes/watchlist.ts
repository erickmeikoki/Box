import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} from "../controllers/watchlistController";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's watchlist
router.get("/", getWatchlist);

// Add movie to watchlist
router.post("/", addToWatchlist);

// Remove movie from watchlist
router.delete("/:movieId", removeFromWatchlist);

export default router;
