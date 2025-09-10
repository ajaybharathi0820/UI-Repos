import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Helper hook for checking roles
export function useRole() {
  const { user } = useAuth();
  
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };
  
  const isAdmin = (): boolean => {
    return hasRole('Admin');
  };
  
  const isAssociate = (): boolean => {
    return hasRole('Associate');
  };
  
  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isAssociate,
    userRole: user?.role
  };
}
