import type { ChecklistItem, ChecklistRepository, ChecklistService } from './types';

export class DefaultChecklistService implements ChecklistService {
  constructor(private repository: ChecklistRepository) {}

  async getItems(): Promise<ChecklistItem[]> {
    return this.repository.getItems();
  }

  async addItem(item: Omit<ChecklistItem, 'id' | 'createdAt'>): Promise<void> {
    await this.repository.addItem(item);
  }

  async toggleComplete(id: string): Promise<void> {
    const items = await this.getItems();
    const item = items.find(item => item.id === id);
    if (!item) throw new Error('Item not found');

    await this.repository.toggleComplete(id, !item.isCompleted);
  }

  async deleteItem(id: string): Promise<void> {
    await this.repository.deleteItem(id);
  }

  async calculateProgress(userId: string): Promise<{ completed: number; total: number }> {
    const items = await this.getItems();
    const publicItems = items.filter(item => item.visibility === 'public');
    const completed = publicItems.filter(item => 
      item.isCompleted && item.userId === userId
    ).length;

    return {
      completed,
      total: publicItems.length
    };
  }
}