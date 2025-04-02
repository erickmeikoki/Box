import mongoose, { Schema, Document } from "mongoose";

export interface IWatchlist extends Document {
  user: mongoose.Types.ObjectId;
  movieId: number;
  title: string;
  poster_path: string | null;
  addedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    poster_path: {
      type: String,
      required: false,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure unique user-movie combinations
watchlistSchema.index({ user: 1, movieId: 1 }, { unique: true });

export default mongoose.model<IWatchlist>("Watchlist", watchlistSchema);
