import axios from "axios";
import type { AuthResponse, Movie, MovieDetails, Review, User } from "../types";

interface ReviewsResponse {
  status: string;
  results: number;
  total: number;
  reviews: Review[];
}

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { username, email, password }),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  getCurrentUser: () => api.get<User>("/auth/me"),
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },
};

// Movie endpoints
export const movies = {
  search: (
    query?: string,
    sortBy?: string,
    page: number = 1,
    with_genres?: string
  ) =>
    api.get<{ page: number; results: Movie[]; total_results: number }>(
      "/movies/search",
      {
        params: { query, sortBy, page, with_genres },
      }
    ),
  getDetails: (id: number) => api.get<MovieDetails>(`/movies/${id}`),
  getSimilar: (id: number) =>
    api.get<{ results: Movie[] }>(`/movies/${id}/similar`),
};

// Review endpoints
export const reviews = {
  create: (movieId: number, rating: number, comment: string) =>
    api.post<{ status: string; data: Review }>("/reviews", {
      movieId,
      rating,
      content: comment,
    }),
  getUserReviews: () => api.get<ReviewsResponse>("/reviews/user"),
  getMovieReviews: (movieId: number) =>
    api.get<ReviewsResponse>("/reviews", { params: { movieId } }),
};

// Watchlist endpoints
export const watchlist = {
  get: () => api.get<Movie[]>("/watchlist"),
  add: (movieId: number, title: string, poster_path: string | null) =>
    api.post("/watchlist", { movieId, title, poster_path }),
  remove: (movieId: number) => api.delete(`/watchlist/${movieId}`),
};
