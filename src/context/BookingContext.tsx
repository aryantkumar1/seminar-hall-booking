
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

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
  loading: boolean;
  addBooking: (data: BookingFormData, facultyId: string, facultyName: string) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: 'Approved' | 'Rejected') => Promise<boolean>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  getBookingById: (bookingId: string) => Booking | undefined;
  getFacultyBookings: (facultyId: string) => Booking[];
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Transform backend booking data to frontend format
const transformBooking = (booking: any): Booking | null => {
  // Check if booking is null or undefined
  if (!booking || !booking._id) {
    console.warn('⚠️ Invalid booking data received:', booking);
    return null;
  }

  try {
    return {
      id: booking._id.toString(),
      hallId: booking.hallId?._id ? booking.hallId._id.toString() : booking.hallId?.toString() || '',
      hallName: booking.hallId?.name || booking.hallName || 'Unknown Hall',
      facultyId: booking.facultyId?._id ? booking.facultyId._id.toString() : booking.facultyId?.toString() || '',
      facultyName: booking.facultyId?.name || booking.facultyName || 'Unknown Faculty',
      date: new Date(booking.date),
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      purpose: booking.purpose || '',
      status: booking.status || 'Pending',
    };
  } catch (error) {
    console.error('❌ Error transforming booking:', error, booking);
    return null;
  }
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load bookings from backend
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getBookings();
      if (response.data && typeof response.data === 'object' && 'bookings' in response.data) {
        const transformedBookings = (response.data as any).bookings
          .map(transformBooking)
          .filter((booking: any): booking is Booking => booking !== null);
        setBookings(transformedBookings);
      }
    } catch (error) {
      // Don't show errors on login pages
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/login') || currentPath.includes('/register');

      if (!isLoginPage) {
        console.error('Error loading bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bookings',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load bookings when component mounts and when authentication changes
  useEffect(() => {
    const checkAndLoadBookings = () => {
      // Only load if we're in browser and have a valid token
      if (api.hasValidToken()) {
        console.log('📅 Loading bookings with valid authentication');
        loadBookings();
      } else {
        console.log('📅 No valid authentication, skipping bookings load');
        setLoading(false); // Stop loading if no token
      }
    };

    // Initial load
    checkAndLoadBookings();

    // Also listen for storage changes (when user logs in)
    const handleStorageChange = () => {
      checkAndLoadBookings();
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for when login completes
    const handleAuthChange = () => {
      setTimeout(checkAndLoadBookings, 100); // Small delay to ensure token is stored
    };

    window.addEventListener('authChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, [loadBookings]);

  const addBooking = useCallback(async (data: BookingFormData, facultyId: string, facultyName: string): Promise<boolean> => {
    try {
      const response = await api.createBooking({
        hallId: data.hallId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
      });

      if (response.data && typeof response.data === 'object' && 'booking' in response.data) {
        const transformedBooking = transformBooking((response.data as any).booking);
        if (transformedBooking) {
          setBookings(prevBookings => [...prevBookings, transformedBooking]);
        }
        toast({
          title: "Booking Request Submitted!",
          description: `Your request for ${data.hallName} on ${data.date.toLocaleDateString()} has been sent.`,
          className: "bg-primary text-primary-foreground",
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create booking',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: 'Approved' | 'Rejected'): Promise<boolean> => {
    try {
      const response = await api.updateBookingStatus(bookingId, status);

      if ((response.data && typeof response.data === 'object' && 'booking' in response.data) || !response.error) {
        // Update the booking in the local state
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

        // Local state is already updated above - no need for backend refresh

        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update booking status',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
      return false;
    }
  }, [bookings, toast]);

  const getBookingById = useCallback((bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId);
  }, [bookings]);

  const getFacultyBookings = useCallback((facultyId: string) => {
    return bookings.filter(booking => booking.facultyId === facultyId);
  }, [bookings]);

  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      const response = await api.deleteBooking(bookingId);
      if (response.data || !response.error) {
        // Remove the booking from the local state
        setBookings(prevBookings =>
          prevBookings.filter(booking => booking.id !== bookingId)
        );

        toast({
          title: 'Booking Cancelled',
          description: 'The booking has been successfully cancelled.',
          className: "bg-blue-600 text-white",
        });

        return true;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to cancel booking',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const refreshBookings = useCallback(async () => {
    await loadBookings();
  }, [loadBookings]);

  const contextValue = useMemo(() => ({
    bookings,
    loading,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    getBookingById,
    getFacultyBookings,
    refreshBookings,
  }), [bookings, loading, addBooking, updateBookingStatus, deleteBooking, getBookingById, getFacultyBookings, refreshBookings]);

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
