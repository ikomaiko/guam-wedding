import { Family, Visibility } from '@/types/app';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  location: string;
  family: Family;
  visibility: Visibility;
  userId: string;
  createdAt: string;
}

export interface TimelineRepository {
  getEvents(): Promise<TimelineEvent[]>;
  addEvent(event: Omit<TimelineEvent, 'id' | 'createdAt'>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
}

export interface TimelineService {
  getEvents(): Promise<TimelineEvent[]>;
  addEvent(event: Omit<TimelineEvent, 'id' | 'createdAt'>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  getEventsByFamily(family: Family): Promise<TimelineEvent[]>;
  getAllEventsSorted(): Promise<TimelineEvent[]>;
}