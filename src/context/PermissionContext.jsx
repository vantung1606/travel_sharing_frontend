import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useApp } from './AppContext';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const { currentUser, updateCurrentUser } = useApp();

  const roles = useMemo(() => {
    return Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  }, [currentUser?.roles]);

  const permissions = useMemo(() => {
    if (Array.isArray(currentUser?.permissions)) {
      return new Set(currentUser.permissions);
    }
    return new Set();
  }, [currentUser?.permissions]);

  const isSuperAdmin = useMemo(() => {
    return roles.includes('ROLE_ADMIN');
  }, [roles]);

  const isModerator = useMemo(() => {
    return roles.includes('ROLE_MODERATOR') && !isSuperAdmin;
  }, [roles, isSuperAdmin]);

  /**
   * Check if current user has a specific permission
   * SuperAdmin always has all permissions
   */
  const can = useCallback((permissionCode) => {
    if (!permissionCode) return true;
    if (isSuperAdmin) return true;
    return permissions.has(permissionCode);
  }, [isSuperAdmin, permissions]);

  /**
   * Check if user lacks a specific permission
   */
  const cannot = useCallback((permissionCode) => {
    return !can(permissionCode);
  }, [can]);

  /**
   * Check if user has ANY of the given permissions
   */
  const canAny = useCallback((permissionCodes = []) => {
    if (!permissionCodes || permissionCodes.length === 0) return true;
    if (isSuperAdmin) return true;
    return permissionCodes.some(code => permissions.has(code));
  }, [isSuperAdmin, permissions]);

  /**
   * Check if user has ALL of the given permissions
   */
  const canAll = useCallback((permissionCodes = []) => {
    if (!permissionCodes || permissionCodes.length === 0) return true;
    if (isSuperAdmin) return true;
    return permissionCodes.every(code => permissions.has(code));
  }, [isSuperAdmin, permissions]);

  const value = useMemo(() => ({
    can,
    cannot,
    canAny,
    canAll,
    isSuperAdmin,
    isModerator,
    roles,
    permissions: Array.from(permissions)
  }), [can, cannot, canAny, canAll, isSuperAdmin, isModerator, roles, permissions]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      can: () => true,
      cannot: () => false,
      canAny: () => true,
      canAll: () => true,
      isSuperAdmin: false,
      isModerator: false,
      roles: [],
      permissions: []
    };
  }
  return context;
};

/**
 * Component to conditionally render content based on permission
 */
export const Can = ({ permission, permissions = [], fallback = null, children }) => {
  const { can, canAny } = usePermission();

  if (permission && !can(permission)) {
    return fallback;
  }
  if (permissions.length > 0 && !canAny(permissions)) {
    return fallback;
  }
  return <>{children}</>;
};

/**
 * Component to conditionally render when permission is lacking
 */
export const Cannot = ({ permission, children }) => {
  const { cannot } = usePermission();
  if (cannot(permission)) {
    return <>{children}</>;
  }
  return null;
};
