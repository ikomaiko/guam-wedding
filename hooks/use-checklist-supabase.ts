import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
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

    try {
      // チェックリストのマスターデータを取得
      const { data: checklistItems, error: itemsError } = await supabase.from(
        "checklist_items"
      ).select(`
          *,
          creator:guests!created_by(id, side)
        `);

      if (itemsError) {
        console.error("Error fetching checklist items:", itemsError);
        return;
      }

      // フィルタリングを JavaScript 側で実行
      const filteredItems = checklistItems.filter((item) => {
        if (item.visibility === "public") return true;
        if (item.visibility === "private") return item.created_by === user.id;
        if (item.visibility === "family") {
          return item.creator?.side === user.side;
        }
        return false;
      });

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
      const itemsWithState = filteredItems.map((item) => ({
        ...item,
        is_completed:
          states?.find((state) => state.checklist_item_id === item.id)
            ?.is_completed || false,
        user_id: user.id,
      }));

      setItems(itemsWithState);
    } catch (error) {
      console.error("Error in fetchItems:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleComplete = async (id: string) => {
    if (!user) return;

    try {
      // 現在のユーザーの状態を確認
      const { data: existingState, error: stateError } = await supabase
        .from("checklist_states")
        .select("*")
        .eq("checklist_item_id", id)
        .eq("user_id", user.id)
        .single();

      if (stateError && stateError.code !== "PGRST116") {
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
    } catch (error) {
      console.error("Error in toggleComplete:", error);
    }
  };

  const addItem = async (
    newItem: Pick<ChecklistItem, "content" | "due_type" | "visibility">
  ) => {
    if (!user) return;

    try {
      // チェックリストのマスターデータに追加
      const { data: insertedItem, error } = await supabase
        .from("checklist_items")
        .insert({
          ...newItem,
          created_by: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting item:", error);
        return;
      }

      if (insertedItem) {
        // 作成したアイテムの初期状態を作成
        await supabase.from("checklist_states").insert({
          checklist_item_id: insertedItem.id,
          user_id: user.id,
          is_completed: false,
        });

        await fetchItems();
      }
    } catch (error) {
      console.error("Error in addItem:", error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("checklist_items")
        .delete()
        .eq("id", id);

      if (!error) await fetchItems();
    } catch (error) {
      console.error("Error in deleteItem:", error);
    }
  };

  return { items, addItem, toggleComplete, deleteItem };
};
