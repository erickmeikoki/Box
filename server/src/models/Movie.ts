import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  genres: string[];
  budget: number;
  revenue: number;
  runtime: number;
  tagline: string;
  status: string;
  imdbId: string;
  releaseDates: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      release_date: string;
      certification: string;
      type: number;
      note: string;
    }>;
  }>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path: string;
    }>;
  };
  reviews: mongoose.Types.ObjectId[];
}

const movieSchema = new Schema<IMovie>(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      required: true,
    },
    posterPath: {
      type: String,
    },
    backdropPath: {
      type: String,
    },
    releaseDate: {
      type: String,
    },
    voteAverage: {
      type: Number,
    },
    genres: [
      {
        type: String,
      },
    ],
    budget: {
      type: Number,
    },
    revenue: {
      type: Number,
    },
    runtime: {
      type: Number,
    },
    tagline: {
      type: String,
    },
    status: {
      type: String,
    },
    imdbId: {
      type: String,
    },
    releaseDates: [
      {
        iso_3166_1: String,
        release_dates: [
          {
            release_date: String,
            certification: String,
            type: Number,
            note: String,
          },
        ],
      },
    ],
    credits: {
      cast: [
        {
          id: Number,
          name: String,
          character: String,
          profile_path: String,
          order: Number,
        },
      ],
      crew: [
        {
          id: Number,
          name: String,
          job: String,
          department: String,
          profile_path: String,
        },
      ],
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Movie = mongoose.model<IMovie>("Movie", movieSchema);
export default Movie;
