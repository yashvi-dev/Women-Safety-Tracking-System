'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, user as userApi, initializeSocket } from '@/lib/api';

type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  fcmToken?: string;
  guardians: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
  }>;
  safeZones: Array<{
    _id: string;
    name: string;
    coordinates: {
      type: string;
      coordinates: number[][]; // [ [lng, lat], [lng, lat], ... ]
    };
  }>;
};

export type { User };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, fcmToken?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    fcmToken?: string;
  }) => Promise<void>;
  logout: () => void;
  updateFCMToken: (token: string) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      initializeSocket(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await userApi.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, fcmToken?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auth.login({ email, password, fcmToken });
      localStorage.setItem('token', response.token);
      initializeSocket(response.token);
      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    fcmToken?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await auth.register(data);
      localStorage.setItem('token', response.token);
      initializeSocket(response.token);
      setUser(response.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    try {
      const response = await userApi.updateProfile(data);
      setUser(response.user);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateFCMToken = async (token: string) => {
    try {
      await auth.updateFCMToken(token);
      if (user) {
        setUser({ ...user, fcmToken: token });
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateFCMToken,
        updateProfile,
      }}
    >
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
