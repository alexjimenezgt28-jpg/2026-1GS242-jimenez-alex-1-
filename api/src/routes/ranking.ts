import { Elysia } from "elysia";
import { User } from "../models/User";

export const rankingRoutes = new Elysia({ prefix: "/ranking" })
  .get("/", async () => {
    const users = await User.find({ gamesPlayed: { $gt: 0 } })
      .sort({ rating: -1 })
      .select("username rating wins losses draws gamesPlayed equippedSkin")
      .lean();
    return { ranking: users };
  })
  .get("/:clerkId", async ({ params: { clerkId }, set }) => {
    const user = await User.findOne({ clerkId })
      .select("username rating wins losses draws gamesPlayed equippedSkin")
      .lean();
    if (!user) { set.status = 404; return { error: "User not found" }; }
    return { user };
  });
