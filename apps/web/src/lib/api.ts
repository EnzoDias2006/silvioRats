export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export type MeResponse = {
  user: { id: string; name: string; email: string; image?: string | null };
  membership: {
    status: "pending" | "approved" | "rejected" | "suspended";
    role: "member" | "admin";
  };
};

export type FeedPhoto = {
  id: string;
  version: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  url?: string;
};

export type FeedPost = {
  id: string;
  caption: string | null;
  occurredAt: string;
  createdAt: string;
  authorName: string;
  authorImage: string | null;
  photos: FeedPhoto[];
};
