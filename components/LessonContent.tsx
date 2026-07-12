"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { lessons, type Log } from "@/lib/lessons";
import { runCode } from "@/lib/runner";
import { runTsCode } from "@/lib/tsRunner";
import { buildSrcDoc, compileJsx, guardCode } from "@/lib/domRunner";
import { useProgress } from "@/components/ProgressProvider";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsoleOutput } from "@/components/ConsoleOutput";
import { DomPreview } from "@/components/DomPreview";
import { TermText } from "@/components/TermText";
import { TutorPanel } from "@/components/TutorPanel";
import { Checklist } from "@/components/Checklist";
import { ShareButtons } from "@/components/ShareButtons";

export function LessonContent({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const {
    codeByLesson,
    setCodeFor,
    markCompleted,
    checksByLesson,
    toggleCheck,
    previewStore,
    setPreviewStoreFor,
  } = useProgress();

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
  // DOM レッスン用: 実行のたびに +1 して iframe を作り直す。
  // srcDoc は「実行を押した瞬間のコード」で固定する（打鍵のたびに走らせない）
  const [runId, setRunId] = useState(0);
  const [srcDoc, setSrcDoc] = useState("");

  // プレビューはクリックのたびに非同期でログ・画面を送ってくるため、
  // 最新値を ref で保持してクリア判定に使う（state だけだと古い値を掴む）
  const logsRef = useRef<Log[]>([]);
  const domRef = useRef<string>("");
  const clearedRef = useRef(false);

  // 実行結果などの state は呼び出し側の key={lessonId} で
  // レッスンごとにコンポーネントごと作り直される（リセット用 effect は不要）
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const code = codeByLesson[lessonId] ?? lesson.task?.starter ?? "";
  const checked = checksByLesson[lessonId] ?? [];

  const evaluate = useCallback(() => {
    if (clearedRef.current || !lesson.task) return;
    if (lesson.task.check(logsRef.current, code, domRef.current)) {
      clearedRef.current = true;
      setCleared(true);
      markCompleted(lesson.id);
    }
  }, [lesson, code, markCompleted]);

  const resetRun = () => {
    logsRef.current = [];
    domRef.current = "";
    clearedRef.current = false;
    setOutput([]);
    setCleared(false);
  };

  const handleRun = async () => {
    setRunning(true);
    resetRun();

    if (!lesson.preview) {
      // TS レッスンは、実行前にブラウザ内の tsc が型チェックする
      const logs =
        lesson.lang === "ts" ? await runTsCode(code) : await runCode(code);
      logsRef.current = logs;
      setOutput(logs);
      setRan(true);
      evaluate();
      setRunning(false);
      return;
    }

    // React レッスンは、ブラウザが読める JavaScript に JSX を変換してから実行する
    const isReact = lesson.lang === "jsx";
    let runnable = code;
    if (isReact) {
      const { js, errors } = await compileJsx(code);
      if (js === null) {
        const logs: Log[] = errors.map((text) => ({
          type: "error" as const,
          text,
        }));
        logsRef.current = logs;
        setOutput(logs);
        setRan(true);
        setRunning(false);
        return;
      }
      runnable = js;
    }

    // iframe で本当に実行する前に、Worker で無限ループでないか試走する
    const safe = await guardCode(runnable);
    setRan(true);
    if (!safe) {
      const logs: Log[] = [
        {
          type: "error",
          text: "実行時間が長すぎます（無限ループかも）。プレビューは実行しませんでした。ループの終了条件を見直そう。",
        },
      ];
      logsRef.current = logs;
      setOutput(logs);
      setRunning(false);
      return;
    }
    const nextRun = runId + 1;
    setSrcDoc(
      buildSrcDoc(lesson.preview, runnable, nextRun, {
        react: isReact,
        storage: previewStore[lessonId] ?? {},
      })
    );
    setRunId(nextRun); // running は iframe の done で下ろす
  };

  const handleReset = () => {
    setCodeFor(lessonId, lesson.task?.starter ?? "");
    resetRun();
    setRan(false);
    setRunId(0);
    setSrcDoc("");
  };

  const handleNext = () => {
    if (nextLesson) router.push(`/lessons/${nextLesson.id}`);
  };

  // チェックリスト型（MODULE 08）: 全部チェックできたらクリア
  const handleToggleCheck = (index: number) => {
    toggleCheck(lessonId, index);
    const next = checked.includes(index)
      ? checked.filter((i) => i !== index)
      : [...checked, index];
    const allDone = !!lesson.checklist && next.length === lesson.checklist.length;
    setCleared(allDone);
    if (allDone) markCompleted(lesson.id);
  };

  // ── プレビューからの通知（実行後のクリックなどでも届き続ける）
  const handlePreviewLog = useCallback(
    (log: Log) => {
      logsRef.current = [...logsRef.current, log];
      setOutput(logsRef.current);
      evaluate();
    },
    [evaluate]
  );

  const handlePreviewDom = useCallback(
    (html: string) => {
      domRef.current = html;
      evaluate();
    },
    [evaluate]
  );

  const handlePreviewStorage = useCallback(
    (store: Record<string, string>) => {
      setPreviewStoreFor(lessonId, store);
    },
    [lessonId, setPreviewStoreFor]
  );

  const handlePreviewDone = useCallback(() => {
    setRunning(false);
    evaluate();
  }, [evaluate]);

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
          className="mb-3 text-[15.5px] leading-[1.85] text-ink/85"
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

      {lesson.task && (
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
      )}

      {lesson.checklist && (
        <Checklist
          items={lesson.checklist}
          checked={checked}
          onToggle={handleToggleCheck}
        />
      )}

      {lesson.task && (
        <>
      <CodeEditor
        value={code}
        fileName={
          lesson.lang === "ts"
            ? "script.ts"
            : lesson.lang === "jsx"
              ? "App.jsx"
              : "script.js"
        }
        onChange={(v) => setCodeFor(lessonId, v)}
        onRun={handleRun}
        onReset={handleReset}
        running={running}
      />
      <div className="h-5" />

      {lesson.preview && (
        <DomPreview
          runId={runId}
          srcDoc={srcDoc}
          onLog={handlePreviewLog}
          onDom={handlePreviewDom}
          onDone={handlePreviewDone}
          onStorage={handlePreviewStorage}
        />
      )}

      <ConsoleOutput logs={output} ran={ran} />
        </>
      )}

      {lesson.task && (
        <TutorPanel lessonId={lessonId} code={code} logs={output} />
      )}

      {cleared && (
        <div className="mt-[22px] flex items-start gap-3 rounded-[14px] border border-ok/20 bg-ok-soft px-[18px] py-4">
          <Sparkles size={20} className="mt-0.5 shrink-0 text-ok" />
          <div className="flex-1">
            <div className="text-[15px] font-extrabold text-[#0a7a64]">
              クリア！
            </div>
            <div className="mt-0.5 text-sm leading-relaxed text-[#2f6b5e]">
              {isLastLesson
                ? "全モジュール完走、おつかれさま。変数からクラス・非同期処理、そして自分の手で動く画面を作るところまで来た。次の柱は TypeScript → React / Next.js、その先に個人開発の実践。準備ができたらチャットで「次いこう」と言って。"
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

            {/* 区切りのいいところ（モジュール完走・全完走）でだけシェアを出す */}
            {(isLastLesson || isModuleEnd) && (
              <ShareButtons
                text={
                  isLastLesson
                    ? "codelog を完走しました。JavaScript の基礎から DOM・TypeScript・React、そして個人開発まで走り抜けた。"
                    : `codelog の「${lesson.module}」を完了しました。`
                }
                url="https://codelog-three.vercel.app"
              />
            )}
          </div>
        </div>
      )}
      <div className="h-10" />
    </div>
  );
}
