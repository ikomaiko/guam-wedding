import { Visibility } from '@/types/app';

export interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  dueType: 'week_before' | 'day_before';
  link?: string;
  visibility: Visibility;
  userId: string;
  createdAt: string;
}

export interface ChecklistRepository {
  getItems(): Promise<ChecklistItem[]>;
  addItem(item: Omit<ChecklistItem, 'id' | 'createdAt'>): Promise<void>;
  toggleComplete(id: string, isCompleted: boolean): Promise<void>;
  deleteItem(id: string): Promise<void>;
}

export interface ChecklistService {
  getItems(): Promise<ChecklistItem[]>;
  addItem(item: Omit<ChecklistItem, 'id' | 'createdAt'>): Promise<void>;
  toggleComplete(id: string): Promise<void>;
  deleteItem(id: string): Promise<void>;
  calculateProgress(userId: string): Promise<{ completed: number; total: number }>;
}