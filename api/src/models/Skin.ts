import mongoose, { Schema, Document } from "mongoose";

export interface ISkin extends Document {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string;
  imageUrl: string;
  boardColors: { light: string; dark: string };
  pieceColors: { player: string; ai: string };
  kingSymbol: string;
}

const SkinSchema = new Schema<ISkin>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stripePriceId: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  boardColors: {
    light: { type: String, required: true },
    dark: { type: String, required: true },
  },
  pieceColors: {
    player: { type: String, required: true },
    ai: { type: String, required: true },
  },
  kingSymbol: { type: String, default: "♛" },
});

export const Skin = mongoose.model<ISkin>("Skin", SkinSchema);
