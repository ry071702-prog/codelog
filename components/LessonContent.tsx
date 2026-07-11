"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { lessons, type Log } from "@/lib/lessons";
import { runCode } from "@/lib/runner";
import { useProgress } from "@/components/ProgressProvider";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsoleOutput } from "@/components/ConsoleOutput";
import { TermText } from "@/components/TermText";
import { TutorPanel } from "@/components/TutorPanel";

export function LessonContent({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const { codeByLesson, setCodeFor, markCompleted } = useProgress();

  const idx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[idx];
  const nextLesson = lessons[idx + 1];
  const isLastLesson = idx === lessons.length - 1;
  const isModuleEnd =
    !isLastLesson && nextLesson && nextLesson.module !== lesson.module;

  const [output, setOutput] = useState<Log[]>([]);
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // 実行結果などの state は呼び出し側の key={lessonId} で
  // レッスンごとにコンポーネントごと作り直される（リセット用 effect は不要）
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const code = codeByLesson[lessonId] ?? lesson.task.starter;

  const handleRun = async () => {
    setRunning(true);
    const logs = await runCode(code);
    setOutput(logs);
    setRan(true);
    if (lesson.task.check(logs, code)) {
      setCleared(true);
      markCompleted(lesson.id);
    } else {
      setCleared(false);
    }
    setRunning(false);
  };

  const handleReset = () => {
    setCodeFor(lessonId, lesson.task.starter);
    setOutput([]);
    setRan(false);
    setCleared(false);
  };

  const handleNext = () => {
    if (nextLesson) router.push(`/lessons/${nextLesson.id}`);
  };

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-2 text-xs font-bold tracking-widest text-accent">
        {lesson.module}
      </div>
      <h1 className="mb-[18px] text-[27px] font-extrabold leading-tight tracking-tight text-ink">
        {lesson.title}
      </h1>

      {lesson.paras.map((p, i) => (
        <p
          key={i}
          className="mb-3 text-[15.5px] leading-[1.85] text-[#3a4051]"
        >
          <TermText text={p} />
        </p>
      ))}
      {lesson.points && (
        <ul className="mb-[22px] mt-2 flex flex-col gap-2">
          {lesson.points.map((pt, i) => (
            <li
              key={i}
              className="flex gap-[9px] text-sm leading-relaxed text-sub"
            >
              <span className="shrink-0 font-extrabold text-accent">·</span>
              <span>
                <TermText text={pt} />
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-2 text-[13px] font-bold text-sub">例を読む</div>
      <pre className="mb-7 overflow-x-auto rounded-[14px] bg-editor px-[18px] py-4 font-mono text-sm leading-relaxed text-editor-ink">
        {lesson.example}
      </pre>

      <div className="mb-4 rounded-[14px] bg-accent-soft px-[18px] py-4">
        <div className="mb-1.5 text-[12.5px] font-bold tracking-wide text-accent">
          やってみよう
        </div>
        <div className="text-[15.5px] leading-relaxed text-ink">
          {lesson.task.prompt}
        </div>
        <button
          type="button"
          onClick={() => setShowHint((s) => !s)}
          className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-accent"
        >
          <Lightbulb size={14} /> {showHint ? "ヒントを閉じる" : "ヒントを見る"}
        </button>
        {showHint && (
          <div className="mt-2 text-[13.5px] leading-relaxed text-sub">
            {lesson.task.hint}
          </div>
        )}
      </div>

      <CodeEditor
        value={code}
        onChange={(v) => setCodeFor(lessonId, v)}
        onRun={handleRun}
        onReset={handleReset}
        running={running}
      />
      <div className="h-5" />
      <ConsoleOutput logs={output} ran={ran} />

      <TutorPanel lessonId={lessonId} code={code} logs={output} />

      {cleared && (
        <div className="mt-[22px] flex items-start gap-3 rounded-[14px] border border-ok/20 bg-ok-soft px-[18px] py-4">
          <Sparkles size={20} className="mt-0.5 shrink-0 text-ok" />
          <div className="flex-1">
            <div className="text-[15px] font-extrabold text-[#0a7a64]">
              クリア！
            </div>
            <div className="mt-0.5 text-sm leading-relaxed text-[#2f6b5e]">
              {isLastLesson
                ? "全4モジュール完走、おつかれさま。変数からクラス・非同期・並列処理まで、入門書一冊ぶんの JavaScript がここに入った。次の柱はブラウザを動かす DOM 編（画面プレビューつきで追加予定）、その先に TypeScript → React。準備ができたらチャットで「次いこう」と言って。"
                : isModuleEnd
                  ? `${lesson.module} を完了。ここから ${nextLesson.module} に入る。実務で効いてくる、一歩踏み込んだ内容。`
                  : "その調子。次のレッスンへ進もう。"}
            </div>
            {!isLastLesson && (
              <button
                type="button"
                onClick={handleNext}
                className="mt-3 flex items-center gap-1.5 rounded-[9px] bg-ok px-4 py-2 text-sm font-bold text-white"
              >
                次のレッスンへ <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="h-10" />
    </div>
  );
}
