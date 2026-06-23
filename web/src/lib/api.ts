const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let currentSession: { getToken: (options?: { template?: string }) => Promise<string | null> } | null = null;

export function setSession(session: typeof currentSession) {
  currentSession = session;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (currentSession) {
    const token = await currentSession.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  ranking: {
    getAll: () =>
      request<{ ranking: Array<Record<string, unknown>> }>("/ranking"),
    getUser: (clerkId: string) =>
      request<{ user: Record<string, unknown> }>(`/ranking/${clerkId}`),
  },

  users: {
    sync: (data: { username?: string; email?: string }) =>
      request<{ user: Record<string, unknown> }>("/users/sync", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    submitResult: (data: {
      result: "win" | "loss" | "draw";
      moves: string[];
    }) =>
      request<{ rating: number; ratingChange: number }>("/users/game-result", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  skins: {
    getAll: () => request<{ skins: Array<Record<string, unknown>> }>("/skins"),
    createCheckout: (skinId: string) =>
      request<{ url: string }>("/skins/create-checkout", {
        method: "POST",
        body: JSON.stringify({ skinId }),
      }),
    equip: (skinId: string) =>
      request<{ equippedSkin: string }>("/skins/equip", {
        method: "POST",
        body: JSON.stringify({ skinId }),
      }),
  },
};
