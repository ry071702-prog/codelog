import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Check, Menu, X, Lightbulb, Terminal, Sparkles, ArrowRight, Lock } from "lucide-react";

// ---------- 色 ----------
const C = {
  canvas: "#F4F5F8", card: "#FFFFFF", ink: "#1B1F2A", sub: "#697089", faint: "#AEB4C6",
  line: "#E6E8EF", editor: "#12151F", editorInk: "#E7EAF3",
  accent: "#4B54E8", accentSoft: "#EEEFFE", ok: "#0FA98C", okSoft: "#E4F6F1", err: "#E5484D",
};

// ---------- コード実行エンジン ----------
function formatArg(a) {
  if (typeof a === "string") return a;
  if (a === null) return "null";
  if (a === undefined) return "undefined";
  if (typeof a === "object") { try { return JSON.stringify(a); } catch { return String(a); } }
  return String(a);
}
async function runCode(code) {
  const logs = [];
  const push = (type) => (...args) => logs.push({ type, text: args.map(formatArg).join(" ") });
  const sandboxConsole = { log: push("log"), info: push("log"), warn: push("warn"), error: push("error") };
  // 非同期レッスン用の擬似API（外部通信なしで「データ取得」を体験する）
  const fetchUsers = () => new Promise((res) => setTimeout(() => res([
    { name: "Aoi", age: 24 }, { name: "Ken", age: 31 }, { name: "Mei", age: 28 },
  ]), 250));
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", "fetchUsers", `return (async () => {\n${code}\n})();`);
    await fn(sandboxConsole, fetchUsers);
  } catch (e) {
    logs.push({ type: "error", text: String(e && e.message ? e.message : e) });
  }
  return logs;
}

