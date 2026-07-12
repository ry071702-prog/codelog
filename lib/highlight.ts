// コードのシンタックスハイライト（依存ライブラリなし）。
//
// エディタは textarea の上に色つきの <pre> を重ねて実現する。
// 完全なパーサーではなく「初学者が読みやすくなる」ことを目的にした軽い字句解析。
// 対象は JS / TS / JSX。

export type TokenType =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "builtin"
  | "tag"
  | "punct"
  | "plain";

export interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "switch", "case", "default", "break", "continue", "new", "class",
  "extends", "constructor", "this", "super", "typeof", "instanceof", "in",
  "of", "try", "catch", "finally", "throw", "async", "await", "import",
  "export", "from", "as", "type", "interface", "implements", "public",
  "private", "readonly", "true", "false", "null", "undefined", "void",
  "delete", "yield", "static",
]);

const BUILTINS = new Set([
  "console", "document", "window", "Math", "JSON", "Object", "Array", "String",
  "Number", "Boolean", "Promise", "Set", "Map", "Date", "Error", "localStorage",
  "React", "ReactDOM", "useState", "useEffect", "useRef", "fetchUsers",
  "fetchPosts", "setTimeout", "setInterval", "Symbol",
]);

// 1つの正規表現で「意味のかたまり」を順に切り出す（前にあるものほど優先）
const PATTERN = new RegExp(
  [
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)", // コメント
    "(`(?:\\\\.|[^`\\\\])*`|\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*')", // 文字列
    "(<\\/?[A-Za-z][\\w.]*)", // JSX の開始・終了タグ
    "(\\b\\d+(?:\\.\\d+)?\\b)", // 数値
    "([A-Za-z_$][\\w$]*)", // 識別子（キーワードか組み込みかを後で判定）
    "([{}()\\[\\];,.<>+\\-*/%=!?:&|]+)", // 記号
  ].join("|"),
  "g"
);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;

  for (const m of code.matchAll(PATTERN)) {
    const index = m.index ?? 0;
    if (index > last) {
      tokens.push({ type: "plain", text: code.slice(last, index) });
    }

    const [text, comment, str, tag, num, ident, punct] = m;
    if (comment) tokens.push({ type: "comment", text });
    else if (str) tokens.push({ type: "string", text });
    else if (tag) tokens.push({ type: "tag", text });
    else if (num) tokens.push({ type: "number", text });
    else if (ident) {
      tokens.push({
        type: KEYWORDS.has(text)
          ? "keyword"
          : BUILTINS.has(text)
            ? "builtin"
            : "plain",
        text,
      });
    } else if (punct) tokens.push({ type: "punct", text });

    last = index + text.length;
  }

  if (last < code.length) {
    tokens.push({ type: "plain", text: code.slice(last) });
  }
  return tokens;
}

/** トークンの種類 → 色（エディタの暗い背景に合わせた配色） */
export const TOKEN_COLOR: Record<TokenType, string> = {
  comment: "text-[#6b7392]",
  string: "text-[#9ae6b4]",
  number: "text-[#f6ad9c]",
  keyword: "text-[#a5b4ff]",
  builtin: "text-[#7fd3f7]",
  tag: "text-[#f0a7d8]",
  punct: "text-[#aab2cc]",
  plain: "text-editor-ink",
};
