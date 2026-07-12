// レッスンごとの SNS 画像。レッスン名とモジュール名を入れて生成する。

import { ImageResponse } from "next/og";
import { getLesson, lessons } from "@/lib/lessons";

export const alt = "codelog のレッスン";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLesson(id);
  const index = lessons.findIndex((l) => l.id === id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#4b54e8" }}>
            {lesson?.module ?? "codelog"}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 60,
              fontWeight: 800,
              color: "#1b1f2a",
              lineHeight: 1.3,
            }}
          >
            {lesson?.title ?? "レッスン"}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 26,
              color: "#697089",
              lineHeight: 1.6,
            }}
          >
            {(lesson?.paras[0] ?? "").slice(0, 78)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "2px solid #e6e8ef",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#1b1f2a" }}>
              codelog
            </div>
            <div style={{ fontSize: 20, color: "#aeb4c6" }}>()</div>
          </div>
          <div style={{ fontSize: 24, color: "#aeb4c6" }}>
            {`Lesson ${index + 1} / ${lessons.length}`}
          </div>
        </div>
      </div>
    ),
    size
  );
}
