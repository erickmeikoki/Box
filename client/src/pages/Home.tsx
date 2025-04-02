import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  InputAdornment,
  Alert,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { movies, watchlist } from "../api";
import type { Movie } from "../types";

const GENRES = [
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentary" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Family" },
  { id: "14", name: "Fantasy" },
  { id: "36", name: "History" },
  { id: "27", name: "Horror" },
  { id: "10402", name: "Music" },
  { id: "9648", name: "Mystery" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Science Fiction" },
  { id: "10770", name: "TV Movie" },
  { id: "53", name: "Thriller" },
  { id: "10752", name: "War" },
  { id: "37", name: "Western" },
];

export default function Home() {
  const { user } = useAuth();
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingMovies();
    if (user) {
      fetchWatchlist();
    }
  }, [page, selectedGenre, user]); // Refetch when page, genre, or user changes

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      const response = await watchlist.get();
      setWatchlistMovies(response.data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setError("Failed to fetch watchlist. Please try again.");
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await movies.search(
        undefined,
        "popularity.desc",
        page,
        selectedGenre
      );
      setMoviesList(response.data.results);
      setTotalPages(Math.min(Math.ceil(response.data.total_results / 20), 500));
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedGenre) {
      fetchTrendingMovies();
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await movies.search(
        searchQuery,
        undefined,
        page,
        selectedGenre
      );
      setMoviesList(response.data.results);
      setTotalPages(Math.min(Math.ceil(response.data.total_results / 20), 500));
    } catch (error) {
      console.error("Error searching movies:", error);
      setError("Failed to search movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleGenreChange = (event: any) => {
    setSelectedGenre(event.target.value);
    setPage(1); // Reset to first page when changing genre
  };

  const addToWatchlist = async (movie: Movie) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await watchlist.add(movie.id, movie.title, movie.poster_path);
      setWatchlistMovies((prev) => [...prev, movie]);
      console.log("Added to watchlist");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setError("Failed to add movie to watchlist. Please try again.");
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await watchlist.remove(movieId);
      setWatchlistMovies((prev) => prev.filter((m) => m.id !== movieId));
      console.log("Removed from watchlist");
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      setError("Failed to remove movie from watchlist. Please try again.");
    }
  };

  const toggleWatchlist = async (movie: Movie) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (watchlistMovies.some((m) => m.id === movie.id)) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist(movie);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to MovieBox
        </Typography>

        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Genre</InputLabel>
            <Select
              value={selectedGenre}
              label="Genre"
              onChange={handleGenreChange}
              sx={{ height: "56px" }}
            >
              <MenuItem value="">All Genres</MenuItem>
              {GENRES.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {moviesList.map((movie) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "/placeholder.png"
                      }
                      alt={movie.title}
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        noWrap
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        {movie.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {movie.release_date &&
                          new Date(movie.release_date).getFullYear()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={
                          watchlistMovies.some((m) => m.id === movie.id) ? (
                            <BookmarkIcon />
                          ) : (
                            <BookmarkAddIcon />
                          )
                        }
                        onClick={() => toggleWatchlist(movie)}
                        color={
                          watchlistMovies.some((m) => m.id === movie.id)
                            ? "primary"
                            : "inherit"
                        }
                      >
                        {watchlistMovies.some((m) => m.id === movie.id)
                          ? "Remove from Watchlist"
                          : "Add to Watchlist"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {moviesList.length === 0 && !loading && (
              <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
                <Typography color="text.secondary">
                  {searchQuery
                    ? "No movies found matching your search."
                    : "No movies available."}
                </Typography>
              </Box>
            )}
            {moviesList.length > 0 && (
              <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
