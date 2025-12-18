import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const buildQueryUrl = (queryKey: readonly unknown[]): string => {
  const path = queryKey[0] as string;
  
  if (queryKey.length === 1) {
    return path;
  }
  
  const params = queryKey[1];
  if (typeof params === 'object' && params !== null) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  }
  
  return queryKey.join("/");
};

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = buildQueryUrl(queryKey);
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    
    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
