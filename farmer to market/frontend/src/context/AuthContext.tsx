import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USER } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'buyer' | 'farmer' | 'admin') => Promise<User>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('farmer_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, role: 'buyer' | 'farmer' | 'admin' = 'buyer'): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo: allow any login, but return MOCK_USER or MOCK_ADMIN based on email
    let mockUser = email.includes('admin')
      ? { ...MOCK_USER, role: 'admin', email: 'admin@farmmarket.com' }
      : email.includes('farmer')
        ? { ...MOCK_USER, role: 'farmer', email, farmName: 'Sunset Valley Organics', farmLocation: 'Stellenbosch' }
        : MOCK_USER;

    if (role !== 'admin' && role !== 'buyer' && role !== 'farmer') return mockUser;

    // Override role based on login selection for demo purposes
    if (!email.includes('admin')) {
      mockUser.role = role;
    }

    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('farmer_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('farmer_user');
  };

  const register = async (userData: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = {
      ...MOCK_USER,
      ...userData,
      id: 'u' + Date.now(),
      role: userData.role || 'buyer'
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('farmer_user', JSON.stringify(newUser));
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
