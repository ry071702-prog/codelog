// AI チューター API。
// API キーはサーバー側環境変数 (ANTHROPIC_API_KEY) のみで扱い、クライアントには一切露出させない。
// 方針: 修正済みコードは渡さず、見るべき行と考え方を導く (CLAUDE.md Phase 1)。

import Anthropic from "@anthropic-ai/sdk";
import { getLesson, type Log } from "@/lib/lessons";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5"; // 軽量モデル + max_tokens 制限 (CLAUDE.md の方針)
const MAX_TOKENS = 1024;

const SYSTEM_PROMPT = `あなたは JavaScript 学習サイト「codelog」の AI チューター。相手はプログラミングを学び始めたばかりの学習者。

絶対のルール:
- 修正済みのコードや完成したコードは渡さない。コードブロックで答えそのものを書かない
- 代わりに「どの行を見るべきか」「何と何を比べるべきか」「何を考えるべきか」を導く
- エラーが出ているときは、まずエラーメッセージのどこを読むか・それが何を意味するかを教える
- 専門用語を使うときは一言の説明を添える
- 回答は日本語で、3〜6文程度に簡潔に。箇条書きは2〜3点まで
- 学習者が同じ点で2回以上詰まっている様子なら、より具体的なヒント (1行の断片程度まで) を出してよい
- レッスンの範囲を超える質問には短く答えたうえで、今のレッスンの考え方に引き戻す
- 励ましは短く自然に。過剰に褒めない`;

interface TutorRequest {
  lessonId: string;
  code: string;
  logs: Log[];
  question: string;
}

function isValidBody(body: unknown): body is TutorRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.lessonId === "string" &&
    typeof b.code === "string" &&
    typeof b.question === "string" &&
    Array.isArray(b.logs)
  );
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AIチューターは準備中です (APIキー未設定)" },
      { status: 503 }
    );
  }

  const body: unknown = await req.json().catch(() => null);
  if (!isValidBody(body)) {
    return Response.json({ error: "リクエストの形式が不正です" }, { status: 400 });
  }

  const { lessonId, code, logs, question } = body;
  const lesson = getLesson(lessonId);
  if (!lesson) {
    return Response.json({ error: "レッスンが見つかりません" }, { status: 404 });
  }
  if (question.trim().length === 0 || question.length > 500) {
    return Response.json(
      { error: "質問は1〜500文字で入力してください" },
      { status: 400 }
    );
  }

  // サーバー側でレッスン本文と結合してプロンプトを構築する
  // (ユーザーは説明ゼロで質問できる)
  const logsText =
    logs.length > 0
      ? logs
          .slice(0, 30)
          .map((l) => `[${l.type}] ${String(l.text).slice(0, 300)}`)
          .join("\n")
      : "(まだ実行していない、または出力なし)";

  const userContent = `# いま学習中のレッスン
モジュール: ${lesson.module}
タイトル: ${lesson.title}
本文: ${lesson.paras.join(" ")}
課題: ${lesson.task.prompt}
課題のヒント: ${lesson.task.hint}

# 学習者が書いたコード
\`\`\`js
${code.slice(0, 4000)}
\`\`\`

# 実行結果 (コンソール出力)
${logsText}

# 学習者の質問
${question}`;

  try {
    const message = await new Anthropic().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const answer = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return Response.json({ answer });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "混み合っています。少し待ってからもう一度どうぞ" },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return Response.json(
        { error: "AIチューターとの通信に失敗しました" },
        { status: 502 }
      );
    }
    return Response.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
