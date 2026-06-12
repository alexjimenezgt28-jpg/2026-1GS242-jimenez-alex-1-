import { Elysia, t } from "elysia";
import Stripe from "stripe";
import { Skin } from "../models/Skin";
import { User } from "../models/User";
import { extractBearer, getUserFromToken } from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const skinRoutes = new Elysia({ prefix: "/skins" })
  .get("/", async () => {
    const skins = await Skin.find().lean();
    return { skins };
  })
  .post("/create-checkout", async ({ body, headers, set }) => {
    const token = extractBearer(headers.authorization);
    if (!token) { set.status = 401; return { error: "Unauthorized" }; }

    const clerkUser = await getUserFromToken(token);
    if (!clerkUser) { set.status = 401; return { error: "Invalid token" }; }

    const { skinId } = body as { skinId: string };
    const skin = await Skin.findOne({ id: skinId });
    if (!skin) { set.status = 404; return { error: "Skin not found" }; }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: skin.stripePriceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop?canceled=true`,
      metadata: { clerkId: clerkUser.id, skinId: skin.id },
    });

    return { url: session.url };
  })
  .post("/webhook", async ({ request }) => {
    const sig = request.headers.get("stripe-signature");
    if (!sig) return { error: "No signature" };

    const body = await request.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch {
      return { error: "Invalid signature" };
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { clerkId, skinId } = session.metadata || {};
      if (clerkId && skinId) {
        await User.findOneAndUpdate(
          { clerkId },
          { $addToSet: { ownedSkins: skinId } }
        );
      }
    }

    return { received: true };
  })
  .post("/equip", async ({ body, headers, set }) => {
    const token = extractBearer(headers.authorization);
    if (!token) { set.status = 401; return { error: "Unauthorized" }; }

    const clerkUser = await getUserFromToken(token);
    if (!clerkUser) { set.status = 401; return { error: "Invalid token" }; }

    const { skinId } = body as { skinId: string };
    const user = await User.findOne({ clerkId: clerkUser.id });
    if (!user) { set.status = 404; return { error: "User not found" }; }
    if (!user.ownedSkins.includes(skinId)) { set.status = 403; return { error: "Skin not owned" } };

    user.equippedSkin = skinId;
    await user.save();

    return { equippedSkin: skinId };
  });
