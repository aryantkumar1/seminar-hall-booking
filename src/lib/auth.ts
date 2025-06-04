import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Allow build to proceed without JWT_SECRET (will be set at runtime)
const JWT_SECRET = process.env.JWT_SECRET || 'build-time-placeholder';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'faculty';
  name: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'build-time-placeholder') {
    throw new Error('Invalid/Missing environment variable: "JWT_SECRET"');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'build-time-placeholder') {
    throw new Error('Invalid/Missing environment variable: "JWT_SECRET"');
  }
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Extract token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
}

// Middleware to verify authentication
export function verifyAuth(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// Check if user has required role
export function hasRole(user: JWTPayload, requiredRole: 'admin' | 'faculty'): boolean {
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  // Faculty can access faculty routes, admin can access both
  return user.role === 'faculty' || user.role === 'admin';
}
