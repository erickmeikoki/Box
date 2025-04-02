import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse } from "axios";
import { AppError } from "../middleware/errorHandler";
import { Movie } from "../models/Movie";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { config } from "../config/config";
import { Movie as MovieModel } from "../models/Movie";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL =
  process.env.TMDB_API_URL || "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  console.error("TMDB_API_KEY is not set in environment variables");
}

interface TMDBMovieResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_results: number;
}

// TMDB API helper function
const fetchTMDB = async (
  endpoint: string,
  params: Record<string, string> = {}
) => {
  if (!config.tmdbApiKey) {
    throw new Error("TMDB API key is not configured");
  }

  const queryParams = new URLSearchParams({
    api_key: config.tmdbApiKey,
    ...params,
  });

  const response = await axios.get(
    `${config.tmdbApiUrl}${endpoint}?${queryParams}`
  );
  if (!response.ok) {
    throw new Error("TMDB API request failed");
  }
  return response.json();
};

export const getMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const movies = await Movie.find()
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Movie.countDocuments();

    res.status(200).json({
      status: "success",
      results: movies.length,
      total,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const TMDB_BASE_URL = process.env.TMDB_API_URL;

    if (!TMDB_API_KEY) {
      throw new AppError("TMDB API key is not configured", 500);
    }

    // Fetch movie details with append_to_response to get additional data
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "credits,external_ids,release_dates",
        language: "en-US",
      },
    });

    const movieData = response.data;

    // Find or create movie in our database
    let movie = await Movie.findOne({ tmdbId: Number(id) });
    if (!movie) {
      movie = await Movie.create({
        tmdbId: movieData.id,
        title: movieData.title,
        overview: movieData.overview,
        posterPath: movieData.poster_path,
        backdropPath: movieData.backdrop_path,
        releaseDate: movieData.release_date,
        voteAverage: movieData.vote_average,
        genres: movieData.genres.map((g: any) => g.name),
        budget: movieData.budget,
        revenue: movieData.revenue,
        runtime: movieData.runtime,
        tagline: movieData.tagline,
        status: movieData.status,
        imdbId: movieData.external_ids?.imdb_id,
        releaseDates: movieData.release_dates?.results || [],
        credits: {
          cast: movieData.credits?.cast.slice(0, 10) || [],
          crew:
            movieData.credits?.crew.filter((member: any) =>
              ["Director", "Producer", "Screenplay", "Writer"].includes(
                member.job
              )
            ) || [],
        },
      });
    } else {
      // Update existing movie with new data
      movie = await Movie.findOneAndUpdate(
        { tmdbId: Number(id) },
        {
          budget: movieData.budget,
          revenue: movieData.revenue,
          runtime: movieData.runtime,
          tagline: movieData.tagline,
          status: movieData.status,
          imdbId: movieData.external_ids?.imdb_id,
          releaseDates: movieData.release_dates?.results || [],
          credits: {
            cast: movieData.credits?.cast.slice(0, 10) || [],
            crew:
              movieData.credits?.crew.filter((member: any) =>
                ["Director", "Producer", "Screenplay", "Writer"].includes(
                  member.job
                )
              ) || [],
          },
        },
        { new: true }
      );
    }

    // Populate reviews
    await movie.populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "username avatar",
      },
    });

    res.status(200).json({
      status: "success",
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!TMDB_API_KEY) {
      throw new AppError("TMDB API key is not configured", 500);
    }

    // Get initial results
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US",
      },
    });

    const movies = response.data.results;

    // Fetch video data for each movie
    const moviesWithVideos = await Promise.all(
      movies.map(async (movie: any) => {
        try {
          const videoResponse = await axios.get(
            `${TMDB_BASE_URL}/movie/${movie.id}/videos`,
            {
              params: {
                api_key: TMDB_API_KEY,
                language: "en-US",
              },
            }
          );
          return {
            ...movie,
            videos: videoResponse.data,
          };
        } catch (error) {
          console.error(`Error fetching videos for movie ${movie.id}:`, error);
          return {
            ...movie,
            videos: { results: [] },
          };
        }
      })
    );

    res.status(200).json({
      ...response.data,
      results: moviesWithVideos,
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      next(new AppError("Invalid TMDB API key", 500));
    } else if (error.response?.status === 403) {
      next(new AppError("TMDB API key is not authorized", 500));
    } else {
      next(error);
    }
  }
};

