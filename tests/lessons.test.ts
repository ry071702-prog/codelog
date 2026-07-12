// レッスンの回帰テスト。
//
// 一番大事なのは「模範解答を実行すると、そのレッスンの check が本当にクリアを返す」こと。
// レッスン文言・check 関数・実行エンジンのどれを直しても、ここが壊れれば気づける。

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lessons } from "@/lib/lessons";
import { solutions } from "@/lib/solutions";
import { glossary } from "@/lib/glossary";
import {
  runConsoleLesson,
  runPreviewLesson,
  setSolutions,
  solutionOf,
  typeCheck,
} from "./harness";

setSolutions(solutions);

// TS レッスンの型チェックに使う標準ライブラリ（prepare スクリプトが生成したもの）
const libSource = readFileSync(
  join(process.cwd(), "public/vendor/ts/lib.bundle.d.ts"),
  "utf8"
);

const codeLessons = lessons.filter((l) => l.task);
const consoleLessons = codeLessons.filter((l) => !l.preview);
const previewLessons = codeLessons.filter((l) => l.preview);
const tsLessons = codeLessons.filter((l) => l.lang === "ts");

describe("レッスンデータの整合性", () => {
  it("id が重複していない", () => {
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("すべてのレッスンに課題かチェックリストがある", () => {
    for (const l of lessons) {
      expect(!!l.task || !!l.checklist, `${l.id} に task も checklist も無い`).toBe(true);
    }
  });

  it("解答は、そのレッスンのスターターと違う内容になっている", () => {
    for (const [id, solution] of Object.entries(solutions)) {
      const lesson = lessons.find((l) => l.id === id);
      expect(lesson, `${id} というレッスンが無い`).toBeTruthy();
      expect(solution).not.toBe(lesson!.task!.starter);
    }
  });
});

describe("用語集の整合性", () => {
  it("slug が重複していない", () => {
    const slugs = glossary.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("lessonIds が実在するレッスンを指している", () => {
    const ids = new Set(lessons.map((l) => l.id));
    for (const term of glossary) {
      for (const lessonId of term.lessonIds ?? []) {
        expect(ids.has(lessonId), `${term.slug} が知らないレッスン ${lessonId} を指している`).toBe(true);
      }
    }
  });
});

describe("TypeScript レッスンの解答は型が通る", () => {
  for (const lesson of tsLessons) {
    it(`${lesson.id}: 型エラーが出ない`, () => {
      const errors = typeCheck(solutionOf(lesson), libSource);
      expect(errors, `${lesson.id}: ${errors.join(" / ")}`).toEqual([]);
    });
  }
});

describe("解答を実行するとクリアになる（コンソール系）", () => {
  for (const lesson of consoleLessons) {
    it(`${lesson.id}`, async () => {
      const code = solutionOf(lesson);
      const logs = await runConsoleLesson(code, lesson.lang);
      expect(
        lesson.task!.check(logs, code),
        `${lesson.id}: クリア判定が false（出力: ${logs.map((l) => l.text).join(" | ")}）`
      ).toBe(true);
    });
  }
});

describe("解答を実行するとクリアになる（プレビュー系）", () => {
  for (const lesson of previewLessons) {
    it(`${lesson.id}`, async () => {
      const { cleared, dom } = await runPreviewLesson(lesson, lesson.task!.check);
      expect(
        cleared,
        `${lesson.id}: クリア判定が false（画面: ${dom.slice(0, 200)}）`
      ).toBe(true);
    });
  }
});
