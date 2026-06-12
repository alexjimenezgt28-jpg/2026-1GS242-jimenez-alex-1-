import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  userId: string;
  result: "win" | "loss" | "draw";
  ratingChange: number;
  moves: string[];
  playedAt: Date;
}

const GameSchema = new Schema<IGame>({
  userId: { type: String, required: true, index: true },
  result: { type: String, enum: ["win", "loss", "draw"], required: true },
  ratingChange: { type: Number, required: true },
  moves: { type: [String], default: [] },
  playedAt: { type: Date, default: Date.now },
});

export const Game = mongoose.model<IGame>("Game", GameSchema);