export const searchMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!TMDB_API_KEY) {
      throw new AppError("TMDB API key is not configured", 500);
    }

    const { query, sortBy, page = 1, with_genres } = req.query;
    const pageNumber = parseInt(page as string) || 1;

    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&page=${pageNumber}`;

    if (query) {
      url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
        query as string
      )}&page=${pageNumber}`;
    }

    if (sortBy) {
      url += `&sort_by=${sortBy}`;
    }

    if (with_genres) {
      url += `&with_genres=${with_genres}`;
    }

    const response = await axios.get<TMDBResponse>(url);
    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genres: movie.genre_ids,
    }));

    res.json({
      page: pageNumber,
      results: movies,
      total_results: response.data.total_results,
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user._id;

    const review = new Review({
      userId,
      movieId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: "Error adding review" });
  }
};

export const getMovieReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findOne({ tmdbId: id }).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "username avatar",
      },
    });

    if (!movie) {
      throw new AppError("Movie not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: movie.reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { rating, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    res.status(400).json({ error: "Error updating review" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Error deleting review" });
  }
};

export const getMovieDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!TMDB_API_KEY) {
      throw new AppError("TMDB API key is not configured", 500);
    }

    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US",
        append_to_response: "credits,videos,images",
      },
    });

    // Save or update movie in database
    const movieData = response.data;
    await Movie.findOneAndUpdate(
      { tmdbId: movieData.id },
      {
        tmdbId: movieData.id,
        title: movieData.title,
        overview: movieData.overview,
        posterPath: movieData.poster_path,
        backdropPath: movieData.backdrop_path,
        releaseDate: movieData.release_date,
        voteAverage: movieData.vote_average,
        genres: movieData.genres.map((genre: any) => genre.id),
      },
      { upsert: true, new: true }
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      next(new AppError("Invalid TMDB API key", 500));
    } else if (error.response?.status === 403) {
      next(new AppError("TMDB API key is not authorized", 500));
    } else {
      next(error);
    }
  }
};

export const getWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const user = await User.findById(userId).populate({
      path: "watchlist",
      select: "tmdbId title posterPath releaseDate",
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const watchlistMovies = user.watchlist.map((movie: any) => ({
      id: movie.tmdbId,
      title: movie.title,
      poster_path: movie.posterPath,
      release_date: movie.releaseDate,
    }));

    res.status(200).json({
      status: "success",
      data: watchlistMovies,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    // Find or create movie
    let movie = await Movie.findOne({ tmdbId: Number(id) });

    if (!movie) {
      try {
        const response = await axios.get(
          `${process.env.TMDB_API_URL}/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
        );
        const {
          title,
          poster_path: posterPath,
          release_date: releaseDate,
          overview,
        } = response.data;

        movie = await Movie.create({
          tmdbId: Number(id),
          title,
          posterPath: posterPath || null,
          releaseDate: releaseDate || null,
          overview: overview || "",
          backdropPath: null,
          voteAverage: 0,
          genres: [],
        });
      } catch (error) {
        console.error("Error creating movie:", error);
        throw new AppError("Failed to create movie", 500);
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if movie is already in watchlist
    const isInWatchlist = user.watchlist.some(
      (movieId) => movieId.toString() === movie._id.toString()
    );

    if (isInWatchlist) {
      throw new AppError("Movie already in watchlist", 400);
    }

    user.watchlist.push(movie._id);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Movie added to watchlist successfully",
      data: {
        movie,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const movie = await Movie.findOne({ tmdbId: id });
    if (!movie) {
      throw new AppError("Movie not found", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.watchlist = user.watchlist.filter(
      (movieId) => movieId.toString() !== movie._id.toString()
    );
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Movie removed from watchlist",
    });
  } catch (error) {
    next(error);
  }
};

export const getSimilarMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!TMDB_API_KEY) {
      throw new AppError("TMDB API key is not configured", 500);
    }

    const { id } = req.params;
    const url = `${TMDB_BASE_URL}/movie/${id}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

    const response = await axios.get(url);
    const movies = response.data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genres: movie.genre_ids,
    }));

    res.json({ results: movies });
  } catch (error) {
    next(error);
  }
};
