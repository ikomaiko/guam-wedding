"use client";

import { useRouter } from "next/navigation";
import { Home, Users, CheckSquare, Calendar } from "lucide-react";

export function Navigation() {
  const router = useRouter();

  const handleScroll = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <button 
            className="flex flex-col items-center gap-1 text-sm"
            onClick={() => router.push("/")}
          >
            <Home className="h-5 w-5" />
            <span>ホーム</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-sm"
            onClick={() => router.push("/guests")}
          >
            <Users className="h-5 w-5" />
            <span>参列者</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-sm"
            onClick={() => handleScroll("timeline")}
          >
            <Calendar className="h-5 w-5" />
            <span>タイムライン</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-sm"
            onClick={() => handleScroll("checklist")}
          >
            <CheckSquare className="h-5 w-5" />
            <span>チェックリスト</span>
          </button>
        </div>
      </div>
    </nav>
  );
}