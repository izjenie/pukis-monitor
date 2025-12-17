"use client";

import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "super_admin" | "owner" | "admin_outlet" | "finance";
  assignedOutletId: string | null;
}

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      if (res.status === 401) {
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
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
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
