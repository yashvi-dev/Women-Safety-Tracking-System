'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import MapView from '@/components/map-view';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';

const safeZoneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type SafeZoneFormValues = z.infer<typeof safeZoneSchema>;

type SafeZone = {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
};

export default function SafeZonesPage() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const { toast } = useToast();

  const form = useForm<SafeZoneFormValues>({
    resolver: zodResolver(safeZoneSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    // Get user's current location for initial map center
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Default to a fallback location if geolocation fails
        setCenter({ lat: 51.5074, lng: -0.1278 }); // London coordinates as fallback
      }
    );

    loadSafeZones();
  }, []);

  const loadSafeZones = async () => {
    try {
      const response = await api.get('/user/safe-zones');
      setSafeZones(response.data.safeZones);
    } catch (error) {
      console.error('Failed to load safe zones:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load safe zones. Please try again.',
      });
    }
  };

  const onSubmit = async (data: SafeZoneFormValues) => {
    if (selectedPoints.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Invalid Area',
        description: 'Please select at least 3 points to create a safe zone.',
      });
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/user/safe-zones', {
        name: data.name,
        coordinates: selectedPoints,
      });
      
      toast({
        title: 'Safe zone added',
        description: 'The safe zone has been successfully created.',
      });

      form.reset();
      setSelectedPoints([]);
      loadSafeZones();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to add safe zone',
        description: error.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (zoneId: string) => {
    try {
      setIsDeleting(zoneId);
      await api.delete(`/user/safe-zones/${zoneId}`);
      
      toast({
        title: 'Safe zone removed',
        description: 'The safe zone has been successfully removed.',
      });

      loadSafeZones();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove safe zone',
        description: error.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleMapClick = (location: { lat: number; lng: number }) => {
    setSelectedPoints((prev) => [...prev, location]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Safe Zones</CardTitle>
          <CardDescription>
            Define areas where you frequently visit and feel safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <MapView
              center={center}
              onMapClick={handleMapClick}
              polygons={[
                ...safeZones.map((zone) => ({
                  points: zone.coordinates,
                  color: '#4CAF50',
                  fillColor: '#4CAF50',
                })),
                selectedPoints.length > 0
                  ? {
                      points: selectedPoints,
                      color: '#2196F3',
                      fillColor: '#2196F3',
                    }
                  : null,
              ].filter(Boolean) as Array<{ points: Array<{ lat: number; lng: number }>; color: string; fillColor: string }>}
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a name for this safe zone"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isLoading || selectedPoints.length < 3}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Safe Zone
                </Button>
                {selectedPoints.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedPoints([])}
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Safe Zones</CardTitle>
          <CardDescription>
            Manage your existing safe zones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeZones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <span className="font-medium">{zone.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(zone.id)}
                  disabled={isDeleting === zone.id}
                >
                  {isDeleting === zone.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            ))}
            {safeZones.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No safe zones added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}