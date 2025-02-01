export type DueType = "week_before" | "day_before";
export type Visibility = "private" | "family" | "public";

export interface ChecklistItem {
  id: string;
  content: string;
  due_type?: DueType;
  link?: string;
  visibility: Visibility;
  created_at: string;
}

export interface ChecklistState {
  id: string;
  checklist_item_id: string;
  user_id: string;
  is_completed: boolean;
  created_at: string;
}

export interface ChecklistItemWithState extends ChecklistItem {
  is_completed: boolean;
  user_id: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  location: string;
  visibility: Visibility;
  user_id: string;
  side: GuestSide;
  created_at: string;
}

export type GuestType =
  | "父"
  | "母"
  | "新郎本人"
  | "新婦本人"
  | "祖父"
  | "祖母"
  | "兄"
  | "姪"
  | "甥"
  | "親"
  | "兄弟姉妹"
  | "親族"
  | "友人"
  | "同僚"
  | "その他";

export type GuestSide = "新郎側" | "新婦側";

export interface Guest {
  id: string;
  name: string;
  password: string;
  side: GuestSide;
  type: GuestType;
  createdAt?: string;
}