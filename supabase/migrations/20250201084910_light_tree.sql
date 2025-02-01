/*
  # チェックリストの状態とゲストテーブルの参照制約を修正

  1. 変更内容
    - checklist_statesテーブルのuser_idカラムの型をtextからuuidに変更
    - guestsテーブルへの外部キー制約を追加
    - 既存のデータを確認し、無効なuser_idを持つレコードを削除

  2. セキュリティ
    - RLSポリシーは既存のものを維持
*/

-- 一時的に外部キー制約を削除（もし存在する場合）
ALTER TABLE checklist_states
  DROP CONSTRAINT IF EXISTS fk_checklist_states_user;

-- 既存の無効なuser_idを持つレコードを削除
DELETE FROM checklist_states
WHERE NOT EXISTS (
  SELECT 1 FROM guests 
  WHERE guests.id::text = checklist_states.user_id
);

-- user_idのデータ型をuuidに変更
ALTER TABLE checklist_states
  ALTER COLUMN user_id TYPE uuid 
  USING user_id::uuid;

-- 外部キー制約を追加
ALTER TABLE checklist_states
  ADD CONSTRAINT fk_checklist_states_user
    FOREIGN KEY (user_id)
    REFERENCES guests(id)
    ON DELETE CASCADE;

-- インデックスを追加してパフォーマンスを改善
CREATE INDEX IF NOT EXISTS idx_checklist_states_user_id
  ON checklist_states(user_id);