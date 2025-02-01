import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { AuthRepository, User } from './types';
import type { Database } from '@/types/supabase';

export class SupabaseAuthRepository implements AuthRepository {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  async login(name: string, password: string): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.signInWithPassword({
      email: `${name}@example.com`, // 仮のメールアドレス
      password
    });

    if (error || !user) return null;

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      side: profile.side,
      type: profile.type,
      createdAt: profile.created_at
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      side: profile.side,
      type: profile.type,
      createdAt: profile.created_at
    };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}