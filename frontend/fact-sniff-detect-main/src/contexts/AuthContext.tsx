import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: 'google' | 'email';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Check localStorage for user data
        const savedUser = localStorage.getItem('factSniff_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('factSniff_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulate login - in real app this would call your backend
      console.log('Logging in with', email, password);
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        name: 'Alex Johnson',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        provider: 'email'
      };
      
      setUser(mockUser);
      localStorage.setItem('factSniff_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      // Decode the JWT token from Google
      const decoded: any = jwtDecode(credential);
      
      const googleUser: User = {
        id: decoded.sub || decoded.user_id,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
        provider: 'google'
      };
      
      setUser(googleUser);
      localStorage.setItem('factSniff_user', JSON.stringify(googleUser));
      
      // In a real app, you would also send this token to your backend for verification
      console.log('Google login successful:', googleUser);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('factSniff_user');
    
    // If using Google OAuth, you might want to sign out from Google as well
    // This would require additional Google OAuth setup
    console.log('User logged out successfully');
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
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
