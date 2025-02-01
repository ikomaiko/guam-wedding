import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context"; // パスを修正
import type {
  ChecklistItem,
  ChecklistState,
  ChecklistItemWithState,
} from "@/types/app";

export const useChecklistSupabase = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItemWithState[]>([]);

  const fetchItems = useCallback(async () => {
    if (!user) return;

    // チェックリストのマスターデータを取得
    const { data: checklistItems, error: itemsError } = await supabase
      .from("checklist_items")
      .select("*");

    if (itemsError) {
      console.error("Error fetching checklist items:", itemsError);
      return;
    }

    // 現在のユーザーのチェック状態を取得
    const { data: states, error: statesError } = await supabase
      .from("checklist_states")
      .select("*")
      .eq("user_id", user.id);

    if (statesError) {
      console.error("Error fetching checklist states:", statesError);
      return;
    }

    // マスターデータと状態を結合
    const itemsWithState = checklistItems.map((item: ChecklistItem) => ({
      ...item,
      is_completed:
        states?.find((state) => state.checklist_item_id === item.id)
          ?.is_completed || false,
      user_id: user.id, // 現在のユーザーIDを設定
    }));

    setItems(itemsWithState);
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // 早期リターンを削除し、各メソッドで条件チェック
  const toggleComplete = async (id: string) => {
    if (!user) return;
    // 現在のユーザーの状態を確認
    const { data: existingState, error: stateError } = await supabase
      .from("checklist_states")
      .select("*")
      .eq("checklist_item_id", id)
      .eq("user_id", user.id)
      .single();

    if (stateError && stateError.code !== "PGRST116") {
      // PGRST116 は "結果が見つからない" エラー
      console.error("Error checking state:", stateError);
      return;
    }

    if (existingState) {
      // 既存の状態を更新
      const { error } = await supabase
        .from("checklist_states")
        .update({ is_completed: !existingState.is_completed })
        .eq("checklist_item_id", id)
        .eq("user_id", user.id);

      if (!error) await fetchItems();
    } else {
      // 新しい状態を作成
      const { error } = await supabase.from("checklist_states").insert({
        checklist_item_id: id,
        user_id: user.id,
        is_completed: true,
      });

      if (!error) await fetchItems();
    }
  };

  const addItem = async (
    newItem: Pick<ChecklistItem, "content" | "due_type" | "visibility">
  ) => {
    if (!user) return;
    // チェックリストのマスターデータに追加
    const { data: insertedItem, error } = await supabase
      .from("checklist_items")
      .insert({
        ...newItem,
        created_at: new Date().toISOString(),
      })
      .select() // 追加したレコードを取得
      .single<ChecklistItem>(); // 型を明示的に指定

    if (!error && insertedItem) {
      // 作成したアイテムの初期状態を作成
      await supabase.from("checklist_states").insert({
        checklist_item_id: insertedItem.id,
        user_id: user.id, // 認証済みユーザーのIDを使用
        is_completed: false,
      });

      await fetchItems();
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", id);

    if (!error) await fetchItems();
  };

  return { items, addItem, toggleComplete, deleteItem };
};
