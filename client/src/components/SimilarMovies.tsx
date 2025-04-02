import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { movies } from "../api";
import type { Movie } from "../types";

interface SimilarMoviesProps {
  movieId: number;
}

export default function SimilarMovies({ movieId }: SimilarMoviesProps) {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSimilarMovies();
  }, [movieId]);

  const fetchSimilarMovies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await movies.getSimilar(movieId);
      setSimilarMovies(response.data.results.slice(0, 4)); // Show only 4 similar movies
    } catch (error) {
      console.error("Error fetching similar movies:", error);
      setError("Failed to fetch similar movies");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (similarMovies.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Similar Movies
      </Typography>
      <Grid container spacing={2}>
        {similarMovies.map((movie) => (
          <Grid item xs={6} sm={4} md={3} key={movie.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.2s ease-in-out",
                },
              }}
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <CardMedia
                component="img"
                image={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/placeholder.png"
                }
                alt={movie.title}
              />
              <CardContent>
                <Typography
                  variant="subtitle1"
                  component="div"
                  noWrap
                  sx={{
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {movie.release_date &&
                    new Date(movie.release_date).getFullYear()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
