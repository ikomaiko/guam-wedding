/*
  # チェックリストの状態とゲストテーブルの参照制約を追加

  1. 変更内容
    - checklist_statesテーブルのuser_idカラムにguestsテーブルのidへの外部キー制約を追加
    - 既存のデータを確認し、無効なuser_idを持つレコードがあれば削除

  2. セキュリティ
    - RLSポリシーは既存のものを維持
*/

-- 既存の無効なuser_idを持つレコードを削除
DELETE FROM checklist_states
WHERE user_id NOT IN (SELECT id FROM guests);

-- user_idのデータ型をuuidに変更し、外部キー制約を追加
ALTER TABLE checklist_states
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ADD CONSTRAINT fk_checklist_states_user
    FOREIGN KEY (user_id)
    REFERENCES guests(id)
    ON DELETE CASCADE;

-- インデックスを追加してパフォーマンスを改善
CREATE INDEX IF NOT EXISTS idx_checklist_states_user_id
  ON checklist_states(user_id);