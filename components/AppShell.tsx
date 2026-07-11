"use client";

// レッスン画面の全体シェル。
// デスクトップは左固定サイドバー、モバイルはヘッダー + ドロワー。

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { lessons } from "@/lib/lessons";
import { useProgress } from "@/components/ProgressProvider";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { completed } = useProgress();

  const currentId = pathname.startsWith("/lessons/")
    ? pathname.split("/")[2]
    : undefined;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1180px]">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-line bg-[#FAFBFC] md:block">
          <Sidebar currentId={currentId} />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-[#FAFBFC] px-[18px] py-3.5 md:hidden">
            <span className="font-mono text-lg font-extrabold">codelog</span>
            <div className="flex items-center gap-3">
              <span className="text-[12.5px] font-bold text-accent">
                {completed.length}/{lessons.length}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="メニューを開く"
                className="text-ink"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          <div className="px-[22px] pb-5 pt-[34px]">{children}</div>
        </main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="メニューを閉じる"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-[rgba(20,24,34,0.4)]"
          />
          <div className="absolute bottom-0 left-0 top-0 w-[300px] max-w-[84%] overflow-y-auto bg-[#FAFBFC] shadow-[0_0_40px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="閉じる"
              className="absolute right-3.5 top-4 z-2 text-sub"
            >
              <X size={22} />
            </button>
            <Sidebar currentId={currentId} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
