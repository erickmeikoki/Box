# MovieBox Client

A React application for browsing and reviewing movies, built with TypeScript and Material-UI.

## Features

- User authentication (login/register)
- Browse trending movies
- Search for movies
- View movie details
- Write and read movie reviews
- Add movies to watchlist
- User profile with review history

## Tech Stack

- React 18
- TypeScript
- Material-UI
- React Router
- Axios
- Vite

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Build the application:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
src/
  ├── api/          # API client and endpoints
  ├── components/   # Reusable components
  ├── contexts/     # React contexts
  ├── pages/        # Page components
  ├── types/        # TypeScript types
  ├── App.tsx       # Main application component
  ├── main.tsx      # Application entry point
  └── index.css     # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
