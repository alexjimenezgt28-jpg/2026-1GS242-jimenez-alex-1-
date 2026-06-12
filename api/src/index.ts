import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { connectDB } from "./db";
import { rankingRoutes } from "./routes/ranking";
import { skinRoutes } from "./routes/skins";
import { userRoutes } from "./routes/users";

const PORT = process.env.PORT || 3000;

await connectDB();

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .get("/health", () => ({ status: "ok", time: new Date().toISOString() }))
  .use(rankingRoutes)
  .use(skinRoutes)
  .use(userRoutes)
  .listen(PORT);

console.log(`API running at http://localhost:${PORT}`);
