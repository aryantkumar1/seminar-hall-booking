
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { Hall } from '@/components/shared/HallCard'; // Assuming Hall is exported

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
  imageHint?: string | undefined;
};

interface HallContextType {
  halls: Hall[];
  addHall: (data: HallFormData) => void;
  updateHall: (hallId: string, data: HallFormData) => void;
  deleteHall: (hallId: string) => void;
  getHallById: (hallId: string) => Hall | undefined;
}

const HallContext = createContext<HallContextType | undefined>(undefined);

// Initial data for the context, using equipment labels
const initialHallsData: Hall[] = [
  { id: '1', name: 'Grand Auditorium', capacity: 200, equipment: ["Projector", "Sound System"], imageUrl: 'https://placehold.co/600x400.png', imageHint: 'large auditorium stage' },
  { id: '2', name: 'Innovation Hub', capacity: 50, equipment: ["Projector", "Whiteboard"], imageUrl: 'https://placehold.co/600x400.png', imageHint: 'modern hub computers' },
  { id: '3', name: 'Lecture Hall A', capacity: 100, equipment: ["Projector"], imageUrl: 'https://placehold.co/600x400.png', imageHint: 'lecture hall seats' },
];


export function HallProvider({ children }: { children: ReactNode }) {
  const [halls, setHalls] = useState<Hall[]>(initialHallsData);

  const addHall = useCallback((data: HallFormData) => {
    const equipmentLabels = data.equipment.map(id => availableEquipmentMap.get(id) || id);
    const newHall: Hall = {
      id: Date.now().toString(), // Simple ID generation
      name: data.name,
      capacity: data.capacity,
      equipment: equipmentLabels,
      imageUrl: data.imageUrl || 'https://placehold.co/600x400.png', // Default image
      imageHint: data.imageHint || `${data.name.toLowerCase()} interior`, // Default or auto-generated hint
    };
    setHalls(prevHalls => [...prevHalls, newHall]);
  }, []);

  const updateHall = useCallback((hallId: string, data: HallFormData) => {
    const equipmentLabels = data.equipment.map(id => availableEquipmentMap.get(id) || id);
    setHalls(prevHalls =>
      prevHalls.map(hall =>
        hall.id === hallId
          ? { 
              ...hall, 
              name: data.name,
              capacity: data.capacity,
              equipment: equipmentLabels, 
              imageUrl: data.imageUrl || hall.imageUrl, 
              imageHint: data.imageHint || hall.imageHint 
            }
          : hall
      )
    );
  }, []);

  const deleteHall = useCallback((hallId: string) => {
    setHalls(prevHalls => prevHalls.filter(hall => hall.id !== hallId));
  }, []);

  const getHallById = useCallback((hallId: string) => {
    return halls.find(hall => hall.id === hallId);
  }, [halls]);

  return (
    <HallContext.Provider value={{ halls, addHall, updateHall, deleteHall, getHallById }}>
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
