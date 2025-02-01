import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GuestType } from '@/types/app';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortByGuestType(type: GuestType): number {
  const order: Record<GuestType, number> = {
    "父": 1,
    "母": 2,
    "新郎本人": 3,
    "新婦本人": 4,
    "祖父": 5,
    "祖母": 6,
    "兄": 7,
    "姪": 8,
    "甥": 9,
    "親": 10,
    "兄弟姉妹": 11,
    "親族": 12,
    "友人": 13,
    "同僚": 14,
    "その他": 15
  };
  return order[type] || 999;
}