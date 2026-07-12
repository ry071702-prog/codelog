// SNS でシェアされたときに出る画像（トップページ用）。ビルド時に生成される。

import { ImageResponse } from "next/og";
import { lessons } from "@/lib/lessons";
import { glossary } from "@/lib/glossary";

export const alt = "codelog — 読んで、動かして、書いて学ぶ JavaScript";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const moduleCount = new Set(lessons.map((l) => l.module)).size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f4f5f8",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#1b1f2a" }}>
            codelog
          </div>
          <div style={{ fontSize: 34, color: "#aeb4c6" }}>()</div>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 46,
            fontWeight: 700,
            color: "#1b1f2a",
            lineHeight: 1.35,
          }}
        >
          読んで、動かして、書いて学ぶ JavaScript
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#697089" }}>
          {`${moduleCount}モジュール・${lessons.length}レッスン・用語集${glossary.length}語`}
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 12,
          }}
        >
          {["ブラウザで実行", "DOM・React", "TypeScript", "AIチューター"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 24,
                  color: "#4b54e8",
                  background: "#eeeffe",
                  padding: "10px 22px",
                  borderRadius: 999,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
