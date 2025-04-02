import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Rating,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import type { MovieDetails as MovieDetailsType, Review } from "../types";
import { movies, reviews } from "../api";
import VideoPlayer from "../components/VideoPlayer";
import SimilarMovies from "../components/SimilarMovies";
import MovieIcon from "@mui/icons-material/Movie";
import StarIcon from "@mui/icons-material/Star";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { Link } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export default function MovieDetails() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [movieReviews, setMovieReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, content: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
      fetchMovieReviews();
    }
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError("");
      const response = await movies.getDetails(parseInt(id));
      setMovie(response.data);
      setRetryCount(0);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      setError("Failed to fetch movie details");
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieReviews = async () => {
    try {
      if (!id) return;
      const response = await reviews.getMovieReviews(parseInt(id));
      setMovieReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // Don't show error for reviews as they're not critical
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    // Validate review data
    if (newReview.rating < 0.5 || newReview.rating > 5) {
      setError("Rating must be between 0.5 and 5");
      return;
    }

    if (newReview.content && newReview.content.length > 1000) {
      setError("Review content cannot exceed 1000 characters");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await reviews.create(
        parseInt(id),
        newReview.rating,
        newReview.content.trim()
      );

      if (response.data && response.data.data) {
        setMovieReviews([response.data.data, ...movieReviews]);
        setNewReview({ rating: 0, content: "" });
        setError(""); // Clear any previous errors
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit review. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getTrailerKey = (movie: MovieDetailsType) => {
    if (!movie.videos?.results) return null;
    const trailer = movie.videos.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );
    return trailer?.key || null;
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress />
        <Typography color="text.secondary">Loading movie details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          mt={4}
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
          {retryCount < MAX_RETRIES && (
            <Button
              variant="contained"
              onClick={fetchMovieDetails}
              startIcon={<CircularProgress size={20} />}
            >
              Retry
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Movie not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="600"
                image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
              {movie.videos?.results && movie.videos.results.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <VideoPlayer
                    videoId={movie.videos.results[0].key}
                    onEnd={() => {}}
                  />
                </Box>
              )}
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {movie.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {formatDate(movie.release_date)}
            </Typography>
            <Typography variant="body1" paragraph>
              {movie.overview}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Chip
                icon={<StarIcon />}
                label={`${movie.vote_average.toFixed(1)} / 10`}
                color="primary"
              />
              <Chip
                icon={<GroupIcon />}
                label={`${movie.vote_count} votes`}
                color="secondary"
              />
              {movie.budget > 0 && (
                <Chip
                  icon={<AttachMoneyIcon />}
                  label={`Budget: $${(movie.budget / 1000000).toFixed(1)}M`}
                  color="success"
                />
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Genres
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {movie.genres?.map((genre) => (
                  <Chip key={genre.id} label={genre.name} />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Production Companies
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {movie.production_companies?.map((company) => (
                  <Chip key={company.id} label={company.name} />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Production Countries
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {movie.production_countries?.map((country) => (
                  <Chip key={country.iso_3166_1} label={country.name} />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Spoken Languages
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {movie.spoken_languages?.map((language) => (
                  <Chip key={language.iso_639_1} label={language.name} />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {id && <SimilarMovies movieId={parseInt(id)} />}

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>

        {user ? (
          <Card sx={{ mb: 4, p: 2 }}>
            <form onSubmit={handleSubmitReview}>
              <Typography variant="subtitle1" gutterBottom>
                Write a Review
              </Typography>
              <Rating
                value={newReview.rating}
                onChange={(_, value) =>
                  setNewReview({ ...newReview, rating: value || 0 })
                }
                precision={0.5}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Your Review (Optional)"
                value={newReview.content}
                onChange={(e) =>
                  setNewReview({ ...newReview, content: e.target.value })
                }
                placeholder="Share your thoughts about the movie..."
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={submitting || !newReview.rating}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </Card>
        ) : (
          <Card sx={{ mb: 4, p: 2, bgcolor: "background.default" }}>
            <Typography variant="body1" color="text.secondary">
              Please{" "}
              <Link
                to="/login"
                style={{ color: "primary.main", textDecoration: "none" }}
              >
                login
              </Link>{" "}
              to write a review.
            </Typography>
          </Card>
        )}

        {movieReviews.map((review) => (
          <Card key={review._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ListItemAvatar>
                  <UserAvatar user={review.user} size={40} />
                </ListItemAvatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mr: 1 }}>
                    {review.user?.username}
                  </Typography>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {formatDate(review.createdAt)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1">{review.content}</Typography>
            </CardContent>
          </Card>
        ))}

        {movieReviews.length === 0 && (
          <Typography color="text.secondary">
            No reviews yet.{" "}
            {user
              ? "Be the first to review this movie!"
              : "Login to be the first to review this movie!"}
          </Typography>
        )}
      </Box>
    </Container>
  );
}
