'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertTriangle, MapPin, MessageSquare } from 'lucide-react';

type Incident = {
  id: string;
  status: 'active' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  location: {
    lat: number;
    lng: number;
  };
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
    createdBy: {
      name: string;
    };
  }>;
};

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('user');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        activeTab === 'user' ? '/incidents/user' : '/incidents/guardian'
      );
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load incidents. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [activeTab]);

  const handleAddNote = async () => {
    if (!selectedIncident || !newNote.trim()) return;

    try {
      setIsAddingNote(true);
      await api.post(`/incidents/${selectedIncident.id}/notes`, { note: newNote });
      
      toast({
        title: 'Note added',
        description: 'Your note has been added to the incident.',
      });

      // Refresh incident details
      const response = await api.get(`/incidents/${selectedIncident.id}`);
      setSelectedIncident(response.data);
      setNewNote('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add note',
        description: 'Please try again.',
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="user">My Alerts</TabsTrigger>
          <TabsTrigger value="guardian">Guardian Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My SOS History</CardTitle>
              <CardDescription>
                View your past SOS alerts and their details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No incidents found
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <Card key={incident.id} className="cursor-pointer hover:bg-accent/50"
                      onClick={() => setSelectedIncident(incident)}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">
                              SOS Alert - {format(new Date(incident.createdAt), 'PPp')}
                            </span>
                          </div>
                          <Badge variant={getStatusColor(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {incident.location.lat.toFixed(6)}, {incident.location.lng.toFixed(6)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardian" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Guardian Alerts</CardTitle>
              <CardDescription>
                View SOS alerts from users you are guarding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No incidents found
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <Card key={incident.id} className="cursor-pointer hover:bg-accent/50"
                      onClick={() => setSelectedIncident(incident)}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">
                              SOS Alert - {format(new Date(incident.createdAt), 'PPp')}
                            </span>
                          </div>
                          <Badge variant={getStatusColor(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {incident.location.lat.toFixed(6)}, {incident.location.lng.toFixed(6)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              {selectedIncident && format(new Date(selectedIncident.createdAt), 'PPpp')}
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Badge variant={getStatusColor(selectedIncident.status)} className="ml-2">
                  {selectedIncident.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <Label>Location</Label>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {selectedIncident.location.lat.toFixed(6)}, {selectedIncident.location.lng.toFixed(6)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-4">
                    {selectedIncident.notes.map((note) => (
                      <div key={note.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{note.createdBy.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(note.createdAt), 'PPp')}
                          </span>
                        </div>
                        <p className="text-sm pl-6">{note.content}</p>
                      </div>
                    ))}
                    {selectedIncident.notes.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground">
                        No notes added yet
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={isAddingNote}
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim() || isAddingNote}>
                    {isAddingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}