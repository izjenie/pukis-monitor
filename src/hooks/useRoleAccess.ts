// Hook for role-based access control
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@shared/schema";

export function useRoleAccess() {
  const { user } = useAuth();
  
  const role = user?.role as UserRole | undefined;
  
  const canEdit = () => {
    return role === "owner" || role === "admin_outlet";
  };
  
  const canViewAllOutlets = () => {
    return role === "owner" || role === "finance";
  };
  
  const canManageOutlets = () => {
    return role === "owner";
  };
  
  const getAccessibleOutletId = () => {
    if (role === "admin_outlet") {
      return user?.assignedOutletId || null;
    }
    return null; // null means all outlets accessible
  };
  
  const isOwner = role === "owner";
  const isAdminOutlet = role === "admin_outlet";
  const isFinance = role === "finance";
  
  return {
    role,
    canEdit,
    canViewAllOutlets,
    canManageOutlets,
    getAccessibleOutletId,
    isOwner,
    isAdminOutlet,
    isFinance,
  };
}