// ---------- レッスン ----------
const M1 = "MODULE 01 — 土台";
const M2 = "MODULE 02 — 一歩深く";
const lessons = [
  {
    id: "hello", module: M1, title: "はじめの一歩",
    paras: [
      "プログラムは、コンピュータに上から順に実行させる「指示の並び」。JavaScript はその指示を書く言語で、Webページもサーバーも動かせる。",
      "まずは画面（コンソール）に文字を出す console.log から。右下の「実行する」を押して、書いた通りに動くことを確かめよう。",
    ],
    points: ["1つの命令の終わりには ; （セミコロン）をつける", "// から行末まではコメント。実行されず、メモとして残せる"],
    example: `// 上から順に実行される
console.log("1行目");
console.log("2行目");`,
    task: {
      prompt: "3行目に、好きな一言を出力する console.log を自分で書き足してみよう。",
      starter: `console.log("1行目");
console.log("2行目");`,
      hint: "新しい行に console.log(\"...\"); を足すだけ。",
      check: (logs, code) => logs.filter((l) => l.type === "log").length >= 3 && /console\.log/.test(code),
    },
  },
  {
    id: "vars", module: M1, title: "変数 — 値に名前をつける",
    paras: [
      "値に名前をつけて保存するのが変数。あとから名前で呼び出せて、使い回せる。",
      "宣言は const と let。const は再代入しない値、let はあとで変える値に使う。基本は const、変える必要が出たときだけ let（古い var は今は使わない）。",
      "値には種類（型）がある：文字列 string、数値 number、真偽値 boolean、「無い」を表す null と undefined。",
    ],
    points: ["const で宣言した変数に、あとから別の値は入れられない", "typeof で値の型を調べられる"],
    example: `const name = "Sato";     // 文字列
let count = 0;           // 数値（あとで変える）
const isActive = true;   // 真偽値

count = count + 1;       // let なので再代入できる

console.log(name);
console.log(count);
console.log(typeof isActive);`,
    task: {
      prompt: "数値の変数 price を作って値を入れ、typeof で型を出力しよう。",
      starter: `const price = 1000;
console.log(price);
console.log(typeof price);`,
      hint: "typeof price は \"number\" と出るはず。値を変えても試そう。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /\b(const|let)\b/.test(code),
    },
  },
  {
    id: "ops", module: M1, title: "演算と比較",
    paras: [
      "数値は + - * / と % （余り）で計算できる。",
      "文字は + でつなげるか、バッククォート ` と ${ } を使うテンプレートリテラルで組み立てる（こちらが読みやすく主流）。",
      "比較は === (等しい) や >= などで、結果は true / false になる。値も型も厳密に比べる === を使い、== は避ける。複数条件は && (かつ)・|| (または)・! (否定) で組む。",
    ],
    points: ["10 % 3 は 1（割った余り）", "1 === \"1\" は false（型が違う）。== だと true になり事故のもと"],
    example: `console.log(7 * 6);        // 42
console.log(10 % 3);       // 1

const user = "Sato";
console.log(\`ようこそ、\${user}さん\`);

console.log(5 >= 3);       // true
console.log(1 === "1");    // false`,
    task: {
      prompt: "変数 a と b に数値を入れ、a を b で割った「余り」を、テンプレートリテラルで「余りは◯」の形で出力しよう。",
      starter: `const a = 17;
const b = 5;
console.log(\`余りは\${a % b}\`);`,
      hint: "余りは % で求める。${a % b} をバッククォートの文中に入れる。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /`[\s\S]*`/.test(code),
    },
  },
  {
    id: "cond", module: M1, title: "条件分岐 — もし〜なら",
    paras: [
      "条件によって処理を変えるのが if / else。条件が true のときだけ中が実行される。",
      "3つ以上に分けるときは else if を重ねる。短い分岐は 条件 ? A : B（三項演算子）でも書ける。",
      "JS では 0・空文字・null・undefined は「偽 (falsy)」、それ以外は「真 (truthy)」として扱われる。",
    ],
    points: ["if の条件は () の中、実行する処理は {} の中に書く"],
    example: `const score = 72;

if (score >= 80) {
  console.log("A");
} else if (score >= 60) {
  console.log("B");
} else {
  console.log("C");
}

// 三項演算子でも書ける
const result = score >= 60 ? "合格" : "不合格";
console.log(result);`,
    task: {
      prompt: "変数 temp（気温）を作り、30以上なら「暑い」、10未満なら「寒い」、それ以外は「快適」を出力しよう（else if を使う）。",
      starter: `const temp = 22;

if (temp >= 30) {
  console.log("暑い");
} else if (temp < 10) {
  console.log("寒い");
} else {
  console.log("快適");
}`,
      hint: "temp の値を変えて、3パターンすべて切り替わるか試そう。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /\bif\b/.test(code),
    },
  },
  {
    id: "func", module: M1, title: "関数 — 処理をまとめる",
    paras: [
      "よく使う処理に名前をつけてまとめるのが関数。入力（引数）を受け取り、return で結果（戻り値）を返す。",
      "書き方は2通り：function 宣言と、= () => {} のアロー関数。今は簡潔なアローが主流だが、両方読めるように。",
      "引数にはデフォルト値を設定でき、渡さなかったときに使われる。",
    ],
    points: ["return に到達すると関数はそこで終了し、値を返す", "関数に分けると、同じ処理を何度でも呼べて、修正も1か所で済む"],
    example: `// アロー関数
const toCelsius = (fahrenheit) => {
  return (fahrenheit - 32) / 1.8;
};

console.log(toCelsius(100));   // 37.7...

// デフォルト引数
const greet = (name = "ゲスト") => {
  return \`こんにちは、\${name}\`;
};

console.log(greet());          // 引数なし → ゲスト
console.log(greet("Sato"));`,
    task: {
      prompt: "2つの数を受け取って掛け算した結果を返す関数 multiply を作り、multiply(4, 5) を出力しよう。",
      starter: `const multiply = (a, b) => {
  return a * b;
};

console.log(multiply(4, 5));`,
      hint: "return a * b; を返すだけ。別の数でも呼び出してみよう。",
      check: (logs, code) => logs.some((l) => l.type === "log") && (/=>/.test(code) || /\bfunction\b/.test(code)),
    },
  },
  {
    id: "array", module: M1, title: "配列 — 値を並べて持つ",
    paras: [
      "複数の値を順番に並べて持つのが配列。[] で囲み、先頭は 0 番目から数える。",
      "要素の追加は push、末尾の削除は pop。length で個数がわかる。",
      "配列の中身はあとから変えられる（const で宣言しても、要素の追加・変更は可能）。",
    ],
    points: ["list[0] が最初、list[list.length - 1] が最後の要素"],
    example: `const fruits = ["りんご", "みかん"];

fruits.push("ぶどう");        // 末尾に追加
console.log(fruits);          // ["りんご","みかん","ぶどう"]
console.log(fruits.length);   // 3
console.log(fruits[0]);       // りんご`,
    task: {
      prompt: "数値の配列 nums を作り、push で1つ追加してから、length（個数）を出力しよう。",
      starter: `const nums = [10, 20, 30];
nums.push(40);
console.log(nums);
console.log(nums.length);`,
      hint: "push(値) で末尾に足せる。追加後の length は 4 になるはず。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /\[[\s\S]*\]/.test(code),
    },
  },
  {
    id: "loop", module: M1, title: "くり返し — ループ",
    paras: [
      "同じ処理をくり返すのがループ。決まった回数なら for、条件が続く間なら while。",
      "配列の全要素を順に扱うなら for...of が読みやすい。",
      "「一覧を全部表示する」「合計を出す」といった処理の基本になる。",
    ],
    points: ["for (let i = 0; i < 5; i++) は「i を 0 から 4 まで 1 ずつ増やしながら5回」"],
    example: `// 決まった回数
for (let i = 1; i <= 3; i++) {
  console.log(\`\${i}回目\`);
}

// 配列を順番に
const colors = ["赤", "青", "緑"];
for (const c of colors) {
  console.log(c);
}`,
    task: {
      prompt: "for を使って、1 から 5 までの数を順番に出力しよう。",
      starter: `for (let i = 1; i <= 5; i++) {
  console.log(i);
}`,
      hint: "i <= 5 の 5 を変えると回数が変わる。i++ は「i を 1 増やす」。",
      check: (logs, code) => logs.filter((l) => l.type === "log").length >= 3 && /(for|while)/.test(code),
    },
  },
  {
    id: "object", module: M1, title: "オブジェクト — データのまとまり",
    paras: [
      "関連する値を「キー: 値」の組でまとめるのがオブジェクト。{} で囲む。",
      "値の取り出しは obj.key（ドット）。値には文字列・数値・配列・別のオブジェクトなど何でも入る。",
      "実際のデータは「オブジェクトの配列」でよく表される（例：ユーザー一覧）。配列とオブジェクトの合わせ技。",
    ],
    points: ["user.name で取得、user.name = \"...\" で変更もできる"],
    example: `const user = {
  name: "Sato",
  age: 28,
  hobbies: ["読書", "登山"],
};

console.log(user.name);
console.log(user.hobbies[0]);

// オブジェクトの配列
const users = [
  { name: "Aoi", age: 24 },
  { name: "Ken", age: 31 },
];
console.log(users[1].name);   // Ken`,
    task: {
      prompt: "name・age・city の3つを持つオブジェクト profile を作り、name と city を出力しよう。",
      starter: `const profile = {
  name: "Sato",
  age: 28,
  city: "Tokyo",
};

console.log(profile.name);
console.log(profile.city);`,
      hint: "profile.city のようにドットで取り出す。値は自由に変えてOK。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /\{[\s\S]*:/.test(code) && /\.\w+/.test(code),
    },
  },
  {
    id: "scope", module: M2, title: "スコープ — 変数が届く範囲",
    paras: [
      "変数には「使える範囲（スコープ）」がある。{} の中で宣言した const / let は、その中だけで有効。外からは見えない。",
      "これによって、別々の場所で同じ名前を使っても衝突しない。プログラムが大きくなるほど効いてくる。",
      "関数の中で宣言した変数も同じで、関数の外からは触れない。中の値を外へ出すには return を使う。",
    ],
    points: ["ブロック {} の外で宣言 → どこからでも／中で宣言 → その中だけ", "const を基本にする理由の一つ：書き換わる範囲を狭く保てる"],
    example: `const outer = "外側";

if (true) {
  const inner = "内側";
  console.log(outer);   // 外の変数は見える
  console.log(inner);   // 内の変数も見える
}

// console.log(inner); // ← ここで使うとエラー（範囲外）
console.log(outer);`,
    task: {
      prompt: "関数 makeMessage の中で変数 msg を宣言し、それを return して、外で出力しよう。",
      starter: `const makeMessage = () => {
  const msg = "関数の中で作った文字";
  return msg;
};

console.log(makeMessage());`,
      hint: "msg は関数の中だけの変数。return msg でその値を外に渡している。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /return/.test(code),
    },
  },
  {
    id: "hof", module: M2, title: "高階関数 — map / filter / reduce",
    paras: [
      "関数は「値」として扱えて、他の関数に引数として渡せる。関数を受け取る／返す関数を高階関数という。",
      "配列の map（全部を変換）・filter（条件で絞る）・reduce（1つの値にまとめる）がその代表で、ループを書くより短く明確になる。",
      "実務で最も多用する道具の一つ。for で書いていた処理の多くがこれで置き換わる。",
    ],
    points: ["map: 数はそのまま中身を加工 / filter: 条件に合う要素だけ残す / reduce: 合計などにまとめる"],
    example: `const nums = [1, 2, 3, 4];

const doubled = nums.map((n) => n * 2);          // [2,4,6,8]
const evens   = nums.filter((n) => n % 2 === 0); // [2,4]
const total   = nums.reduce((sum, n) => sum + n, 0); // 10

console.log(doubled);
console.log(evens);
console.log(total);`,
    task: {
      prompt: "配列 prices = [100, 250, 400] の合計を reduce で求めて出力しよう。",
      starter: `const prices = [100, 250, 400];
const total = prices.reduce((sum, p) => sum + p, 0);
console.log(total);`,
      hint: "reduce の第2引数 0 は合計の初期値。sum に足し込まれていく。答えは 750。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /\.(reduce|map|filter)/.test(code),
    },
  },
  {
    id: "destr", module: M2, title: "分割代入とスプレッド",
    paras: [
      "オブジェクトや配列から値を取り出して変数にするのが分割代入（destructuring）。必要な値を一気に取り出せる。",
      "... （スプレッド）は、配列やオブジェクトを「展開」する。コピー・結合・要素の追加を簡潔に書ける。",
      "React などモダンなコードでは常識的に使われる書き方なので、ここで慣れておく。",
    ],
    points: ["const { name } = user は user.name を取り出して name に入れる", "[...a, ...b] は2つの配列を1つにした新しい配列"],
    example: `const user = { name: "Sato", age: 28 };

// 分割代入：必要な値を取り出す
const { name, age } = user;
console.log(name, age);

// スプレッド：コピーして一部だけ変える
const updated = { ...user, age: 29 };
console.log(updated);        // {name:"Sato", age:29}

const a = [1, 2];
const b = [3, 4];
console.log([...a, ...b]);   // [1,2,3,4]`,
    task: {
      prompt: "オブジェクト book = { title: \"...\", price: 500 } から title を分割代入で取り出して出力しよう。",
      starter: `const book = { title: "JS入門", price: 500 };
const { title } = book;
console.log(title);`,
      hint: "const { title } = book; で book.title が title に入る。",
      check: (logs, code) => logs.some((l) => l.type === "log") && (/\{\s*\w+[\s\S]*\}\s*=/.test(code) || /\.\.\./.test(code)),
    },
  },
  {
    id: "error", module: M2, title: "エラーと例外処理",
    paras: [
      "プログラムは失敗することがある（データが無い、通信が切れる、など）。何もしないと、そこで処理全体が止まってしまう。",
      "try の中で失敗が起きても、catch がそれを受け止めて、プログラムを止めずに続けられる。これが例外処理。",
      "自分で throw を使ってエラーを起こすこともでき、「ありえない状態」を早めに知らせられる。",
    ],
    points: ["try { 危ない処理 } catch (e) { 失敗したときの処理 }", "catch の e にはエラー情報が入る（e.message でメッセージ）"],
    example: `const divide = (a, b) => {
  if (b === 0) {
    throw new Error("0では割れない");
  }
  return a / b;
};

try {
  console.log(divide(10, 2));   // 5
  console.log(divide(10, 0));   // ここで throw される
  console.log("この行は実行されない");
} catch (e) {
  console.log("エラー:", e.message);
}

console.log("プログラムは続く");`,
    task: {
      prompt: "try / catch を使って、わざと throw new Error(\"test\") を起こし、catch でそのメッセージを出力しよう。",
      starter: `try {
  throw new Error("test");
} catch (e) {
  console.log("捕まえた:", e.message);
}`,
      hint: "throw でエラーを投げると、すぐ下の catch に飛ぶ。e.message にメッセージが入っている。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /try/.test(code) && /catch/.test(code),
    },
  },
  {
    id: "async", module: M2, title: "非同期 — 時間のかかる処理を待つ",
    paras: [
      "コードは基本、上から順（同期的）に実行される。でも「サーバーからデータを取る」ような時間のかかる処理を普通に待つと、その間すべてが止まってしまう。",
      "そこで JS は、時間のかかる処理を「後回しにして先に進み、終わったら結果を受け取る」非同期の仕組みを持つ。今の主流は async / await。",
      "await をつけると「その処理が終わるまで待ってから」次の行へ進む。ここでは擬似API fetchUsers() で体験する（実際の通信の書き方と同じ）。",
    ],
    points: ["await の結果を受け取ってから、次の処理に使える", "await をつけ忘れると、まだ取れていない“途中”の値が返ってしまう"],
    example: `console.log("取得を開始");

// fetchUsers() はデータを返す擬似API（少し時間がかかる）
const users = await fetchUsers();

console.log(\`\${users.length}人 取得\`);
users.forEach((u) => console.log(u.name));

console.log("完了");`,
    task: {
      prompt: "fetchUsers() でユーザー一覧を取得し、最初の1人の name を出力しよう。",
      starter: `const users = await fetchUsers();

console.log(users[0].name);`,
      hint: "await fetchUsers() で配列を受け取り、users[0].name で最初の人の名前を取り出す。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /await/.test(code),
    },
  },
];

