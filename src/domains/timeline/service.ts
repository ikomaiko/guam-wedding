import type { TimelineEvent, TimelineRepository, TimelineService } from './types';
import type { Family } from '@/types/app';

export class DefaultTimelineService implements TimelineService {
  constructor(private repository: TimelineRepository) {}

  async getEvents(): Promise<TimelineEvent[]> {
    return this.repository.getEvents();
  }

  async addEvent(event: Omit<TimelineEvent, 'id' | 'createdAt'>): Promise<void> {
    await this.repository.addEvent(event);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.repository.deleteEvent(id);
  }

  async getEventsByFamily(family: Family): Promise<TimelineEvent[]> {
    const events = await this.getEvents();
    return events.filter(event => event.family === family);
  }

  async getAllEventsSorted(): Promise<TimelineEvent[]> {
    const events = await this.getEvents();
    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}