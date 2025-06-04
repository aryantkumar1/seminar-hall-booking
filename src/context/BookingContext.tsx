
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  hallId: string;
  hallName: string;
  facultyId: string;
  facultyName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface BookingFormData {
  hallId: string;
  hallName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (data: BookingFormData, facultyId: string, facultyName: string) => void;
  updateBookingStatus: (bookingId: string, status: 'Approved' | 'Rejected') => void;
  getBookingById: (bookingId: string) => Booking | undefined;
  getFacultyBookings: (facultyId: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialBookings: Booking[] = [
  { id: 'bkg1', hallId: '1', hallName: 'Grand Auditorium', facultyId: 'faculty123', facultyName: 'Dr. Eva Core', date: new Date(new Date().getFullYear(), new Date().getMonth(), 20), startTime: '10:00', endTime: '12:00', purpose: 'Existing Department Meeting', status: 'Approved' },
  { id: 'bkg2', hallId: '2', hallName: 'Innovation Hub', facultyId: 'faculty007', facultyName: 'Dr. Current User', date: new Date(new Date().getFullYear(), new Date().getMonth(), 25), startTime: '14:00', endTime: '15:30', purpose: 'Research Presentation', status: 'Pending' },
  { id: 'bkg3', hallId: '3', hallName: 'Lecture Hall A', facultyId: 'faculty123', facultyName: 'Dr. Eva Core', date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5), startTime: '09:00', endTime: '11:00', purpose: 'Student Workshop', status: 'Approved' },
];

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const { toast } = useToast();

  const addBooking = useCallback((data: BookingFormData, facultyId: string, facultyName: string) => {
    const newBooking: Booking = {
      id: `bkg-${Date.now().toString()}`, // Simple ID generation
      ...data,
      facultyId,
      facultyName,
      status: 'Pending',
    };
    setBookings(prevBookings => [...prevBookings, newBooking]);
    toast({
      title: "Booking Request Submitted!",
      description: `Your request for ${data.hallName} on ${data.date.toLocaleDateString()} has been sent.`,
      className: "bg-primary text-primary-foreground",
    });
  }, [toast]);

  const updateBookingStatus = useCallback((bookingId: string, status: 'Approved' | 'Rejected') => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        toast({
            title: `Booking ${status}`,
            description: `Booking for ${booking.hallName} by ${booking.facultyName} has been ${status.toLowerCase()}.`,
            variant: status === 'Approved' ? 'default' : 'destructive',
        });
    }
  }, [bookings, toast]);

  const getBookingById = useCallback((bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId);
  }, [bookings]);

  const getFacultyBookings = useCallback((facultyId: string) => {
    return bookings.filter(booking => booking.facultyId === facultyId);
  }, [bookings]);
  
  const contextValue = useMemo(() => ({
    bookings,
    addBooking,
    updateBookingStatus,
    getBookingById,
    getFacultyBookings,
  }), [bookings, addBooking, updateBookingStatus, getBookingById, getFacultyBookings]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
