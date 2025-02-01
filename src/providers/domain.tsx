'use client';

import { createContext, useContext } from 'react';
import { SupabaseAuthRepository } from '@/domains/auth/repository';
import { DefaultAuthService } from '@/domains/auth/service';
import { SupabaseChecklistRepository } from '@/domains/checklist/repository';
import { DefaultChecklistService } from '@/domains/checklist/service';
import { SupabaseTimelineRepository } from '@/domains/timeline/repository';
import { DefaultTimelineService } from '@/domains/timeline/service';
import type { AuthService } from '@/domains/auth/types';
import type { ChecklistService } from '@/domains/checklist/types';
import type { TimelineService } from '@/domains/timeline/types';

interface DomainServices {
  auth: AuthService;
  checklist: ChecklistService;
  timeline: TimelineService;
}

const DomainContext = createContext<DomainServices | null>(null);

export function DomainProvider({ children }: { children: React.ReactNode }) {
  // リポジトリの初期化
  const authRepository = new SupabaseAuthRepository();
  const checklistRepository = new SupabaseChecklistRepository();
  const timelineRepository = new SupabaseTimelineRepository();

  // サービスの初期化
  const services: DomainServices = {
    auth: new DefaultAuthService(authRepository),
    checklist: new DefaultChecklistService(checklistRepository),
    timeline: new DefaultTimelineService(timelineRepository)
  };

  return (
    <DomainContext.Provider value={services}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomainServices() {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomainServices must be used within a DomainProvider');
  }
  return context;
}