const roadmap = ["Module 03 — ブラウザとDOM", "Module 04 — TypeScript", "Module 05 — React / Next.js"];

// ---------- サイドバーの1項目 ----------
function StepItem({ index, lesson, active, done, isLast, onClick }) {
  return (
    <button onClick={onClick} style={{ textAlign: "left", position: "relative" }}
      className="w-full flex gap-3 items-start pl-1 pr-2 py-2 rounded-lg transition-colors">
      {!isLast && <span style={{ position: "absolute", left: 20, top: 34, bottom: -6, width: 2, background: done ? C.accent : C.line }} />}
      <span style={{
        width: 26, height: 26, borderRadius: 999, flexShrink: 0, zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
        background: done ? C.accent : active ? C.card : C.canvas,
        color: done ? "#fff" : active ? C.accent : C.faint,
        border: `2px solid ${done ? C.accent : active ? C.accent : C.line}`,
      }}>
        {done ? <Check size={14} strokeWidth={3} /> : index + 1}
      </span>
      <span style={{ paddingTop: 3 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: active ? 700 : 500, color: active ? C.ink : C.sub, lineHeight: 1.35 }}>
          {lesson.title}
        </span>
      </span>
    </button>
  );
}

// ---------- コードエディタ ----------
function CodeEditor({ value, onChange, onRun, onReset, running }) {
  const ref = useRef(null);
  const handleKey = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target, s = el.selectionStart, en = el.selectionEnd;
      onChange(value.slice(0, s) + "  " + value.slice(en));
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onRun(); }
  };
  return (
    <div style={{ background: C.editor, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #232838" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#ff5f57" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#febc2e" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#28c840" }} />
          <span style={{ color: "#6b7392", fontSize: 12, marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>script.js</span>
        </div>
        <button onClick={onReset} title="最初のコードに戻す" style={{ color: "#6b7392", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
          <RotateCcw size={13} /> リセット
        </button>
      </div>
      <textarea ref={ref} value={value} spellCheck={false}
        onChange={(e) => onChange(e.target.value)} onKeyDown={handleKey}
        style={{ width: "100%", minHeight: 190, resize: "vertical", padding: "16px 18px", background: "transparent",
          color: C.editorInk, border: "none", outline: "none", fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 14.5, lineHeight: 1.7, tabSize: 2 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 14px", borderTop: "1px solid #232838" }}>
        <button onClick={onRun} disabled={running}
          style={{ display: "flex", alignItems: "center", gap: 7, background: C.accent, color: "#fff", padding: "9px 18px",
            borderRadius: 10, fontWeight: 700, fontSize: 14.5, opacity: running ? 0.6 : 1, cursor: running ? "default" : "pointer" }}>
          <Play size={15} fill="#fff" /> {running ? "実行中…" : "実行する"}
        </button>
      </div>
    </div>
  );
}

// ---------- コンソール ----------
function ConsoleOutput({ logs, ran }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, color: C.sub, fontSize: 13, fontWeight: 600 }}>
        <Terminal size={15} /> 実行結果
      </div>
      <div style={{ background: "#0C0F17", borderRadius: 12, padding: "14px 16px", minHeight: 70,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 14, lineHeight: 1.7 }}>
        {!ran && <div style={{ color: "#5b6178" }}>▶ 「実行する」を押すと、ここに結果が出るよ</div>}
        {ran && logs.length === 0 && <div style={{ color: "#5b6178" }}>（出力なし）console.log で何か出してみよう</div>}
        {logs.map((l, i) => (
          <div key={i} style={{ color: l.type === "error" ? "#ff7b7b" : l.type === "warn" ? "#ffcf70" : "#d5dbec", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {l.type === "error" ? "⚠ " : ""}{l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- レッスン本文 ----------
function LessonContent({ lesson, code, setCode, output, ran, running, onRun, onReset, cleared, onNext, isLastLesson, isModuleEnd, nextModule }) {
  const [showHint, setShowHint] = useState(false);
  useEffect(() => { setShowHint(false); }, [lesson.id]);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ color: C.accent, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>{lesson.module}</div>
      <h1 style={{ fontSize: 27, fontWeight: 800, color: C.ink, letterSpacing: "-0.01em", marginBottom: 18, lineHeight: 1.25 }}>{lesson.title}</h1>

      {lesson.paras.map((p, i) => (
        <p key={i} style={{ color: "#3a4051", fontSize: 15.5, lineHeight: 1.85, marginBottom: 12 }}>{p}</p>
      ))}
      {lesson.points && (
        <ul style={{ margin: "8px 0 22px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {lesson.points.map((pt, i) => (
            <li key={i} style={{ display: "flex", gap: 9, color: C.sub, fontSize: 14, lineHeight: 1.6 }}>
              <span style={{ color: C.accent, fontWeight: 800, flexShrink: 0 }}>·</span><span>{pt}</span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, marginBottom: 8 }}>例を読む</div>
      <pre style={{ background: C.editor, color: C.editorInk, borderRadius: 14, padding: "16px 18px", overflowX: "auto",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>{lesson.example}</pre>

      <div style={{ background: C.accentSoft, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.accent, letterSpacing: "0.04em", marginBottom: 6 }}>やってみよう</div>
        <div style={{ color: C.ink, fontSize: 15.5, lineHeight: 1.7 }}>{lesson.task.prompt}</div>
        <button onClick={() => setShowHint((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, color: C.accent, fontSize: 13, fontWeight: 600, marginTop: 12 }}>
          <Lightbulb size={14} /> {showHint ? "ヒントを閉じる" : "ヒントを見る"}
        </button>
        {showHint && <div style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.7, marginTop: 8 }}>{lesson.task.hint}</div>}
      </div>

      <CodeEditor value={code} onChange={setCode} onRun={onRun} onReset={onReset} running={running} />
      <div style={{ height: 20 }} />
      <ConsoleOutput logs={output} ran={ran} />

      {cleared && (
        <div style={{ background: C.okSoft, border: `1px solid ${C.ok}33`, borderRadius: 14, padding: "16px 18px", marginTop: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Sparkles size={20} style={{ color: C.ok, flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: "#0a7a64", fontSize: 15 }}>クリア！</div>
            <div style={{ color: "#2f6b5e", fontSize: 14, lineHeight: 1.7, marginTop: 2 }}>
              {isLastLesson
                ? "Module 01–02 完走、おつかれさま。変数・関数・制御・データ構造・高階関数・エラー処理・非同期まで、JavaScript の考え方の土台がひと通り手に入った。次は実際に Web ページを動かす DOM、そして TypeScript → React。準備できたらチャットで「次いこう」と言って。"
                : isModuleEnd
                  ? `${lesson.module} を完了。ここから ${nextModule} に入る。実務で効いてくる、一歩踏み込んだ内容。`
                  : "その調子。次のレッスンへ進もう。"}
            </div>
            {!isLastLesson && (
              <button onClick={onNext} style={{ display: "flex", alignItems: "center", gap: 6, background: C.ok, color: "#fff", padding: "8px 16px", borderRadius: 9, fontWeight: 700, fontSize: 14, marginTop: 12 }}>
                次のレッスンへ <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}

// ---------- アプリ本体 ----------
export default function App() {
  const [currentId, setCurrentId] = useState(lessons[0].id);
  const [completed, setCompleted] = useState([]);
  const [codeByLesson, setCodeByLesson] = useState({});
  const [output, setOutput] = useState([]);
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const idx = lessons.findIndex((l) => l.id === currentId);
  const lesson = lessons[idx];
  const nextLesson = lessons[idx + 1];
  const isLastLesson = idx === lessons.length - 1;
  const isModuleEnd = !isLastLesson && nextLesson && nextLesson.module !== lesson.module;
  const code = codeByLesson[currentId] ?? lesson.task.starter;
  const setCode = (v) => setCodeByLesson((m) => ({ ...m, [currentId]: v }));

  useEffect(() => {
    (async () => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          const c = await window.storage.get("codelog:completed");
          if (c && c.value) setCompleted(JSON.parse(c.value));
          const cd = await window.storage.get("codelog:code");
          if (cd && cd.value) setCodeByLesson(JSON.parse(cd.value));
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.storage && window.storage.set("codelog:completed", JSON.stringify(completed)); } catch (e) {}
  }, [completed, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => { try { window.storage && window.storage.set("codelog:code", JSON.stringify(codeByLesson)); } catch (e) {} }, 800);
    return () => clearTimeout(t);
  }, [codeByLesson, loaded]);

  const goTo = (id) => {
    setCurrentId(id); setOutput([]); setRan(false); setCleared(false); setMenuOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRun = async () => {
    setRunning(true);
    const logs = await runCode(code);
    setOutput(logs); setRan(true);
    if (lesson.task.check(logs, code)) {
      setCleared(true);
      setCompleted((prev) => (prev.includes(lesson.id) ? prev : [...prev, lesson.id]));
    } else { setCleared(false); }
    setRunning(false);
  };

  const handleReset = () => { setCode(lesson.task.starter); setOutput([]); setRan(false); setCleared(false); };
  const handleNext = () => { if (idx < lessons.length - 1) goTo(lessons[idx + 1].id); };

  const doneCount = completed.length;
  const pct = Math.round((doneCount / lessons.length) * 100);

  const Sidebar = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "22px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 21, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", fontFamily: "'JetBrains Mono', monospace" }}>codelog</span>
          <span style={{ fontSize: 11, color: C.faint, fontFamily: "'JetBrains Mono', monospace" }}>()</span>
        </div>
        <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4, lineHeight: 1.5 }}>JavaScript を、基礎から本格的に</div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.sub, marginBottom: 6 }}>
            <span>進捗</span><span style={{ fontWeight: 700, color: C.accent }}>{doneCount} / {lessons.length}</span>
          </div>
          <div style={{ height: 6, background: C.line, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: C.accent, borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 8px" }}>
        {lessons.map((l, i) => {
          const showHeader = i === 0 || lessons[i - 1].module !== l.module;
          const stepIsLast = isLastLesson ? i === lessons.length - 1 : (i === lessons.length - 1 || lessons[i + 1].module !== l.module);
          return (
            <React.Fragment key={l.id}>
              {showHeader && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: C.faint, padding: "16px 8px 8px" }}>{l.module}</div>}
              <StepItem index={i} lesson={l} active={l.id === currentId} done={completed.includes(l.id)} isLast={stepIsLast} onClick={() => goTo(l.id)} />
            </React.Fragment>
          );
        })}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: C.faint, padding: "20px 8px 8px" }}>これから</div>
        {roadmap.map((r) => (
          <div key={r} style={{ display: "flex", gap: 12, alignItems: "center", padding: "7px 8px", color: C.faint, fontSize: 13.5 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, border: `2px dashed ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Lock size={12} />
            </span>
            {r}
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; }
        body, button, textarea, input { font-family: 'Noto Sans JP', system-ui, -apple-system, sans-serif; }
        button { background: none; border: none; cursor: pointer; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: #d7dae4; border-radius: 999px; border: 2px solid ${C.canvas}; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; scroll-behavior: auto !important; } }
      `}</style>

      <div style={{ display: "flex", maxWidth: 1180, margin: "0 auto", minHeight: "100vh" }}>
        <aside className="hidden md:block" style={{ width: 288, borderRight: `1px solid ${C.line}`, background: "#FAFBFC", position: "sticky", top: 0, height: "100vh" }}>
          {Sidebar}
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div className="md:hidden" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.line}`, background: "#FAFBFC", position: "sticky", top: 0, zIndex: 20 }}>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>codelog</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12.5, color: C.accent, fontWeight: 700 }}>{doneCount}/{lessons.length}</span>
              <button onClick={() => setMenuOpen(true)} style={{ color: C.ink }}><Menu size={22} /></button>
            </div>
          </div>

          <div style={{ padding: "34px 22px 20px" }}>
            <LessonContent lesson={lesson} code={code} setCode={setCode} output={output} ran={ran} running={running}
              onRun={handleRun} onReset={handleReset} cleared={cleared} onNext={handleNext}
              isLastLesson={isLastLesson} isModuleEnd={isModuleEnd} nextModule={nextLesson ? nextLesson.module : ""} />
          </div>
        </main>
      </div>

      {menuOpen && (
        <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(20,24,34,0.4)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 300, maxWidth: "84%", background: "#FAFBFC", boxShadow: "0 0 40px rgba(0,0,0,0.2)", overflowY: "auto" }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", right: 14, top: 16, color: C.sub, zIndex: 2 }}><X size={22} /></button>
            {Sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
