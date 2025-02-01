import type { GuestType, GuestSide } from '@/types/app';

export interface User {
  id: string;
  name: string;
  side: GuestSide;
  type: GuestType;
  createdAt: string;
}

export interface AuthRepository {
  login(name: string, password: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
}

export interface AuthService {
  login(name: string, password: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
}