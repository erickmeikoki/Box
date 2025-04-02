import { Request, Response } from "express";
import Watchlist from "../models/Watchlist";
import { Types } from "mongoose";
import { AppError } from "../middleware/errorHandler";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: Types.ObjectId;
  };
}

export const addToWatchlist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { movieId, title, poster_path } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const watchlistItem = await Watchlist.create({
      user: userId,
      movieId,
      title,
      poster_path,
    });

    res.status(201).json(watchlistItem);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Movie already in watchlist" });
      return;
    }
    throw new AppError(error.message, 500);
  }
};

export const removeFromWatchlist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { movieId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const result = await Watchlist.findOneAndDelete({
      user: userId,
      movieId: parseInt(movieId),
    });

    if (!result) {
      throw new AppError("Movie not found in watchlist", 404);
    }

    res.status(200).json({ message: "Movie removed from watchlist" });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

export const getWatchlist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const watchlist = await Watchlist.find({ user: userId }).sort({
      addedAt: -1,
    });
    res.status(200).json(watchlist);
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};
