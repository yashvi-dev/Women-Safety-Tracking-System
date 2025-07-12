import axios from 'axios';
import { Socket, io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.IO instance
let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (socket) {
    socket.close();
  }

  socket = io(API_URL.replace('/api', ''), {
    auth: { token },
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

// Auth API
export const auth = {
  register: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    fcmToken?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string; fcmToken?: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  updateFCMToken: async (fcmToken: string) => {
    const response = await api.put('/auth/fcm-token', { fcmToken });
    return response.data;
  }
};

// User API
export const user = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; phone?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  addGuardian: async (data: {
    name: string;
    email: string;
    phone: string;
  }) => {
    const response = await api.post('/users/guardians', data);
    return response.data;
  },

  removeGuardian: async (guardianId: string) => {
    const response = await api.delete(`/users/guardians/${guardianId}`);
    return response.data;
  },

  addSafeZone: async (data: {
    name: string;
    coordinates: [number, number][];
  }) => {
    const response = await api.post('/users/safe-zones', data);
    return response.data;
  },

  removeSafeZone: async (zoneId: string) => {
    const response = await api.delete(`/users/safe-zones/${zoneId}`);
    return response.data;
  }
};

// Incident API
export const incident = {
  getUserIncidents: async (params?: {
    status?: 'active' | 'resolved' | 'false_alarm';
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/incidents/user', { params });
    return response.data;
  },

  getGuardianIncidents: async (params?: {
    status?: 'active' | 'resolved' | 'false_alarm';
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/incidents/guardian', { params });
    return response.data;
  },

  getIncidentDetails: async (incidentId: string) => {
    const response = await api.get(`/incidents/${incidentId}`);
    return response.data;
  },

  getLocationHistory: async (incidentId: string) => {
    const response = await api.get(`/incidents/${incidentId}/location-history`);
    return response.data;
  },

  addNote: async (incidentId: string, note: string) => {
    const response = await api.post(`/incidents/${incidentId}/notes`, { note });
    return response.data;
  }
};

// SOS Functions
export const sos = {
  trigger: () => {
    if (!socket?.connected) {
      throw new Error('Socket not connected');
    }
    socket.emit('sos_trigger');
  },

  updateLocation: (data: {
    coordinates: [number, number];
    speed?: number;
    accuracy?: number;
  }) => {
    if (!socket?.connected) {
      throw new Error('Socket not connected');
    }
    socket.emit('location_update', data);
  },

  resolve: (data: { incidentId: string; notes?: string }) => {
    if (!socket?.connected) {
      throw new Error('Socket not connected');
    }
    socket.emit('resolve_sos', data);
  },

  onAlert: (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('sos_alert', callback);
  },

  onLocationUpdate: (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('location_update', callback);
  },

  onResolved: (callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('sos_resolved', callback);
  }
};