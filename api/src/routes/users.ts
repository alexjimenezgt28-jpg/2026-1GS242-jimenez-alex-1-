import { Elysia } from "elysia";
import { User } from "../models/User";
import { Game } from "../models/Game";
import { extractBearer, getUserFromToken } from "../middleware/auth";

export const userRoutes = new Elysia({ prefix: "/users" })
  .post("/sync", async ({ body, headers, set }) => {
    const token = extractBearer(headers.authorization);
    if (!token) { set.status = 401; return { error: "Unauthorized" }; }

    const clerkUser = await getUserFromToken(token);
    if (!clerkUser) { set.status = 401; return { error: "Invalid token" }; }

    const { username, email } = body as { username?: string; email?: string };

    let user = await User.findOne({ clerkId: clerkUser.id });
    if (!user) {
      user = new User({
        clerkId: clerkUser.id,
        username: username || clerkUser.username || `user_${clerkUser.id.slice(0, 8)}`,
        email: email || clerkUser.emailAddresses?.[0]?.emailAddress || "",
      });
      await user.save();
    } else {
      if (username) user.username = username;
      if (email) user.email = email;
      await user.save();
    }

    return { user: user.toObject() };
  })
  .post("/game-result", async ({ body, headers, set }) => {
    const token = extractBearer(headers.authorization);
    if (!token) { set.status = 401; return { error: "Unauthorized" }; }

    const clerkUser = await getUserFromToken(token);
    if (!clerkUser) { set.status = 401; return { error: "Invalid token" }; }

    const { result, moves } = body as { result: "win" | "loss" | "draw"; moves: string[] };

    const user = await User.findOne({ clerkId: clerkUser.id });
    if (!user) { set.status = 404; return { error: "User not found, sync first" } };

    const ratingChange = result === "win" ? 25 : result === "loss" ? -25 : 5;
    user.rating += ratingChange;
    if (result === "win") user.wins += 1;
    else if (result === "loss") user.losses += 1;
    else user.draws += 1;
    user.gamesPlayed += 1;
    await user.save();

    await Game.create({
      userId: clerkUser.id,
      result,
      ratingChange,
      moves,
    });

    return { rating: user.rating, ratingChange };
  });
