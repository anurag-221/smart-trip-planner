const API = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("apiFetch called on server");
  }

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Only set JSON header if body exists
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API + url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      console.warn("Unauthorized – not logged in");
    }
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}