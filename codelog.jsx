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
  const fetchPosts = () => new Promise((res) => setTimeout(() => res([
    { author: "Aoi", title: "朝のコーヒー記録" },
    { author: "Ken", title: "週末の登山ログ" },
    { author: "Aoi", title: "読書メモ #12" },
    { author: "Mei", title: "自作キーボード日記" },
    { author: "Ken", title: "ランニング 5km" },
  ]), 250));
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", "fetchUsers", "fetchPosts", `return (async () => {\n${code}\n})();`);
    await fn(sandboxConsole, fetchUsers, fetchPosts);
  } catch (e) {
    logs.push({ type: "error", text: String(e && e.message ? e.message : e) });
  }
  return logs;
}

// ---------- レッスン ----------
const M1 = "MODULE 01 — 土台";
const M2 = "MODULE 02 — 一歩深く";
const M3 = "MODULE 03 — データを自在に";
const M4 = "MODULE 04 — 設計とモダンJS";
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
  {
    id: "strings", module: M3, title: "文字列を操る",
    paras: [
      "文字列はデータ処理の主役。メソッド（値にくっついた関数）で加工する。よく使うのは trim（前後の空白除去）、toUpperCase / toLowerCase、includes（含む？）、split（切り分けて配列に）、replaceAll（置換）。",
      "大事な性質がひとつ：文字列のメソッドは元の値を変えず、新しい文字列を返す。",
    ],
    points: ["「メソッド」= 値にくっついた関数。文字列.メソッド名() で呼ぶ", "split は文字列 → 配列への入口。データ処理で多用する"],
    example: `const raw = "  JavaScript is Fun  ";
const s = raw.trim();                    // 前後の空白を除去

console.log(s.toUpperCase());
console.log(s.includes("Fun"));          // true
console.log(s.split(" "));               // 単語の配列
console.log(s.replaceAll("Fun", "Powerful"));`,
    task: {
      prompt: "文字列 csv = \"apple,banana,grape\" を split(\",\") で配列にして、要素数と2番目の要素を出力しよう。",
      starter: `const csv = "apple,banana,grape";
const items = csv.split(",");

console.log(items.length);
console.log(items[1]);`,
      hint: "split(\",\") がカンマで切り分ける。items[1] は2番目（0から数えるため）。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /\.split\(/.test(code),
    },
  },
  {
    id: "math", module: M3, title: "数値と Math",
    paras: [
      "数値まわりの道具箱が Math。丸め（round / floor / ceil）、最大最小（max / min）、乱数（random）などが揃っている。",
      "小数の表示桁を揃えるのは toFixed(桁数)。ただし返り値は文字列になる点に注意。逆に文字列を数値にするのは Number()。",
    ],
    points: ["Math.random() は 0以上1未満。サイコロは Math.floor(Math.random() * 6) + 1", "toFixed の返り値は文字列"],
    example: `console.log(Math.round(3.6));        // 4
console.log(Math.max(10, 25, 7));    // 25

const avg = (80 + 92 + 77) / 3;
console.log(avg.toFixed(1));         // 83.0

console.log(Math.floor(Math.random() * 6) + 1);  // サイコロ`,
    task: {
      prompt: "scores = [3.7, 8.2, 5.1] の平均を reduce で求めて、toFixed(1) で出力しよう（M02の復習込み）。",
      starter: `const scores = [3.7, 8.2, 5.1];

const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
console.log(avg.toFixed(1));`,
      hint: "合計は reduce、平均は length で割る。toFixed(1) で小数1桁に揃う。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /(toFixed|Math\.)/.test(code),
    },
  },
  {
    id: "arr2", module: M3, title: "配列メソッド続編 — 検索と並べ替え",
    paras: [
      "「探す」道具：find（条件に合う最初の1件）、some（1つでも合う？）、every（全部合う？）。",
      "「並べ替え」は sort。ただし数値は比較関数 (a, b) => a - b が必須で、書かないと文字として並ぶ罠がある。もうひとつ、sort は元の配列を書き換える（破壊的）ので、元を守りたいときは [...arr].sort(...) とコピーしてから並べ替える。",
    ],
    points: ["(a, b) => a - b で昇順、(a, b) => b - a で降順", "find は見つからないと undefined を返す"],
    example: `const users = [
  { name: "Aoi", age: 24 },
  { name: "Ken", age: 31 },
  { name: "Mei", age: 28 },
];

const over30 = users.find((u) => u.age >= 30);
console.log(over30.name);                       // Ken
console.log(users.some((u) => u.age < 25));     // true
console.log(users.every((u) => u.age >= 20));   // true

const ages = users.map((u) => u.age);
console.log([...ages].sort((a, b) => b - a));   // 降順`,
    task: {
      prompt: "nums = [40, 5, 100, 23] を昇順に並べ替えて出力しよう（元の配列は壊さずに）。",
      starter: `const nums = [40, 5, 100, 23];

const sorted = [...nums].sort((a, b) => a - b);
console.log(sorted);`,
      hint: "(a, b) => a - b が昇順。b - a に変えると降順になるのも試してみよう。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /\.sort/.test(code),
    },
  },
  {
    id: "mapset", module: M3, title: "Map と Set",
    paras: [
      "Set は「重複しない値の集まり」。同じ値は1つしか入らないので、重複除去の定番道具になる。",
      "Map は「キーと値のペア」の入れ物。オブジェクトに似ているが、追加・削除が頻繁な場面や、個数（size）を扱う場面で便利。",
    ],
    points: ["[...new Set(配列)] が重複除去のイディオム", "Map は set / get / has / size で操作する"],
    example: `const tags = ["js", "web", "js", "app", "web"];
const unique = [...new Set(tags)];
console.log(unique);              // ["js","web","app"]

const stock = new Map();
stock.set("apple", 3);
stock.set("banana", 5);
console.log(stock.get("apple"));  // 3
console.log(stock.size);          // 2`,
    task: {
      prompt: "numbers = [1, 2, 2, 3, 3, 3] から Set を使って重複を除いた配列を作り、出力しよう。",
      starter: `const numbers = [1, 2, 2, 3, 3, 3];

const unique = [...new Set(numbers)];
console.log(unique);`,
      hint: "new Set(numbers) で重複が消え、[... ] で配列に戻す。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /new Set/.test(code),
    },
  },
  {
    id: "json", module: M3, title: "JSON — データを文字にして運ぶ",
    paras: [
      "JSON は「データを文字列にして運ぶ・保存する」ための世界共通フォーマット。API通信も、ブラウザへの保存も、中身はほぼ全部 JSON 文字列でできている。",
      "JSON.stringify(値) で文字列化、JSON.parse(文字列) で元のデータに復元。この往復がすべての基本。",
    ],
    points: ["通信・保存の直前に stringify、受け取った直後に parse", "stringify(値, null, 2) とすると人間が読みやすい整形付きになる"],
    example: `const user = { name: "Aoi", age: 24 };

const text = JSON.stringify(user);
console.log(text);             // '{"name":"Aoi","age":24}'
console.log(typeof text);      // string（ただの文字列になった）

const back = JSON.parse(text);
console.log(back.name);        // Aoi（オブジェクトに戻った）`,
    task: {
      prompt: "好きなオブジェクトを stringify → parse で往復させて、復元後のプロパティを1つ出力しよう。",
      starter: `const item = { title: "ノート", price: 300 };

const text = JSON.stringify(item);
const restored = JSON.parse(text);

console.log(text);
console.log(restored.price);`,
      hint: "stringify で文字列に、parse でオブジェクトに戻る。typeof text も見てみると型の変化がわかる。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /JSON\.stringify/.test(code) && /JSON\.parse/.test(code),
    },
  },
  {
    id: "date", module: M3, title: "日付と時間",
    paras: [
      "日付と時間は new Date() で扱う。現在時刻は new Date()、特定の日付は new Date(\"2026-01-01\") のように作り、getFullYear() などで部品を取り出す。",
      "有名な罠がひとつ：getMonth() は 0 始まり（1月が 0）。+1 を忘れずに。また、日付同士の引き算はミリ秒の差になるので、日数にしたければ 1000 * 60 * 60 * 24 で割る。",
    ],
    points: ["getMonth() + 1 が実際の月", "日付 − 日付 = ミリ秒差。日数換算は ÷ (1000*60*60*24)"],
    example: `const now = new Date();
console.log(now.getFullYear());
console.log(now.getMonth() + 1);   // 0始まりなので +1

const start = new Date("2026-01-01");
const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
console.log(\`今年が始まって\${days}日\`);`,
    task: {
      prompt: "自分の誕生日を new Date(\"YYYY-MM-DD\") で作り、生まれてから今日までの日数を計算して出力しよう。",
      starter: `const birth = new Date("2000-01-01");
const now = new Date();

const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
console.log(\`生まれてから\${days}日\`);`,
      hint: "日付の引き算はミリ秒。1000*60*60*24 で割ると日数になる。誕生日を自分のものに変えよう。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /new Date/.test(code),
    },
  },
  {
    id: "ex1", module: M3, title: "ミニ演習 ① — 成績集計",
    paras: [
      "ここまでの M03 を総動員する章末演習。データの集計は「絞る → 並べる → 出力する → まとめる」の流れで組む。実務のデータ処理もほぼこの型。",
      "下のコードは途中まで完成している。TODO の部分を自分で書いて仕上げよう。",
    ],
    points: ["書けない部分が出たら、その概念のレッスンに戻ってOK（それが正しい使い方）"],
    example: `// 流れの見本: 絞る → 並べる → 出力
const items = [
  { name: "A", score: 62 },
  { name: "B", score: 88 },
];
const passed = items.filter((i) => i.score >= 70);
const ranked = [...passed].sort((a, b) => b.score - a.score);
ranked.forEach((i) => console.log(\`\${i.name}: \${i.score}\`));`,
    task: {
      prompt: "合格者（70点以上）の一覧表示までは完成している。TODO 部分に「全員の平均点」を toFixed(1) で出力するコードを書き足そう。",
      starter: `const students = [
  { name: "Aoi", score: 82 },
  { name: "Ken", score: 65 },
  { name: "Mei", score: 91 },
  { name: "Yu",  score: 74 },
];

// 1) 70点以上に絞って、高い順に並べる
const passed = [...students]
  .filter((s) => s.score >= 70)
  .sort((a, b) => b.score - a.score);

// 2) 一覧を出力
passed.forEach((s) => console.log(\`\${s.name}: \${s.score}点\`));

// 3) TODO: 全員(students)の平均点を toFixed(1) で出力する`,
      hint: "平均 = students.reduce((sum, s) => sum + s.score, 0) / students.length。それを console.log(avg.toFixed(1)) で出力。",
      check: (logs, code) => logs.filter((l) => l.type === "log").length >= 4 && /filter/.test(code) && /sort/.test(code),
    },
  },
  {
    id: "closure", module: M4, title: "クロージャ — 関数が記憶を持つ",
    paras: [
      "関数は、自分が作られた場所の変数を「覚えて」いられる。外からは触れない変数に、返した内側の関数からだけは触れる——この性質をクロージャと呼ぶ。",
      "「外から勝手に変えられない状態を持つ」ための重要な道具で、あとで学ぶ React の state も、根っこはこの仕組みの上に立っている。",
    ],
    points: ["内側の関数が、外側の変数を保持し続ける", "count に触れる手段は返した関数だけ = 安全"],
    example: `const createCounter = () => {
  let count = 0;              // 外からは見えない
  return () => {
    count = count + 1;        // でも、この関数からは触れる
    return count;
  };
};

const counter = createCounter();
console.log(counter());   // 1
console.log(counter());   // 2
console.log(counter());   // 3`,
    task: {
      prompt: "createCounter を改造して、呼ぶたびに 10 ずつ増えるカウンタを作り、2回呼んで 10, 20 と出力しよう。",
      starter: `const createCounter = () => {
  let count = 0;
  return () => {
    count = count + 10;
    return count;
  };
};

const counter = createCounter();
console.log(counter());
console.log(counter());`,
      hint: "増やす量を +10 に変えるだけ。createCounter() をもう1つ作ると、別々に数えられるのも確認できる。",
      check: (logs, code) => logs.filter((l) => l.type === "log").length >= 2 && (code.match(/=>/g) || []).length >= 2,
    },
  },
  {
    id: "class", module: M4, title: "クラス — 設計図からオブジェクトを作る",
    paras: [
      "同じ形のオブジェクトをたくさん作るなら、設計図 = クラスを書いて new で量産する。constructor が初期化の処理、this は「いま作られている自分自身」を指す。",
      "JS は関数だけでも十分書けるが、「ユーザー」「商品」のような概念のまとまりを表すときはクラスが読みやすい。",
    ],
    points: ["new クラス名(引数) でインスタンス（実体）が生まれる", "メソッド内の this.name = 自分自身の name"],
    example: `class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  introduce() {
    return \`\${this.name}（\${this.age}歳）です\`;
  }
}

const aoi = new User("Aoi", 24);
const ken = new User("Ken", 31);
console.log(aoi.introduce());
console.log(ken.introduce());`,
    task: {
      prompt: "title と price を持つ class Product を作り、「◯◯は◯円」を返す describe() メソッドを実装して出力しよう。",
      starter: `class Product {
  constructor(title, price) {
    this.title = title;
    this.price = price;
  }
  describe() {
    return \`「\${this.title}」は\${this.price}円\`;
  }
}

const p = new Product("ノート", 300);
console.log(p.describe());`,
      hint: "this.title がこの商品自身の title。new Product(...) をもう1つ作って量産も試そう。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /class\s+\w+/.test(code),
    },
  },
  {
    id: "promise", module: M4, title: "Promise を理解する",
    paras: [
      "async / await の下で動いている本体が Promise ——「あとで値が届く」という約束のオブジェクト。M02 で使った await は、正確には「Promise の結果が届くまで待つ」という意味だった。ここでつながる。",
      "new Promise で自作もできる。定番は「指定ミリ秒待つ」wait 関数で、時間差のある処理を組むときの基本部品になる。",
    ],
    points: ["await X =「X という Promise の結果が届くまで待つ」", "setTimeout(実行する関数, ミリ秒) が時限装置の役"],
    example: `// ms ミリ秒待つ Promise を作る定番の関数
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("スタート");
await wait(300);
console.log("0.3秒たった");
await wait(300);
console.log("さらに0.3秒たった");`,
    task: {
      prompt: "wait を使って、「3」「2」「1」を 0.2 秒間隔でカウントダウン出力しよう。",
      starter: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log(3);
await wait(200);
console.log(2);
await wait(200);
console.log(1);`,
      hint: "余裕があれば for ループ + await で書き直してみよう（同じ書き方でループ内でも待てる）。",
      check: (logs, code) => logs.filter((l) => l.type === "log").length >= 3 && /new Promise/.test(code),
    },
  },
  {
    id: "parallel", module: M4, title: "並列で待つ — Promise.all",
    paras: [
      "await を縦に並べると「直列」= 前が終わるまで次が始まらない。互いに関係のない取得なら「並列」で同時に走らせたほうが速い。それをやるのが Promise.all。",
      "配列で渡した Promise を全部同時に開始し、全部届いたら結果の配列が返ってくる。分割代入（M02）で受け取るときれいに書ける。",
    ],
    points: ["直列: await A; await B ／ 並列: await Promise.all([A, B])", "1つでも失敗すると全体が失敗扱いになる"],
    example: `// fetchUsers / fetchPosts は少し時間のかかる擬似API
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);

console.log(\`ユーザー: \${users.length}人\`);
console.log(\`投稿: \${posts.length}件\`);`,
    task: {
      prompt: "Promise.all で両方を取得し、最初のユーザーの name と最初の投稿の title を出力しよう。",
      starter: `const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);

console.log(users[0].name);
console.log(posts[0].title);`,
      hint: "結果は渡した順番で返ってくる。[users, posts] の分割代入は M02 の復習。",
      check: (logs, code) => logs.some((l) => l.type === "log") && /Promise\.all/.test(code),
    },
  },
  {
    id: "optional", module: M4, title: "?. と ?? — 安全に値へたどり着く",
    paras: [
      "深い場所の値を取りに行くとき、途中が undefined だとエラーで落ちる。?.（オプショナルチェーン）は「無ければそこで止まって undefined を返す」安全な道。",
      "??（Null合体演算子）は「左が null / undefined のときだけ右を使う」。デフォルト値の定番で、|| と違って 0 や空文字を有効な値として通してくれる。",
    ],
    points: ["obj?.a?.b — 途中に無いものがあっても落ちない", "値 ?? デフォルト — null / undefined のときだけ右側が発動"],
    example: `const user = {
  name: "Aoi",
  profile: { city: "Tokyo" },
};
const guest = { name: "Ken" };   // profile なし

console.log(user.profile?.city);               // Tokyo
console.log(guest.profile?.city);              // undefined（落ちない）
console.log(guest.profile?.city ?? "未設定");   // 未設定

const count = 0;
console.log(count ?? 10);   // 0（?? は 0 を通す）`,
    task: {
      prompt: "profile を持たないオブジェクトから、?. と ?? を組み合わせて「未登録」と出力しよう。",
      starter: `const member = { name: "Yu" };

console.log(member.profile?.city ?? "未登録");`,
      hint: "profile が無い → ?. が undefined を返す → ?? が右側を採用、という流れ。",
      check: (logs, code) => logs.some((l) => l.type === "log") && (/\?\./.test(code) || /\?\?/.test(code)),
    },
  },
  {
    id: "ex2", module: M4, title: "ミニ演習 ② — 小さなデータの旅",
    paras: [
      "最終演習。並列取得 → データの突き合わせ → 集計 → 整形出力、まで通しでやる。これは実際のアプリの中身とほぼ同じ流れ。",
      "TODO は「各ユーザーの投稿数を数える」部分。filter と length で書ける。",
    ],
    points: ["詰まったら該当レッスンに戻る。戻るのは後退じゃなく設計通り"],
    example: `// 「突き合わせ」の見本: 名前が一致する要素を数える
const posts = [{ author: "Aoi" }, { author: "Ken" }, { author: "Aoi" }];

const aoiCount = posts.filter((p) => p.author === "Aoi").length;
console.log(aoiCount);   // 2`,
    task: {
      prompt: "全ユーザーについて「名前: N件」の形で投稿数を出力しよう（TODO の1行を完成させる）。",
      starter: `const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);

console.log(\`\${users.length}人のユーザー、\${posts.length}件の投稿\`);

users.forEach((u) => {
  // TODO: この u の投稿数を posts から数えて count に入れる
  const count = 0;
  console.log(\`\${u.name}: \${count}件\`);
});`,
      hint: "const count = posts.filter((p) => p.author === u.name).length;",
      check: (logs, code) => logs.filter((l) => l.type === "log").length >= 4 && /Promise\.all/.test(code) && /filter/.test(code),
    },
  },
];

const roadmap = ["Module 05 — ブラウザとDOM（プレビュー実行を追加予定）", "Module 06 — TypeScript", "Module 07 — React / Next.js"];

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
                ? "全4モジュール完走、おつかれさま。変数からクラス・非同期・並列処理まで、入門書一冊ぶんの JavaScript がここに入った。次の柱はブラウザを動かす DOM 編（画面プレビューつきで追加予定）、その先に TypeScript → React。準備ができたらチャットで「次いこう」と言って。"
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
