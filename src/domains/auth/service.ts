import type { AuthRepository, AuthService, User } from './types';

export class DefaultAuthService implements AuthService {
  constructor(private repository: AuthRepository) {}

  async login(name: string, password: string): Promise<User | null> {
    return this.repository.login(name, password);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.repository.getCurrentUser();
  }

  async logout(): Promise<void> {
    await this.repository.logout();
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}