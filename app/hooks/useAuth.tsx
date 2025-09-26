'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, cookies, User } from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  console.log(authAPI)
  console.log(user)

  useEffect(() => {
    const token = authAPI.getToken();
    const userData = authAPI.getUser();
    
    if (token && userData) {
      setUser(userData);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password:string, redirectTo?: string) => {
    try {
        const response = await authAPI.login(email, password);
        console.log(response);

        if (response.success && response.data[0]?.access_token) {
            // Get the user data object to avoid repetition
            const userData = response.data[0];

            // Set the token
            cookies.set('authToken', userData.access_token, 7);

            // ✅ CORRECTED: Use the full 'userData' object
            cookies.set('userData', JSON.stringify(userData), 7);
            
            // ✅ CORRECTED: Set the state with the full 'userData' object
            setUser(userData);

            const redirectUrl =
                redirectTo ||
                new URLSearchParams(window.location.search).get('redirect') ||
                '/doctor';
            window.location.href = redirectUrl;

        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        throw error;
    }
};


  const logout = () => {
    authAPI.logout();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
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


