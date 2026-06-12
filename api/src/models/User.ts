import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  username: string;
  email: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  ownedSkins: string[];
  equippedSkin: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, default: 1000 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    ownedSkins: { type: [String], default: ["classic"] },
    equippedSkin: { type: String, default: "classic" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
