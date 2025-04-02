# MovieBox Server

The backend server for the MovieBox application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization
- Movie data management
- Review system
- Watchlist functionality
- User profile management
- Integration with external movie APIs

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   TMDB_API_KEY=your_tmdb_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```
6. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── index.ts        # Application entry point
```

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Movies

- GET /api/movies - Get all movies
- GET /api/movies/:id - Get movie by ID
- GET /api/movies/trending - Get trending movies
- GET /api/movies/search - Search movies

### Reviews

- GET /api/reviews - Get all reviews
- POST /api/reviews - Create a new review
- PUT /api/reviews/:id - Update a review
- DELETE /api/reviews/:id - Delete a review

### Watchlist

- GET /api/watchlist - Get user's watchlist
- POST /api/watchlist - Add movie to watchlist
- DELETE /api/watchlist/:id - Remove movie from watchlist

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
