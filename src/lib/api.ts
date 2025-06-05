// API utility functions for making HTTP requests

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`;

      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Get token from localStorage if available (client-side only)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🔑 Using token for request:', token.substring(0, 20) + '...');
          defaultHeaders.Authorization = `Bearer ${token}`;
        } else {
          console.log('🔑 No token found in localStorage');
        }
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error [${response.status}]:`, data.error || response.statusText);

        // If we get a 401 (Unauthorized), clear the invalid token
        if (response.status === 401 && typeof window !== 'undefined') {
          console.log('🔑 Clearing invalid token due to 401 error');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Dispatch a custom event to notify other components
          window.dispatchEvent(new CustomEvent('authChanged'));
        }

        return {
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token in localStorage if login successful
    if (response.data && typeof response.data === 'object' && 'token' in response.data && typeof window !== 'undefined') {
      localStorage.setItem('token', (response.data as any).token);
    }

    return response;
  }

  async register(name: string, email: string, password: string, role: 'admin' | 'faculty') {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    // Store token in localStorage if registration successful
    if (response.data && typeof response.data === 'object' && 'token' in response.data && typeof window !== 'undefined') {
      localStorage.setItem('token', (response.data as any).token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }

    return response;
  }

  async getCurrentUser() {
    console.log('🔍 API: Calling getCurrentUser...');
    const result = this.request('/auth/me');
    console.log('🔍 API: getCurrentUser result:', result);
    return result;
  }

  // Helper method to check if we have a valid token
  hasValidToken(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Helper method to clear all auth data
  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('authChanged'));
    }
  }

  // Hall methods
  async getHalls(params?: {
    search?: string;
    minCapacity?: number;
    maxCapacity?: number;
    equipment?: string[];
  }) {
    let endpoint = '/halls';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.minCapacity) searchParams.append('minCapacity', params.minCapacity.toString());
      if (params.maxCapacity) searchParams.append('maxCapacity', params.maxCapacity.toString());
      if (params.equipment) searchParams.append('equipment', params.equipment.join(','));
      
      const queryString = searchParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }

    return this.request(endpoint);
  }

  async getHall(id: string) {
    return this.request(`/halls/${id}`);
  }

  async createHall(hallData: {
    name: string;
    capacity: number;
    equipment: string[];
    imageUrl?: string;
  }) {
    return this.request('/halls', {
      method: 'POST',
      body: JSON.stringify(hallData),
    });
  }

  async updateHall(id: string, hallData: Partial<{
    name: string;
    capacity: number;
    equipment: string[];
    imageUrl?: string;
  }>) {
    return this.request(`/halls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hallData),
    });
  }

  async deleteHall(id: string) {
    return this.request(`/halls/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking methods
  async getBookings(params?: {
    status?: 'Pending' | 'Approved' | 'Rejected';
    hallId?: string;
    facultyId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let endpoint = '/bookings';
    
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.hallId) searchParams.append('hallId', params.hallId);
      if (params.facultyId) searchParams.append('facultyId', params.facultyId);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      
      const queryString = searchParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }

    return this.request(endpoint);
  }

  async getBooking(id: string) {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(bookingData: {
    hallId: string;
    date: Date;
    startTime: string;
    endTime: string;
    purpose: string;
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        ...bookingData,
        date: bookingData.date.toISOString(),
      }),
    });
  }

  async updateBooking(id: string, bookingData: Partial<{
    date: Date;
    startTime: string;
    endTime: string;
    purpose: string;
  }>) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...bookingData,
        ...(bookingData.date && { date: bookingData.date.toISOString() }),
      }),
    });
  }

  async updateBookingStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected') {
    return this.request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // Cleanup methods
  async cleanupAllData() {
    return this.request('/cleanup/all', {
      method: 'DELETE',
    });
  }
}

// Export a singleton instance
export const api = new ApiClient();
