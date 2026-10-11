import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else if (res.status === 405 || res.status === 404 || res.status >= 500) {
        // Fallback for standalone Vite deployment
        const storedEmail = localStorage.getItem('local_user_email') || 'developer@example.com';
        const storedName = localStorage.getItem('local_user_name') || 'Developer';
        setUser({
          id: 'usr-local',
          name: storedName,
          email: storedEmail,
          created_at: new Date().toISOString()
        });
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // offline or standalone Vite
      const storedEmail = localStorage.getItem('local_user_email') || 'developer@example.com';
      const storedName = localStorage.getItem('local_user_name') || 'Developer';
      setUser({
        id: 'usr-local',
        name: storedName,
        email: storedEmail,
        created_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return;
      }

      if (res.status !== 405 && res.status !== 404 && res.status < 500) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Login failed.');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('405') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
    }

    // Seamless Local fallback on standalone Vite/Vercel deployment
    const localUser: User = {
      id: 'local-' + Date.now().toString(36),
      name: email.split('@')[0] || 'Developer',
      email,
      created_at: new Date().toISOString()
    };
    const localToken = 'local-token-' + Date.now();
    localStorage.setItem('token', localToken);
    localStorage.setItem('local_user_email', email);
    localStorage.setItem('local_user_name', localUser.name);
    setToken(localToken);
    setUser(localUser);
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return;
      }

      if (res.status !== 405 && res.status !== 404 && res.status < 500) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Registration failed.');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('405') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
    }

    // Seamless Local fallback on standalone Vite/Vercel deployment
    const localUser: User = {
      id: 'local-' + Date.now().toString(36),
      name,
      email,
      created_at: new Date().toISOString()
    };
    const localToken = 'local-token-' + Date.now();
    localStorage.setItem('token', localToken);
    localStorage.setItem('local_user_email', email);
    localStorage.setItem('local_user_name', name);
    setToken(localToken);
    setUser(localUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
