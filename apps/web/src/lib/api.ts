const API_URL = import.meta.env.VITE_API_URL;

export type FeedPhoto = {
  id: string;
  version: string;
};

export type FeedPost = {
  id: string;
  authorName: string;
  caption: string | null;
  occurredAt: string;
  photos: FeedPhoto[];
};

export type MeResponse = {
  user: {
    name: string;
    email: string;
  };
  membership: {
    role: "admin" | "member";
    status: "approved" | "pending" | "blocked";
  };
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
