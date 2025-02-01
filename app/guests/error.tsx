"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-serif mb-4">エラーが発生しました</h2>
        <p className="text-muted-foreground mb-6">
          申し訳ありません。データの読み込み中にエラーが発生しました。
        </p>
        <Button onClick={reset}>再試行</Button>
      </div>
    </div>
  );
}