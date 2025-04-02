# Movie Review Application

A full-stack web application for reviewing and discussing movies, built with React, Node.js, and MongoDB.

## Features

- 🎬 Browse movies from TMDB (The Movie Database)
- ⭐ Rate and review movies
- 👤 User authentication and profiles
- 📝 Create and manage reviews
- 🎥 Watch movie trailers
- 📱 Responsive design
- 🔍 Search and filter movies
- 📋 Personal watchlist

## Tech Stack

### Frontend

- React with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API calls
- Vite for build tooling

### Backend

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image uploads
- TMDB API integration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- TMDB API key
- Cloudinary account (for avatar uploads)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/erickmeikoki/Box.git
cd Box
```

2. Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:

For the server (`.env`):

```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

For the client (`.env`):

```env
VITE_API_URL=http://localhost:5001
```

4. Start the development servers:

```bash
# Start the server (from server directory)
npm run dev

# Start the client (from client directory)
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## API Endpoints

### Authentication

- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user
- GET `/auth/me` - Get current user
- PUT `/auth/profile` - Update user profile
- POST `/auth/avatar` - Upload user avatar

### Movies

- GET `/movies` - Get all movies
- GET `/movies/:id` - Get movie details
- GET `/movies/:id/similar` - Get similar movies
- GET `/movies/search` - Search movies

### Reviews

- GET `/reviews` - Get all reviews
- GET `/reviews/movie/:movieId` - Get reviews for a movie
- POST `/reviews` - Create a review
- PUT `/reviews/:id` - Update a review
- DELETE `/reviews/:id` - Delete a review

### Watchlist

- GET `/watchlist` - Get user's watchlist
- POST `/watchlist` - Add movie to watchlist
- DELETE `/watchlist/:movieId` - Remove movie from watchlist

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie data
- [Material-UI](https://mui.com/) for the component library
- [Cloudinary](https://cloudinary.com/) for image hosting
