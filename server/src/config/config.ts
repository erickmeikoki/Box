import dotenv from "dotenv";

dotenv.config();

export const config = {
	port: process.env.PORT || 5000,
	mongoUri:
		process.env.MONGODB_URI || "mongodb://localhost:27017/movie-review-app",
	jwtSecret: process.env.JWT_SECRET || "your-secret-key",
	tmdbApiKey: process.env.TMDB_API_KEY,
	tmdbApiUrl: "https://api.themoviedb.org/3"
};
