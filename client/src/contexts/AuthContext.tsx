import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'customer' | 'admin' | 'vendor' | 'delivery' | 'delivery_boy' | 'vet' | 'farmer';
  roles?: string[];
  vendorId?: string;
  farmName?: string;
  addressLine?: string;
  village?: string;
  city?: string;
  state?: string;
  herdSize?: number;
  lat?: number;
  lon?: number;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const savedMockUser = localStorage.getItem('mockUser');
      if (savedMockUser) {
        setUser(JSON.parse(savedMockUser));
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        console.error("Not authenticated:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };
  
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem('mockUser');
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
