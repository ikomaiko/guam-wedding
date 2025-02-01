import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { TimelineEvent, TimelineRepository } from './types';
import type { Database } from '@/types/supabase';

export class SupabaseTimelineRepository implements TimelineRepository {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  async getEvents(): Promise<TimelineEvent[]> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data as unknown as TimelineEvent[];
  }

  async addEvent(event: Omit<TimelineEvent, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await this.supabase
      .from('timeline_events')
      .insert({
        date: event.date,
        title: event.title,
        location: event.location,
        family: event.family,
        visibility: event.visibility,
        user_id: event.userId
      });

    if (error) throw error;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('timeline_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}