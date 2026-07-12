"use client";

// ライト / ダークの切り替え。
// 既定は OS の設定に従い、ここで上書きすると localStorage に覚える。
// 変数を差し替えるだけで全体が切り替わる（globals.css の data-theme を参照）。

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "codelog:theme";
type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const current: Theme =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- OS 設定と localStorage は hydration 後にしか読めない
    setTheme(current);
    document.documentElement.dataset.theme = current;
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // 保存できなくても切り替え自体は効く
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "ライトモードにする" : "ダークモードにする"}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sub transition-colors hover:bg-canvas hover:text-accent"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
