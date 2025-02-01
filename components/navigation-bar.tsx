"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, CheckSquare, Calendar, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show navigation bar on login and welcome pages
  if (pathname === "/login" || pathname === "/welcome") {
    return null;
  }

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
          {pathname === "/" && (
            <>
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
            </>
          )}
          <button 
            className="flex flex-col items-center gap-1 text-sm"
            onClick={() => user && router.push(`/guests/${user.id}`)}
          >
            <User className="h-5 w-5" />
            <span>マイページ</span>
          </button>
        </div>
      </div>
    </nav>
  );
}