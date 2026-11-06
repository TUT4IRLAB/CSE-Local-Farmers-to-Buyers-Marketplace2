import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role: 'buyer' | 'farmer';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (input: RegisterInput) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toUiUser = (u: any): User => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName || u.username || u.email,
  role: u.role,
  avatarUrl: `https://i.pravatar.cc/150?u=${u.id}`,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('farmer_user');
    const token = localStorage.getItem('token');
    if (saved && token) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('farmer_user');
      }
      // Revalidate the session against the API
      api
        .get('/auth/me')
        .then((res) => {
          const fresh = toUiUser(res.data);
          setUser(fresh);
          localStorage.setItem('farmer_user', JSON.stringify(fresh));
        })
        .catch(() => {
          /* 401 handled by the interceptor */
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const uiUser = toUiUser(res.data.user);
    localStorage.setItem('farmer_user', JSON.stringify(uiUser));
    setUser(uiUser);
    return uiUser;
  };

  const register = async (input: RegisterInput): Promise<User> => {
    await api.post('/auth/register', {
      username: input.fullName,
      email: input.email,
      password: input.password,
      role: input.role,
    });
    // Registration succeeded -> log in to get a token
    return login(input.email, input.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmer_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
