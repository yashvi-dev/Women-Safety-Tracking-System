'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Trash2 } from 'lucide-react';

const guardianSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

type GuardianFormValues = z.infer<typeof guardianSchema>;

type Guardian = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const loadGuardians = async () => {
    try {
      const response = await api.get('/user/profile');
      setGuardians(response.data.guardians || []);
    } catch (error) {
      console.error('Failed to load guardians:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load guardians. Please try again.',
      });
    }
  };

  const onSubmit = async (data: GuardianFormValues) => {
    try {
      setIsLoading(true);
      await api.post('/user/guardians', data);
      
      toast({
        title: 'Guardian added',
        description: 'The guardian has been successfully added.',
      });

      form.reset();
      loadGuardians();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to add guardian',
        description: error.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (guardianId: string) => {
    try {
      setIsDeleting(guardianId);
      await api.delete(`/user/guardians/${guardianId}`);
      
      toast({
        title: 'Guardian removed',
        description: 'The guardian has been successfully removed.',
      });

      loadGuardians();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove guardian',
        description: error.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Guardian</CardTitle>
          <CardDescription>
            Add trusted contacts who will be notified in case of emergency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Guardian's name"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Guardian's email"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Guardian's phone number"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Guardian
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guardians List</CardTitle>
          <CardDescription>
            Manage your list of trusted guardians.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guardians.map((guardian) => (
                <TableRow key={guardian.id}>
                  <TableCell>{guardian.name}</TableCell>
                  <TableCell>{guardian.email}</TableCell>
                  <TableCell>{guardian.phone}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(guardian.id)}
                      disabled={isDeleting === guardian.id}
                    >
                      {isDeleting === guardian.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {guardians.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No guardians added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}