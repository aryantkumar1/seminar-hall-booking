
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Hall } from '@/components/shared/HallCard'; // Assuming Hall is exported
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// This map should ideally be sourced from a shared constants file
const availableEquipmentMap = new Map([
  ["projector", "Projector"],
  ["whiteboard", "Whiteboard"],
  ["sound_system", "Sound System"],
  ["microphone", "Microphone"],
  ["video_conference", "Video Conferencing"],
]);

// This is equivalent to HallFormValues from the form pages
export type HallFormData = {
  name: string;
  capacity: number;
  equipment: string[]; // These are IDs: "projector", "whiteboard"
  imageUrl?: string | undefined;
};

interface HallContextType {
  halls: Hall[];
  loading: boolean;
  addHall: (data: HallFormData) => Promise<boolean>;
  updateHall: (hallId: string, data: HallFormData) => Promise<boolean>;
  deleteHall: (hallId: string) => Promise<boolean>;
  getHallById: (hallId: string) => Hall | undefined;
  refreshHalls: () => Promise<void>;
  initializeHalls: () => Promise<void>;
}

const HallContext = createContext<HallContextType | undefined>(undefined);

export function HallProvider({ children }: { children: ReactNode }) {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load halls when component mounts and when authentication changes
  useEffect(() => {
    const checkAndLoadHalls = () => {
      // Only load if we're in browser and have a token
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
          console.log('🏢 Loading halls with valid authentication');
          loadHalls();
        } else {
          console.log('🏢 No valid authentication, skipping halls load');
          setLoading(false); // Stop loading if no token
        }
      }
    };

    // Initial load
    checkAndLoadHalls();

    // Also listen for storage changes (when user logs in)
    const handleStorageChange = () => {
      checkAndLoadHalls();
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for when login completes
    const handleAuthChange = () => {
      setTimeout(checkAndLoadHalls, 100); // Small delay to ensure token is stored
    };

    window.addEventListener('authChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const loadHalls = async () => {
    try {
      setLoading(true);
      const response = await api.getHalls();
      if (response.data && typeof response.data === 'object' && 'halls' in response.data) {
        setHalls((response.data as any).halls);
      } else if (response.error) {
        // Don't show errors on login pages
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('/login') || currentPath.includes('/register');

        if (!isLoginPage) {
          console.error('Failed to load halls:', response.error);
          toast({
            title: 'Error',
            description: 'Failed to load halls',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      // Don't show errors on login pages
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/login') || currentPath.includes('/register');

      if (!isLoginPage) {
        console.error('Error loading halls:', error);
        toast({
          title: 'Error',
          description: 'Failed to load halls',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addHall = useCallback(async (data: HallFormData): Promise<boolean> => {
    try {
      console.log('🏢 Creating hall with data:', data);
      const hallPayload = {
        name: data.name,
        capacity: data.capacity,
        equipment: data.equipment.map(id => availableEquipmentMap.get(id) || id),
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
      };
      console.log('🏢 Sending payload:', hallPayload);

      const response = await api.createHall(hallPayload);

      if (response.data && typeof response.data === 'object' && 'hall' in response.data) {
        setHalls(prevHalls => [...prevHalls, (response.data as any).hall]);
        toast({
          title: 'Success',
          description: 'Hall created successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create hall',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating hall:', error);
      toast({
        title: 'Error',
        description: 'Failed to create hall',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const updateHall = useCallback(async (hallId: string, data: HallFormData): Promise<boolean> => {
    try {
      const response = await api.updateHall(hallId, {
        name: data.name,
        capacity: data.capacity,
        equipment: data.equipment.map(id => availableEquipmentMap.get(id) || id),
        imageUrl: data.imageUrl,
      });

      if (response.data && typeof response.data === 'object' && 'hall' in response.data) {
        setHalls(prevHalls =>
          prevHalls.map(hall =>
            hall.id === hallId ? (response.data as any).hall : hall
          )
        );
        toast({
          title: 'Success',
          description: 'Hall updated successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update hall',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating hall:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hall',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const deleteHall = useCallback(async (hallId: string): Promise<boolean> => {
    try {
      const response = await api.deleteHall(hallId);

      if (response.data || !response.error) {
        setHalls(prevHalls => prevHalls.filter(hall => hall.id !== hallId));
        toast({
          title: 'Success',
          description: 'Hall deleted successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete hall',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting hall:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hall',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const getHallById = useCallback((hallId: string) => {
    return halls.find(hall => hall.id === hallId);
  }, [halls]);

  const refreshHalls = useCallback(async () => {
    await loadHalls();
  }, []);

  // Method to manually trigger loading (useful after login)
  const initializeHalls = useCallback(async () => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      await loadHalls();
    }
  }, []);

  return (
    <HallContext.Provider value={{ halls, loading, addHall, updateHall, deleteHall, getHallById, refreshHalls, initializeHalls }}>
      {children}
    </HallContext.Provider>
  );
}

export function useHalls() {
  const context = useContext(HallContext);
  if (context === undefined) {
    throw new Error('useHalls must be used within a HallProvider');
  }
  return context;
}
