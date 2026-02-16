import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UpdateUserData } from '../services/userService';
import { Permission } from '../services/roleService';
import authService from '../services/authService';
import userService from '../services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasPermission: (_resource: string, _action: string) => boolean;
  login: (_token: string) => void;
  logout: () => void;
  updateUser: (_data: Partial<User>) => Promise<void>;
  setUser: (_user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const currentUser = await authService.getProfile();
        setUser(currentUser);
      }
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    try {
      setLoading(true);
      const currentUser = await authService.getProfile();
      setUser(currentUser);
    } catch {
      // Login failed
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.role) {
      return false;
    }
    if (user.role.name === 'Super Admin') {
      return true;
    }
    if (!user.role.permissions) {
      return false;
    }
    return user.role.permissions.some(
      (p: Permission) => p.resource === resource && p.action === action
    );
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) {
      throw new Error("User not available for update");
    }
    try {
      const { userType, role, ...rest } = data;
      const updateData: UpdateUserData = { ...rest };
      if (userType) {
        updateData.userType = typeof userType === 'string' ? userType : userType._id;
      }
      if (role) {
        updateData.role = typeof role === 'string' ? role : role._id;
      }
      const updatedUser = await userService.updateUser(user._id, updateData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, hasPermission, login, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 