"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthToken, clearAuthToken } from "@/lib/queryClient";

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
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/admin-auth/user"],
    queryFn: async () => {
      const token = getAuthToken();
      
      if (!token) {
        return null;
      }
      
      const res = await fetch("/api/admin-auth/user", {
        headers: {
          "Authorization": `Bearer ${token}`,
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
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logout = async () => {
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
