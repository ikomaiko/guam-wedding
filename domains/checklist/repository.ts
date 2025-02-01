import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { ChecklistItem, ChecklistRepository } from './types';
import type { Database } from '@/types/supabase';

export class SupabaseChecklistRepository implements ChecklistRepository {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  async getItems(): Promise<ChecklistItem[]> {
    const { data, error } = await this.supabase
      .from('checklist_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as unknown as ChecklistItem[];
  }

  async addItem(item: Omit<ChecklistItem, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_items')
      .insert({
        content: item.content,
        due_type: item.dueType,
        visibility: item.visibility,
        user_id: item.userId,
        link: item.link
      });

    if (error) throw error;
  }

  async toggleComplete(id: string, isCompleted: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_items')
      .update({ is_completed: isCompleted })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}