import express from "express";
import authRoutes from "./auth";
import movieRoutes from "./movies";
import reviewRoutes from "./reviews";
import watchlistRoutes from "./watchlist";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

// Routes
router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/reviews", authenticateToken, reviewRoutes);
router.use("/watchlist", authenticateToken, watchlistRoutes);

export default router;
