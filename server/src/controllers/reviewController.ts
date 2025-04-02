import { Request, Response, NextFunction } from "express";
import Review from "../models/Review";
import Movie from "../models/Movie";
import { AppError } from "../middleware/errorHandler";
import axios from "axios";
import { Types } from "mongoose";

interface TMDBMovieResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: Array<{
    id: number;
    name: string;
  }>;
}

interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
  };
}

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { movieId, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (movieId) {
      // First find the movie in our database using TMDB ID
      const movie = await Movie.findOne({ tmdbId: Number(movieId) });
      if (!movie) {
        return res.status(200).json({
          status: "success",
          results: 0,
          total: 0,
          reviews: [],
        });
      }
      query.movie = movie._id;
    }

    const reviews = await Review.find(query)
      .populate("user", "username avatar")
      .populate("movie", "title posterPath")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      total,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { movieId, rating, content } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!movieId || !rating) {
      return res.status(400).json({
        status: "error",
        message: "Movie ID and rating are required",
      });
    }

    if (rating < 0.5 || rating > 5) {
      return res.status(400).json({
        status: "error",
        message: "Rating must be between 0.5 and 5",
      });
    }

    if (content && content.length > 1000) {
      return res.status(400).json({
        status: "error",
        message: "Review content cannot exceed 1000 characters",
      });
    }

    // Check if movie exists, if not create it
    let movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      try {
        // Fetch movie details from TMDB
        const response = await axios.get<TMDBMovieResponse>(
          `${process.env.TMDB_API_URL}/movie/${movieId}`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              language: "en-US",
            },
          }
        );

        const movieData = response.data;
        movie = await Movie.create({
          tmdbId: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          posterPath: movieData.poster_path,
          backdropPath: movieData.backdrop_path,
          releaseDate: movieData.release_date,
          voteAverage: movieData.vote_average,
          genres: movieData.genres.map((g) => g.name),
        });
      } catch (tmdbError: any) {
        console.error("TMDB API Error:", tmdbError);
        return res.status(500).json({
          status: "error",
          message: "Failed to fetch movie details from TMDB",
          details:
            tmdbError.response?.data?.status_message || tmdbError.message,
        });
      }
    }

    // Check if user has already reviewed this movie
    let review = await Review.findOne({
      user: userId,
      movie: movie._id,
    });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.content = content || "";
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        user: userId,
        movie: movie._id,
        rating,
        content: content || "",
      });

      // Add review to movie's reviews array
      movie.reviews.push(review._id);
      await movie.save();
    }

    // Populate user information
    await review.populate("user", "username avatar");

    res.status(201).json({
      status: "success",
      data: review,
    });
  } catch (error: any) {
    console.error("Review Creation Error:", error);
    next(error);
  }
};

export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate(
      "user",
      "username avatar"
    );

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) {
      throw new AppError("Review not found or unauthorized", 404);
    }

    review.rating = rating;
    review.content = content;
    await review.save();

    await review.populate("user", "username avatar");

    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) {
      throw new AppError("Review not found or unauthorized", 404);
    }

    // Remove review from movie's reviews array
    await Movie.findByIdAndUpdate(review.movie, {
      $pull: { reviews: review._id },
    });

    await review.deleteOne();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const likeReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Remove dislike if exists
    review.dislikes = review.dislikes.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Add like if not exists
    if (!review.likes.includes(userId)) {
      review.likes.push(userId);
    }

    await review.save();

    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const dislikeReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Remove like if exists
    review.likes = review.likes.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Add dislike if not exists
    if (!review.dislikes.includes(userId)) {
      review.dislikes.push(userId);
    }

    await review.save();

    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ user: userId })
      .populate("user", "username avatar")
      .populate("movie", "title posterPath")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: reviews.length,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
