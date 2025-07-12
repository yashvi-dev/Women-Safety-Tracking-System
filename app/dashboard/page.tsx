'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSOS } from '@/contexts/sos-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, MapPin, AlertTriangle, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isTracking, startTracking, stopTracking, triggerSOS, activeIncident } = useSOS();
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (activeIncident) {
      setIncidentId(activeIncident.incidentId);
    }
  }, [activeIncident]);

  useEffect(() => {
    if (isTracking) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError('Unable to access location. Please enable location services.');
          console.error('Location error:', error);
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isTracking]);

  const handleSOSClick = async () => {
    if (!location) {
      setLocationError('Location is required to trigger SOS. Please enable location services.');
      return;
    }

    try {
      await triggerSOS(location);
    } catch (error) {
      console.error('Failed to trigger SOS:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      </div>

      {locationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={isTracking ? () => stopTracking(incidentId || '') : startTracking}
                  variant={isTracking ? 'destructive' : 'default'}
                >
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </Button>
                {isTracking && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tracking active
                  </span>
                )}
              </div>
              {location && (
                <p className="text-sm text-muted-foreground">
                  Current location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Emergency SOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                size="lg"
                variant="destructive"
                className="w-full py-8 text-lg font-bold"
                onClick={handleSOSClick}
                disabled={!isTracking || !!activeIncident}
              >
                {activeIncident ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    SOS Active
                  </>
                ) : (
                  'TRIGGER SOS'
                )}
              </Button>
              {!isTracking && (
                <p className="text-sm text-muted-foreground">
                  Location tracking must be enabled to use SOS feature
                </p>
              )}
              {activeIncident && (
                <Alert>
                  <AlertTitle>SOS Alert Active</AlertTitle>
                  <AlertDescription>
                    Your guardians have been notified and are receiving your location updates.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}