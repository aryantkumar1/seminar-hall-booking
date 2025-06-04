// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  error?: string
  message?: string
}

export interface ApiError {
  success: false
  error: string
  message?: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'faculty'
  }
  token: string
}

export interface LoginResponse extends ApiResponse<AuthResponse> {}
export interface RegisterResponse extends ApiResponse<AuthResponse> {}

export interface HallResponse {
  id: string
  name: string
  capacity: number
  equipment: string[]
  imageUrl?: string
  imageHint?: string
  createdAt: string
  updatedAt: string
}

export interface BookingResponse {
  id: string
  hallId: string
  userId: string
  title: string
  description: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  hall?: HallResponse
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface HallsResponse extends ApiResponse<{ halls: HallResponse[] }> {}
export interface BookingsResponse extends ApiResponse<{ bookings: BookingResponse[] }> {}
export interface SingleHallResponse extends ApiResponse<{ hall: HallResponse }> {}
export interface SingleBookingResponse extends ApiResponse<{ booking: BookingResponse }> {}
