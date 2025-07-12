'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sos, getSocket } from '@/lib/api';
import { useAuth } from './auth-context';

type Location = {
  coordinates: [number, number];
  timestamp: Date;
  speed?: number;
  accuracy?: number;
};

type ActiveIncident = {
  incidentId: string;
  userId: string;
  userName: string;
  startTime: Date;
  currentLocation?: Location;
  locationHistory: Location[];
};

type SOSContextType = {
  activeIncidents: ActiveIncident[];
  activeIncident: ActiveIncident | null;
  isTracking: boolean;
  trackingError: string | null;
  startTracking: () => Promise<void>;
  stopTracking: (incidentId: string, notes?: string) => Promise<void>;
  updateLocation: (location: Location) => void;
  triggerSOS: (location: { lat: number; lng: number }) => Promise<void>;
};

const SOSContext = createContext<SOSContextType | undefined>(undefined);

export function SOSProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeIncidents, setActiveIncidents] = useState<ActiveIncident[]>([]);
  const [activeIncident, setActiveIncident] = useState<ActiveIncident | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for SOS alerts from users being guarded
    sos.onAlert((data) => {
      setActiveIncidents((prev) => [
        ...prev,
        {
          incidentId: data.incidentId,
          userId: data.userId,
          userName: data.userName,
          startTime: new Date(data.startTime),
          locationHistory: []
        }
      ]);
    });

    // Listen for location updates
    sos.onLocationUpdate((data) => {
      setActiveIncidents((prev) =>
        prev.map((incident) => {
          if (incident.incidentId === data.incidentId) {
            const newLocation = {
              coordinates: data.location.coordinates,
              timestamp: new Date(data.location.timestamp),
              speed: data.location.speed,
              accuracy: data.location.accuracy
            };
            return {
              ...incident,
              currentLocation: newLocation,
              locationHistory: [...incident.locationHistory, newLocation]
            };
          }
          return incident;
        })
      );
    });

    // Listen for resolved incidents
    sos.onResolved((data) => {
      setActiveIncidents((prev) =>
        prev.filter((incident) => incident.incidentId !== data.incidentId)
      );

      // If this was our incident, stop tracking
      if (isTracking) {
        stopLocationTracking();
        setIsTracking(false);
      }
    });

    return () => {
      socket.off('sos_alert');
      socket.off('location_update');
      socket.off('sos_resolved');
    };
  }, [isTracking]);

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setTrackingError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          coordinates: [
            position.coords.longitude,
            position.coords.latitude
          ] as [number, number],
          timestamp: new Date(),
          speed: position.coords.speed || 0,
          accuracy: position.coords.accuracy
        };

        updateLocation(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setTrackingError('Failed to get location updates');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const triggerSOS = async (location: { lat: number; lng: number }) => {
    try {
      setTrackingError(null);
      sos.trigger();
      setIsTracking(true);
      startLocationTracking();
    } catch (error) {
      console.error('Error triggering SOS:', error);
      setTrackingError('Failed to trigger SOS');
      throw error;
    }
  };

  const startTracking = async () => {
    try {
      setTrackingError(null);
      sos.trigger();
      setIsTracking(true);
      startLocationTracking();
    } catch (error) {
      console.error('Error starting SOS:', error);
      setTrackingError('Failed to start SOS tracking');
      throw error;
    }
  };

  const stopTracking = async (incidentId: string, notes?: string) => {
    try {
      await sos.resolve({ incidentId, notes });
      stopLocationTracking();
      setIsTracking(false);
      setTrackingError(null);
    } catch (error) {
      console.error('Error stopping SOS:', error);
      setTrackingError('Failed to stop SOS tracking');
      throw error;
    }
  };

  const updateLocation = (location: Location) => {
    try {
      sos.updateLocation({
        coordinates: location.coordinates,
        speed: location.speed,
        accuracy: location.accuracy
      });
    } catch (error) {
      console.error('Error updating location:', error);
      setTrackingError('Failed to update location');
    }
  };

  return (
    <SOSContext.Provider
      value={{
        activeIncidents,
        activeIncident,
        isTracking,
        trackingError,
        startTracking,
        stopTracking,
        updateLocation,
        triggerSOS
      }}
    >
      {children}
    </SOSContext.Provider>
  );
}

export function useSOS() {
  const context = useContext(SOSContext);
  if (context === undefined) {
    throw new Error('useSOS must be used within a SOSProvider');
  }
  return context;
}