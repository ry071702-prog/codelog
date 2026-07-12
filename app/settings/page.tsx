import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgressBackup } from "@/components/ProgressBackup";

export const metadata: Metadata = {
  title: "設定",
  description: "codelog の進捗をバックアップ・引き継ぎする。",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto w-full max-w-[720px] px-6 py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-sub transition-colors hover:text-accent"
        >
          <ArrowLeft size={15} /> codelog にもどる
        </Link>
        <h1 className="mb-6 text-[27px] font-extrabold tracking-tight text-ink">
          設定
        </h1>
        <ProgressBackup />
      </main>
    </div>
  );
}
