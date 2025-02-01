export type DueType = "week_before" | "day_before";
export type Family = "ikoma" | "onohara";
export type Visibility = "private" | "family" | "public";

export interface ChecklistItem {
  id: string;
  content: string;
  due_type?: DueType; // stringからDueTypeに変更
  link?: string;
  visibility: Visibility; // stringからVisibilityに変更
  created_at: string; // createdAtからcreated_atに変更
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
  user_id: string; // userIdからuser_idに変更
  family: Family; // オプショナルを削除し、必須プロパティに変更
  created_at: string; // createdAtからcreated_atに変更
}

export type GuestType =
  | "新郎本人"
  | "新婦本人"
  | "親"
  | "兄弟姉妹"
  | "親族"
  | "友人"
  | "同僒"
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
