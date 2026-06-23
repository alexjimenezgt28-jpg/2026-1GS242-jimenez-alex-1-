import { connectDB } from "./db";
import { Skin } from "./models/Skin";

const defaultSkins = [
  {
    id: "classic",
    name: "Classic",
    description: "The classic wood-toned checkers board",
    price: 0,
    stripePriceId: "",
    imageUrl: "",
    boardColors: { light: "#f0d9b5", dark: "#b58863" },
    pieceColors: { player: "#000000", ai: "#ffffff" },
    kingSymbol: "♛",
  },
  {
    id: "ocean",
    name: "Ocean Deep",
    description: "Blue tones for a calm gaming experience",
    price: 299,
    stripePriceId: "price_1TgfG5FSusuqt57ZuEKSLlyM",
    imageUrl: "",
    boardColors: { light: "#e8f4f8", dark: "#2c7da0" },
    pieceColors: { player: "#013a63", ai: "#ffffff" },
    kingSymbol: "♛",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark theme with neon accents",
    price: 299,
    stripePriceId: "price_1TgfGTFSusuqt57ZaP2zrSgw",
    imageUrl: "",
    boardColors: { light: "#2d2d44", dark: "#0f0f23" },
    pieceColors: { player: "#00ff88", ai: "#ff6b6b" },
    kingSymbol: "♛",
  },
  {
    id: "royal",
    name: "Royal Crimson",
    description: "Red and gold for a regal feel",
    price: 499,
    stripePriceId: "price_1TgfGkFSusuqt57ZcqQAneQ4",
    imageUrl: "",
    boardColors: { light: "#f5e6cc", dark: "#8b0000" },
    pieceColors: { player: "#ffd700", ai: "#ffffff" },
    kingSymbol: "♛",
  },
  {
    id: "neon",
    name: "Neon Nights",
    description: "Bright neon colors on dark background",
    price: 499,
    stripePriceId: "price_1TfgHAFSusuqt57ZRDzEY6m6",
    imageUrl: "",
    boardColors: { light: "#1a1a2e", dark: "#16213e" },
    pieceColors: { player: "#ff00ff", ai: "#00ffff" },
    kingSymbol: "♛",
  },
];

async function seed() {
  await connectDB();
  await Skin.deleteMany({});
  await Skin.insertMany(defaultSkins);
  console.log("Seed complete: inserted", defaultSkins.length, "skins");
  process.exit(0);
}

seed();
