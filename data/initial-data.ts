import type { ChecklistItem, ChecklistState, TimelineEvent, Guest } from '@/types/app';

export const initialChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    content: '入国申請をした',
    due_type: 'week_before',
    link: 'https://www.visitguam.jp/planning/immigration-to-guam/',
    visibility: 'public',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    content: 'ムームーを受け取った',
    due_type: 'week_before',
    visibility: 'public',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    content: 'Wi-FiもしくはSimカードの予約をした',
    due_type: 'week_before',
    visibility: 'public',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    content: 'パスポートを持った',
    due_type: 'day_before',
    visibility: 'public',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    content: 'ムームーを持った',
    due_type: 'day_before',
    visibility: 'public',
    created_at: new Date().toISOString()
  }
];

// チェックリストの初期状態
export const initialChecklistStates: ChecklistState[] = [
  {
    id: '1',
    checklist_item_id: '1',
    user_id: '1',
    is_completed: false,
    created_at: new Date().toISOString()
  },
  // 必要に応じて他のアイテムの状態を追加
];

export const initialTimelineEvents = {
  ikoma: [
    {
      id: '1',
      date: '2025/02/08 18:00',
      title: '成田空港集合',
      location: '成田国際空港',
      visibility: 'family',
      user_id: '1',
      created_at: new Date().toISOString(),
      family: 'ikoma'
    },
    {
      id: '2',
      date: '2025/02/09 10:00',
      title: 'ホテルチェックイン',
      location: 'ロッテホテルグアム',
      visibility: 'public',
      user_id: '1',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      date: '2025/02/10 09:00',
      title: '市内観光',
      location: 'タモン地区',
      visibility: 'family',
      user_id: '1',
      created_at: new Date().toISOString()
    }
  ],
  onohara: [
    {
      id: '4',
      date: '2025/02/07 11:40',
      title: '中部国際空港出発',
      location: '中部国際空港',
      visibility: 'public',
      user_id: '2',
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      date: '2025/02/07 16:15',
      title: 'グアム国際空港到着',
      location: 'グアム国際空港',
      visibility: 'public',
      user_id: '2',
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      date: '2025/02/07 18:30',
      title: '夕食',
      location: 'グアムニッコー サンセットバーベキュー',
      visibility: 'family',
      user_id: '2',
      created_at: new Date().toISOString()
    },
    {
      id: '7',
      date: '2025/02/10 07:25',
      title: 'グアム国際空港出発',
      location: 'グアム国際空港',
      visibility: 'public',
      user_id: '2',
      created_at: new Date().toISOString()
    },
    {
      id: '8',
      date: '2025/02/10 10:20',
      title: '中部国際空港到着',
      location: '中部国際空港',
      visibility: 'public',
      user_id: '2',
      created_at: new Date().toISOString()
    }
  ]
};

export const initialGuests: Guest[] = [
  {
    id: '1',
    name: '生駒大貴',
    password: '1234',
    side: '新郎側',
    type: '新郎本人',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '小野原弥香',
    password: '1234',
    side: '新婦側',
    type: '新婦本人',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: '生駒竜二',
    password: '1234',
    side: '新郎側',
    type: '親',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: '生駒久美子',
    password: '1234',
    side: '新郎側',
    type: '親',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: '小野原雅通',
    password: '1234',
    side: '新婦側',
    type: '親',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: '小野原理恵',
    password: '1234',
    side: '新婦側',
    type: '親',
    createdAt: new Date().toISOString()
  }
];