import { createClerkClient, verifyToken as clerkVerifyToken } from "@clerk/backend";
import type { Elysia } from "elysia";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
});

export function extractBearer(authHeader?: string): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function verifyToken(token: string) {
  try {
    return await clerkVerifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || "",
    });
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string) {
  try {
    const claims = await clerkVerifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || "",
    });
    if (!claims?.sub) return null;
    const user = await clerk.users.getUser(claims.sub);
    return user;
  } catch {
    return null;
  }
}
