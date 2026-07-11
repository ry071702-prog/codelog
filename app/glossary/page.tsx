import type { Metadata } from "next";
import { GlossaryBrowser } from "@/components/GlossaryBrowser";

export const metadata: Metadata = {
  title: "用語集",
  description:
    "JavaScript の専門用語を調べる・確認する。レッスンに登場する用語を検索とカテゴリで絞り込める。",
};

export default function GlossaryPage() {
  return <GlossaryBrowser />;
}
