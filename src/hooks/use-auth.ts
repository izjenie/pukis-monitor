"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthToken, clearAuthToken, API_BASE_URL } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  role: "super_admin" | "owner" | "admin_outlet" | "finance";
  assigned_outlet_id: string | null;
}

export function useAuth() {
  const token = getAuthToken();

  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!token) return null;
      
      const res = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.status === 401) {
        clearAuthToken();
        return null;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return res.json();
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logout = () => {
    clearAuthToken();
    window.location.href = "/admin-login";
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refetch,
  };
}
