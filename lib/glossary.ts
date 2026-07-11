// 用語集データ。レッスンに登場する専門用語を「調べる・確認する」ための単一ソース。
// レッスン本文中のポップアップ表示と /glossary ページの両方がここを参照する。

export type GlossaryCategory =
  | "基本"
  | "文法"
  | "関数"
  | "データ構造"
  | "非同期"
  | "設計"
  | "Web"
  | "Git/GitHub"
  | "開発現場"
  | "AI";

export const glossaryCategories: GlossaryCategory[] = [
  "基本",
  "文法",
  "関数",
  "データ構造",
  "非同期",
  "設計",
  "Web",
  "Git/GitHub",
  "開発現場",
  "AI",
];

export interface GlossaryTerm {
  slug: string;
  term: string;
  reading?: string;
  category: GlossaryCategory;
  oneLiner: string;
  description: string;
  example?: string;
  lessonIds?: string[];
  /** レッスン本文中の照合に使う別表記（term 自体は書かなくてよい） */
  aliases?: string[];
}

export const glossary: GlossaryTerm[] = [
  // ---------- 基本 ----------
  {
    slug: "variable",
    term: "変数",
    reading: "へんすう",
    category: "基本",
    oneLiner: "値に名前をつけて保存しておく入れ物。",
    description:
      "値に名前をつけて保存し、あとから名前で呼び出せる仕組み。JavaScript では const（再代入しない）と let（あとで変える）で宣言する。基本は const を使う。",
    example: `const name = "Sato";
let count = 0;
count = count + 1;`,
    lessonIds: ["vars"],
  },
  {
    slug: "const-let",
    term: "const / let",
    category: "基本",
    oneLiner: "変数宣言のキーワード。const は再代入不可、let は再代入可。",
    description:
      "const で宣言した変数にはあとから別の値を入れられない。let は再代入できる。基本は const、変える必要が出たときだけ let を使う。古い var は今は使わない。",
    example: `const pi = 3.14;   // 再代入するとエラー
let score = 0;     // あとで変えられる
score = 10;`,
    lessonIds: ["vars"],
    aliases: ["const", "let"],
  },
  {
    slug: "data-type",
    term: "型",
    reading: "かた",
    category: "基本",
    oneLiner: "値の種類。文字列・数値・真偽値など。",
    description:
      "値には種類（型）がある。代表は文字列 string、数値 number、真偽値 boolean、「無い」を表す null と undefined。typeof 演算子で値の型を調べられる。",
    example: `console.log(typeof "abc");  // "string"
console.log(typeof 123);    // "number"
console.log(typeof true);   // "boolean"`,
    lessonIds: ["vars"],
    aliases: ["typeof"],
  },
  {
    slug: "string",
    term: "文字列",
    reading: "もじれつ",
    category: "基本",
    oneLiner: "テキストを表す型。\" \" や ' ' 、` ` で囲む。",
    description:
      "テキストデータを表す型（string）。ダブルクォート・シングルクォート・バッククォートのいずれかで囲む。文字列のメソッドは元の値を変えず、新しい文字列を返す。",
    example: `const s = "JavaScript";
console.log(s.toUpperCase());  // "JAVASCRIPT"
console.log(s);                // 元は変わらない`,
    lessonIds: ["vars", "strings"],
  },
  {
    slug: "boolean",
    term: "真偽値",
    reading: "しんぎち",
    category: "基本",
    oneLiner: "true（真）か false（偽）のどちらかを表す型。",
    description:
      "「はい / いいえ」を表す型（boolean）。比較の結果はすべて真偽値になり、if の条件分岐を動かす燃料になる。",
    example: `const isAdult = age >= 20;
if (isAdult) {
  console.log("成人");
}`,
    lessonIds: ["vars", "cond"],
    aliases: ["boolean", "true", "false"],
  },
  {
    slug: "null-undefined",
    term: "null / undefined",
    category: "基本",
    oneLiner: "「値が無い」ことを表す2つの値。",
    description:
      "undefined は「まだ値が入っていない」（未定義）、null は「意図的に空にした」を表す。区別が問題になる場面は少ないが、?? 演算子はこの2つのときだけデフォルト値を使う。",
    example: `let x;              // undefined
const y = null;     // 意図的に空
console.log(x ?? "デフォルト");`,
    lessonIds: ["vars", "optional"],
    aliases: ["null", "undefined"],
  },
  {
    slug: "comment",
    term: "コメント",
    category: "基本",
    oneLiner: "実行されないメモ書き。// から行末まで。",
    description:
      "コードの中に残せるメモ。// から行末までがコメントになり、実行されない。複数行は /* */ で囲む。「なぜそう書いたか」を残すのに使う。",
    example: `// これはコメント。実行されない
const price = 300; // 行の途中からでも書ける`,
    lessonIds: ["hello"],
  },
  {
    slug: "console",
    term: "コンソール",
    category: "基本",
    oneLiner: "実行結果やログを表示する画面。console.log で出力する。",
    description:
      "プログラムの出力先。console.log(値) で値を表示できる。動きを確かめる・デバッグする際の最初の道具。ブラウザでは開発者ツールの Console タブに出る。",
    example: `console.log("こんにちは");
console.log(1 + 2);`,
    lessonIds: ["hello"],
    aliases: ["console.log"],
  },
  {
    slug: "debug",
    term: "デバッグ",
    category: "基本",
    oneLiner: "バグ（不具合）の原因を探して直す作業。",
    description:
      "プログラムが思い通りに動かないとき、原因を特定して直す作業。console.log で途中の値を出力して確かめるのが最も基本的な手法。エラーメッセージを読むことから始める。",
    lessonIds: ["error"],
  },
  // ---------- 文法 ----------
  {
    slug: "template-literal",
    term: "テンプレートリテラル",
    category: "文法",
    oneLiner: "バッククォートで囲み、${ } で変数を埋め込める文字列。",
    description:
      "バッククォート ` で囲む文字列。${ } の中に変数や式を書くと、その値が埋め込まれる。+ でつなぐより読みやすく、現在の主流。改行もそのまま書ける。",
    example: "const user = \"Sato\";\nconsole.log(`ようこそ、${user}さん`);",
    lessonIds: ["ops"],
  },
  {
    slug: "operator",
    term: "演算子",
    reading: "えんざんし",
    category: "文法",
    oneLiner: "計算や比較を行う記号。+ - * / % や === など。",
    description:
      "値を計算・比較・組み合わせる記号。算術（+ - * / %）、比較（=== !== >= <=）、論理（&& || !）などがある。% は割った余りを求める。",
    example: `console.log(10 % 3);   // 1（余り）
console.log(5 >= 3);   // true
console.log(true && false); // false`,
    lessonIds: ["ops"],
  },
  {
    slug: "strict-equality",
    term: "厳密等価 ===",
    category: "文法",
    oneLiner: "値も型も両方比べる比較演算子。== は使わない。",
    description:
      "=== は値と型の両方が同じときだけ true になる。== は型を自動変換して比べるため 1 == \"1\" が true になり事故のもと。常に === / !== を使う。",
    example: `console.log(1 === "1");  // false（型が違う）
console.log(1 == "1");   // true（事故のもと）`,
    lessonIds: ["ops"],
    aliases: ["==="],
  },
  {
    slug: "conditional",
    term: "条件分岐",
    reading: "じょうけんぶんき",
    category: "文法",
    oneLiner: "条件によって処理を変える仕組み。if / else / else if。",
    description:
      "条件が true のときだけ処理を実行する仕組み。3つ以上に分けるときは else if を重ねる。条件は () の中、処理は {} の中に書く。",
    example: `if (score >= 80) {
  console.log("A");
} else if (score >= 60) {
  console.log("B");
} else {
  console.log("C");
}`,
    lessonIds: ["cond"],
    aliases: ["if", "else"],
  },
  {
    slug: "ternary",
    term: "三項演算子",
    reading: "さんこうえんざんし",
    category: "文法",
    oneLiner: "条件 ? A : B の形で書ける短い条件分岐。",
    description:
      "「条件が true なら A、false なら B」を1行で書ける演算子。短い分岐に向く。複雑な分岐を無理に詰め込むと読みにくくなるので、その場合は if を使う。",
    example: `const result = score >= 60 ? "合格" : "不合格";`,
    lessonIds: ["cond"],
  },
  {
    slug: "truthy-falsy",
    term: "truthy / falsy",
    category: "文法",
    oneLiner: "条件式で「真扱い / 偽扱い」される値の区分。",
    description:
      "JavaScript では 0・空文字・null・undefined・NaN は「偽 (falsy)」、それ以外は「真 (truthy)」として扱われる。if (配列.length) のような書き方はこの性質を利用している。",
    example: `if ("") console.log("出ない");   // 空文字は falsy
if ("a") console.log("出る");    // 文字があれば truthy`,
    lessonIds: ["cond"],
    aliases: ["truthy", "falsy"],
  },
  {
    slug: "loop",
    term: "ループ",
    category: "文法",
    oneLiner: "同じ処理をくり返す仕組み。for / while / for...of。",
    description:
      "決まった回数なら for、条件が続く間なら while、配列の全要素を順に扱うなら for...of が読みやすい。「一覧を全部表示する」「合計を出す」処理の基本。",
    example: `for (let i = 1; i <= 3; i++) {
  console.log(i);
}
for (const c of ["赤", "青"]) {
  console.log(c);
}`,
    lessonIds: ["loop"],
    aliases: ["for", "while", "for...of", "くり返し"],
  },
  {
    slug: "destructuring",
    term: "分割代入",
    reading: "ぶんかつだいにゅう",
    category: "文法",
    oneLiner: "オブジェクトや配列から値を取り出して変数にする書き方。",
    description:
      "const { name } = user は user.name を取り出して変数 name に入れる。配列にも使え、const [a, b] = pair のように書く。React などモダンなコードでは常識的に使われる。",
    example: `const user = { name: "Sato", age: 28 };
const { name, age } = user;
console.log(name, age);`,
    lessonIds: ["destr"],
    aliases: ["destructuring"],
  },
  {
    slug: "spread",
    term: "スプレッド構文",
    category: "文法",
    oneLiner: "... で配列やオブジェクトを展開する書き方。",
    description:
      "... は配列やオブジェクトの中身を「展開」する。コピー・結合・一部だけ変えた新しいオブジェクト作りが簡潔に書ける。元のデータを壊さないための定番道具でもある。",
    example: `const updated = { ...user, age: 29 };  // コピーして一部変更
const merged = [...a, ...b];           // 配列の結合`,
    lessonIds: ["destr"],
    aliases: ["スプレッド", "..."],
  },
  {
    slug: "exception",
    term: "例外処理",
    reading: "れいがいしょり",
    category: "文法",
    oneLiner: "失敗が起きてもプログラムを止めない仕組み。try / catch。",
    description:
      "try の中で失敗（例外）が起きても、catch がそれを受け止めて処理を続けられる。catch の引数にはエラー情報が入り、e.message でメッセージを取れる。",
    example: `try {
  riskyOperation();
} catch (e) {
  console.log("エラー:", e.message);
}`,
    lessonIds: ["error"],
    aliases: ["try", "catch", "try / catch"],
  },
  {
    slug: "throw",
    term: "throw",
    category: "文法",
    oneLiner: "自分でエラーを発生させるキーワード。",
    description:
      "throw new Error(\"メッセージ\") で意図的にエラーを起こせる。「ありえない状態」を早めに知らせるために使う。throw されると、最も近い catch まで処理が飛ぶ。",
    example: `if (b === 0) {
  throw new Error("0では割れない");
}`,
    lessonIds: ["error"],
  },
  {
    slug: "optional-chaining",
    term: "オプショナルチェーン ?.",
    category: "文法",
    oneLiner: "途中が undefined でもエラーで落ちない安全なアクセス。",
    description:
      "obj?.a?.b は、途中に無いもの（undefined / null）があってもエラーにならず、そこで止まって undefined を返す。深い場所の値を安全に取りに行ける。",
    example: `console.log(guest.profile?.city);  // 無くても落ちない`,
    lessonIds: ["optional"],
    aliases: ["?."],
  },
  {
    slug: "nullish-coalescing",
    term: "Null合体演算子 ??",
    category: "文法",
    oneLiner: "左が null / undefined のときだけ右を使う演算子。",
    description:
      "値 ?? デフォルト と書くと、左が null か undefined のときだけ右側が使われる。|| と違って 0 や空文字を「有効な値」として通してくれるのがポイント。",
    example: `console.log(count ?? 10);  // count が 0 なら 0 のまま
console.log(name ?? "未設定");`,
    lessonIds: ["optional"],
    aliases: ["??"],
  },
  // ---------- 関数 ----------
  {
    slug: "function",
    term: "関数",
    reading: "かんすう",
    category: "関数",
    oneLiner: "処理に名前をつけてまとめたもの。入力を受け取り結果を返す。",
    description:
      "よく使う処理に名前をつけてまとめる仕組み。入力（引数）を受け取り、return で結果（戻り値）を返す。同じ処理を何度でも呼べて、修正も1か所で済む。",
    example: `const multiply = (a, b) => {
  return a * b;
};
console.log(multiply(4, 5));  // 20`,
    lessonIds: ["func"],
  },
  {
    slug: "argument",
    term: "引数",
    reading: "ひきすう",
    category: "関数",
    oneLiner: "関数に渡す入力の値。",
    description:
      "関数を呼ぶときに渡す値。関数側では受け取った名前で使える。デフォルト値を設定でき、渡さなかったときに使われる（デフォルト引数）。",
    example: `const greet = (name = "ゲスト") => \`こんにちは、\${name}\`;
console.log(greet());        // こんにちは、ゲスト
console.log(greet("Sato"));  // こんにちは、Sato`,
    lessonIds: ["func"],
    aliases: ["デフォルト引数"],
  },
  {
    slug: "return-value",
    term: "戻り値",
    reading: "もどりち",
    category: "関数",
    oneLiner: "関数が return で返す結果の値。",
    description:
      "関数の実行結果として返される値。return に到達すると関数はそこで終了し、値を呼び出し元へ返す。return が無い関数は undefined を返す。",
    example: `const double = (n) => {
  return n * 2;   // ここで終了して値を返す
};
const result = double(5);  // result は 10`,
    lessonIds: ["func", "scope"],
    aliases: ["return"],
  },
  {
    slug: "arrow-function",
    term: "アロー関数",
    category: "関数",
    oneLiner: "= () => {} の形で書く関数。現在の主流。",
    description:
      "const 名前 = (引数) => { 処理 } の形で書く関数。従来の function 宣言より簡潔で、今の主流。処理が1つの式だけなら {} と return を省略して (n) => n * 2 とも書ける。",
    example: `const add = (a, b) => a + b;   // 短縮形
const greet = (name) => {
  return \`こんにちは、\${name}\`;
};`,
    lessonIds: ["func"],
  },
  {
    slug: "scope",
    term: "スコープ",
    category: "関数",
    oneLiner: "変数が使える範囲。{} の中で宣言したらその中だけ。",
    description:
      "変数には「使える範囲」がある。{} の中で宣言した const / let はその中だけで有効で、外からは見えない。おかげで別々の場所で同じ名前を使っても衝突しない。",
    example: `if (true) {
  const inner = "内側";   // ここでしか使えない
}
// console.log(inner); // エラー（範囲外）`,
    lessonIds: ["scope"],
  },
  {
    slug: "higher-order-function",
    term: "高階関数",
    reading: "こうかいかんすう",
    category: "関数",
    oneLiner: "関数を引数に受け取る（または返す）関数。",
    description:
      "関数は「値」として扱えるので、他の関数に渡せる。関数を受け取る／返す関数を高階関数と呼ぶ。配列の map・filter・reduce がその代表。",
    example: `const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2);  // 関数を渡している`,
    lessonIds: ["hof"],
  },
  {
    slug: "callback",
    term: "コールバック関数",
    category: "関数",
    oneLiner: "他の関数に渡して、あとで呼んでもらう関数。",
    description:
      "引数として渡され、適切なタイミングで呼び出される関数。map((n) => n * 2) の (n) => n * 2 や、setTimeout(fn, 1000) の fn がコールバック。",
    example: `setTimeout(() => {
  console.log("1秒後に呼ばれる");
}, 1000);`,
    lessonIds: ["hof", "promise"],
    aliases: ["コールバック"],
  },
  {
    slug: "closure",
    term: "クロージャ",
    category: "関数",
    oneLiner: "関数が、自分が作られた場所の変数を覚えている性質。",
    description:
      "内側の関数が、外側の関数の変数を保持し続ける性質。外からは触れない変数に、返した関数からだけ触れる——「外から勝手に変えられない状態」を作る重要な道具。React の state の根っこもこれ。",
    example: `const createCounter = () => {
  let count = 0;            // 外からは見えない
  return () => ++count;     // この関数だけが触れる
};`,
    lessonIds: ["closure"],
  },
  // ---------- データ構造 ----------
  {
    slug: "array",
    term: "配列",
    reading: "はいれつ",
    category: "データ構造",
    oneLiner: "複数の値を順番に並べて持つ入れ物。[] で作る。",
    description:
      "複数の値を順番に持つデータ構造。先頭は 0 番目から数える。push で追加、pop で末尾削除、length で個数。const で宣言しても要素の追加・変更はできる。",
    example: `const fruits = ["りんご", "みかん"];
fruits.push("ぶどう");
console.log(fruits[0]);       // りんご
console.log(fruits.length);   // 3`,
    lessonIds: ["array"],
  },
  {
    slug: "index",
    term: "インデックス",
    category: "データ構造",
    oneLiner: "配列の位置番号。0 から数える。",
    description:
      "配列の要素の位置を表す番号。先頭が 0 なので、list[0] が最初、list[list.length - 1] が最後の要素になる。「2番目」が [1] になる点に慣れが必要。",
    example: `const items = ["a", "b", "c"];
console.log(items[1]);  // "b"（2番目）`,
    lessonIds: ["array"],
  },
  {
    slug: "object",
    term: "オブジェクト",
    category: "データ構造",
    oneLiner: "「キー: 値」の組で関連データをまとめる入れ物。{} で作る。",
    description:
      "関連する値を「キー: 値」の組でまとめるデータ構造。値の取り出しは obj.key。値には文字列・数値・配列・別のオブジェクトなど何でも入る。実際のデータは「オブジェクトの配列」でよく表される。",
    example: `const user = { name: "Sato", age: 28 };
console.log(user.name);
user.age = 29;   // 変更もできる`,
    lessonIds: ["object"],
  },
  {
    slug: "property",
    term: "プロパティ",
    category: "データ構造",
    oneLiner: "オブジェクトが持つ「キー: 値」の1組。",
    description:
      "オブジェクトの中の個々の「キー: 値」。user.name の name がプロパティ名。ドット記法（user.name）またはブラケット記法（user[\"name\"]）でアクセスする。",
    example: `const book = { title: "JS入門", price: 500 };
console.log(book.title);      // ドット記法
console.log(book["price"]);   // ブラケット記法`,
    lessonIds: ["object"],
  },
  {
    slug: "method",
    term: "メソッド",
    category: "データ構造",
    oneLiner: "値にくっついた関数。値.メソッド名() で呼ぶ。",
    description:
      "値（文字列・配列・オブジェクトなど）に属する関数。\"abc\".toUpperCase() や nums.push(4) のように 値.メソッド名() の形で呼ぶ。文字列のメソッドは元の値を変えず新しい値を返す。",
    example: `const s = "hello";
console.log(s.toUpperCase());  // "HELLO"
const nums = [1, 2];
nums.push(3);                  // 配列のメソッド`,
    lessonIds: ["strings"],
  },
  {
    slug: "map-filter-reduce",
    term: "map / filter / reduce",
    category: "データ構造",
    oneLiner: "配列の三大変換メソッド。変換・絞り込み・集約。",
    description:
      "map は全要素を変換（数はそのまま）、filter は条件に合う要素だけ残す、reduce は合計などの1つの値にまとめる。ループを書くより短く明確で、実務で最も多用する道具の一つ。",
    example: `const nums = [1, 2, 3, 4];
nums.map((n) => n * 2);           // [2,4,6,8]
nums.filter((n) => n % 2 === 0);  // [2,4]
nums.reduce((sum, n) => sum + n, 0); // 10`,
    lessonIds: ["hof"],
    aliases: ["map", "filter", "reduce"],
  },
  {
    slug: "sort",
    term: "sort",
    category: "データ構造",
    oneLiner: "配列の並べ替え。数値には比較関数が必須。",
    description:
      "配列を並べ替えるメソッド。数値は比較関数 (a, b) => a - b（昇順）が必須で、書かないと文字として並ぶ罠がある。元の配列を書き換える（破壊的）ので、守りたいときは [...arr].sort(...) とコピーしてから。",
    example: `const nums = [40, 5, 100];
const sorted = [...nums].sort((a, b) => a - b);  // [5, 40, 100]`,
    lessonIds: ["arr2"],
  },
  {
    slug: "find-some-every",
    term: "find / some / every",
    category: "データ構造",
    oneLiner: "配列を「探す」メソッド3兄弟。",
    description:
      "find は条件に合う最初の1件を返す（無ければ undefined）。some は1つでも合えば true、every は全部合えば true。「探す・確かめる」処理の定番。",
    example: `const users = [{ age: 24 }, { age: 31 }];
users.find((u) => u.age >= 30);   // { age: 31 }
users.some((u) => u.age < 25);    // true
users.every((u) => u.age >= 20);  // true`,
    lessonIds: ["arr2"],
    aliases: ["find", "some", "every"],
  },
  {
    slug: "set",
    term: "Set",
    category: "データ構造",
    oneLiner: "重複しない値の集まり。重複除去の定番。",
    description:
      "同じ値は1つしか入らない入れ物。[...new Set(配列)] が重複除去のイディオムとして頻出する。has で存在チェックもできる。",
    example: `const tags = ["js", "web", "js"];
const unique = [...new Set(tags)];  // ["js", "web"]`,
    lessonIds: ["mapset"],
  },
  {
    slug: "map-collection",
    term: "Map（コレクション）",
    category: "データ構造",
    oneLiner: "キーと値のペアを持つ入れ物。set / get / has / size で操作。",
    description:
      "「キーと値のペア」を保持するデータ構造。オブジェクトに似ているが、追加・削除が頻繁な場面や個数（size）を扱う場面で便利。配列の map メソッドとは別物なので注意。",
    example: `const stock = new Map();
stock.set("apple", 3);
console.log(stock.get("apple"));  // 3
console.log(stock.size);          // 1`,
    lessonIds: ["mapset"],
    aliases: ["new Map"],
  },
  {
    slug: "json",
    term: "JSON",
    category: "データ構造",
    oneLiner: "データを文字列にして運ぶ・保存する世界共通フォーマット。",
    description:
      "API通信もブラウザへの保存も、中身はほぼ全部 JSON 文字列。JSON.stringify(値) で文字列化、JSON.parse(文字列) で復元する。この往復がすべての基本。",
    example: `const text = JSON.stringify({ name: "Aoi" });
const back = JSON.parse(text);
console.log(back.name);  // Aoi`,
    lessonIds: ["json"],
    aliases: ["JSON.stringify", "JSON.parse"],
  },
  // ---------- 非同期 ----------
  {
    slug: "async",
    term: "非同期処理",
    reading: "ひどうきしょり",
    category: "非同期",
    oneLiner: "時間のかかる処理を「待たずに先へ進む」仕組み。",
    description:
      "サーバー通信のような時間のかかる処理を「後回しにして先に進み、終わったら結果を受け取る」仕組み。何もしないと全部が止まってしまうのを防ぐ。今の主流の書き方は async / await。",
    example: `const users = await fetchUsers();  // 終わるまで待ってから次へ
console.log(users.length);`,
    lessonIds: ["async"],
    aliases: ["非同期"],
  },
  {
    slug: "async-await",
    term: "async / await",
    category: "非同期",
    oneLiner: "非同期処理を上から順に読める形で書くための構文。",
    description:
      "await をつけると「その処理が終わるまで待ってから」次の行へ進む。await の正体は「Promise の結果が届くまで待つ」。つけ忘れると、まだ取れていない途中の値が返ってしまう。",
    example: `const users = await fetchUsers();
console.log(users[0].name);`,
    lessonIds: ["async", "promise"],
    aliases: ["await", "async"],
  },
  {
    slug: "promise",
    term: "Promise",
    category: "非同期",
    oneLiner: "「あとで値が届く」という約束のオブジェクト。",
    description:
      "async / await の下で動いている本体。new Promise((resolve) => ...) で自作もできる。定番は「指定ミリ秒待つ」wait 関数で、時間差のある処理の基本部品になる。",
    example: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await wait(300);  // 0.3秒待つ`,
    lessonIds: ["promise"],
  },
  {
    slug: "promise-all",
    term: "Promise.all",
    category: "非同期",
    oneLiner: "複数の非同期処理を並列で走らせて、全部待つ。",
    description:
      "配列で渡した Promise を全部同時に開始し、全部届いたら結果の配列が返る。互いに関係のない取得は直列（await を縦に並べる）より並列のほうが速い。1つでも失敗すると全体が失敗扱いになる。",
    example: `const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);`,
    lessonIds: ["parallel"],
  },
  {
    slug: "settimeout",
    term: "setTimeout",
    category: "非同期",
    oneLiner: "指定ミリ秒後に関数を実行する時限装置。",
    description:
      "setTimeout(実行する関数, ミリ秒) で、指定時間後にコールバックを呼ぶ。Promise と組み合わせた wait 関数の材料としても定番。",
    example: `setTimeout(() => {
  console.log("1秒たった");
}, 1000);`,
    lessonIds: ["promise"],
  },
  // ---------- 設計 ----------
  {
    slug: "class",
    term: "クラス",
    category: "設計",
    oneLiner: "同じ形のオブジェクトを量産するための設計図。",
    description:
      "class で設計図を書き、new で実体（インスタンス）を量産する。「ユーザー」「商品」のような概念のまとまりを表すときに読みやすい。constructor が初期化、this が自分自身。",
    example: `class User {
  constructor(name) {
    this.name = name;
  }
}
const aoi = new User("Aoi");`,
    lessonIds: ["class"],
  },
  {
    slug: "constructor",
    term: "constructor",
    category: "設計",
    oneLiner: "new されたときに走る初期化処理。",
    description:
      "クラスから new でインスタンスを作るとき最初に呼ばれる特別なメソッド。受け取った引数を this.プロパティ に入れて、初期状態を作る。",
    example: `class Product {
  constructor(title, price) {
    this.title = title;
    this.price = price;
  }
}`,
    lessonIds: ["class"],
  },
  {
    slug: "this",
    term: "this",
    category: "設計",
    oneLiner: "「いま作られている（呼ばれている）自分自身」を指すキーワード。",
    description:
      "クラスのメソッド内では、this はそのインスタンス自身を指す。this.name = 自分自身の name。文脈によって指すものが変わる JS の難所の一つだが、クラス内では素直に「自分」と読めばよい。",
    example: `class User {
  introduce() {
    return \`\${this.name}です\`;  // 自分の name
  }
}`,
    lessonIds: ["class"],
  },
  {
    slug: "instance",
    term: "インスタンス",
    category: "設計",
    oneLiner: "クラス（設計図）から new で作られた実体。",
    description:
      "new クラス名(引数) で生まれる個々のオブジェクト。同じクラスから作っても、それぞれが独立した状態を持つ。",
    example: `const aoi = new User("Aoi", 24);  // インスタンス1
const ken = new User("Ken", 31);  // インスタンス2（別物）`,
    lessonIds: ["class"],
  },
  // ---------- Web ----------
  {
    slug: "api",
    term: "API",
    category: "Web",
    oneLiner: "プログラム同士が機能やデータをやり取りする窓口。",
    description:
      "Application Programming Interface。「サーバーからユーザー一覧を取る」「投稿を保存する」のような機能を、決まった形式で呼び出せる窓口。Web では JSON でデータをやり取りするのが主流。codelog の fetchUsers / fetchPosts は API 通信を模した擬似 API。",
    example: `// 実際の API 通信もほぼ同じ形
const res = await fetch("https://api.example.com/users");
const users = await res.json();`,
    lessonIds: ["async", "parallel"],
    aliases: ["擬似API"],
  },
  {
    slug: "localstorage",
    term: "localStorage",
    category: "Web",
    oneLiner: "ブラウザにデータを保存しておける小さな倉庫。",
    description:
      "キーと値（文字列）のペアをブラウザに永続保存できる仕組み。タブを閉じても残る。オブジェクトを保存するときは JSON.stringify で文字列にしてから入れ、取り出したら JSON.parse で戻す。codelog の進捗保存もこれ。",
    example: `localStorage.setItem("key", JSON.stringify(data));
const back = JSON.parse(localStorage.getItem("key"));`,
    lessonIds: ["json"],
  },
  {
    slug: "web-worker",
    term: "Web Worker",
    category: "Web",
    oneLiner: "ページとは別スレッドで JS を動かす仕組み。",
    description:
      "重い処理や信用できないコードをページ本体と切り離して実行できる。無限ループが起きても UI は固まらず、terminate() で強制停止できる。codelog の実行エンジンはこれで動いている。",
    example: `const worker = new Worker("/worker/runner.js");
worker.postMessage({ code });
worker.terminate();  // 強制停止`,
    lessonIds: [],
  },
  {
    slug: "dom",
    term: "DOM",
    category: "Web",
    oneLiner: "HTML をプログラムから操作するための仕組み。",
    description:
      "Document Object Model。ページの HTML 構造を JS から読み書きするための仕組みで、「ボタンが押されたら文字を変える」といった動きはこれで作る。codelog では Module 05（追加予定）で扱う。",
    example: `const el = document.querySelector("#title");
el.textContent = "書き換えた";`,
    lessonIds: [],
  },
  // ---------- Git/GitHub ----------
  {
    slug: "git",
    term: "Git",
    category: "Git/GitHub",
    oneLiner: "コードの変更履歴を記録・管理するバージョン管理システム。",
    description:
      "「いつ・誰が・何を変えたか」を全部記録してくれる道具。過去の状態にいつでも戻れるので、安心してコードを変更できる。ほぼすべての開発現場で使われている。コマンドは git ◯◯ の形で打つ。",
    example: `git status   # いま何が変わっているか見る
git log      # 変更履歴を見る`,
  },
  {
    slug: "github",
    term: "GitHub",
    category: "Git/GitHub",
    oneLiner: "Git のリポジトリをインターネット上に置ける共有サービス。",
    description:
      "自分のコードの置き場所（バックアップ）であり、公開ポートフォリオであり、複数人開発の共同作業場。codelog のコードも GitHub に置いてあり、push すると Vercel が自動で本番サイトを更新する。",
  },
  {
    slug: "repository",
    term: "リポジトリ",
    category: "Git/GitHub",
    oneLiner: "プロジェクト1つぶんのコードと変更履歴をまとめた入れ物。",
    description:
      "Git が管理する単位。プロジェクトのフォルダ+全変更履歴のセットで、「リポジトリを作る = このフォルダを Git で管理し始める」ということ。手元にあるものをローカルリポジトリ、GitHub 上のものをリモートリポジトリと呼ぶ。",
    example: `git init    # このフォルダをリポジトリにする`,
    aliases: ["repo", "リモートリポジトリ"],
  },
  {
    slug: "commit",
    term: "コミット",
    category: "Git/GitHub",
    oneLiner: "変更を「ここまでやった」として履歴に記録するセーブポイント。",
    description:
      "変更のスナップショットを1つの記録として残す操作。ゲームのセーブと同じで、こまめに刻むほど戻りやすい。git add で記録したい変更を選び（ステージング）、git commit -m \"メッセージ\" で記録する。メッセージには「何をしたか」を書く。",
    example: `git add .                      # 変更を選ぶ
git commit -m "配列レッスンを追加"  # 記録する`,
    aliases: ["commit", "git commit"],
  },
  {
    slug: "git-push",
    term: "git push",
    category: "Git/GitHub",
    oneLiner: "手元のコミットを GitHub（リモート）へ送り上げる。",
    description:
      "ローカルリポジトリに積んだコミットを、GitHub 側へアップロードする操作。これで初めて他の人（や Vercel などのサービス）から見えるようになる。codelog では push すると本番サイトが自動で更新される。配列の push メソッドとは別物なので注意。",
    example: `git push             # リモートへ送る
# → Vercel が検知して自動デプロイ`,
  },
  {
    slug: "git-pull",
    term: "git pull",
    category: "Git/GitHub",
    oneLiner: "GitHub（リモート）の最新の変更を手元に取り込む。",
    description:
      "push の逆方向。リモートリポジトリに増えた新しいコミットをダウンロードして、手元のコードに反映する。複数人開発や、複数のPCで作業するときの「同期」の基本。",
    example: `git pull   # リモートの最新を取り込む`,
  },
  {
    slug: "branch",
    term: "ブランチ",
    category: "Git/GitHub",
    oneLiner: "履歴の枝分かれ。本流を壊さずに変更を試せる作業ライン。",
    description:
      "履歴を枝分かれさせて、本流（main ブランチ）に影響を与えずに新機能や実験を進められる仕組み。できあがったらマージで本流に合流させる。「main は常に動く状態を保ち、作業はブランチで」が定石。",
    example: `git switch -c feature/glossary  # ブランチを作って移動
git switch main                 # main に戻る`,
    aliases: ["branch", "main"],
  },
  {
    slug: "merge",
    term: "マージ",
    category: "Git/GitHub",
    oneLiner: "枝分かれしたブランチの変更を1つに合流させる。",
    description:
      "ブランチで進めた変更を別のブランチ（多くは main）に取り込む操作。同じ場所を別々に変更しているとコンフリクトが起きるので、その場合はどちらを採用するか人間が決めて解消する。",
    example: `git switch main
git merge feature/glossary  # 作業ブランチを main に合流`,
    aliases: ["merge"],
  },
  {
    slug: "pull-request",
    term: "プルリクエスト",
    category: "Git/GitHub",
    oneLiner: "「この変更を取り込んで」という提案+レビューの場。PR と略す。",
    description:
      "GitHub 上で、ブランチの変更を main に取り込む前に「こういう変更をしました、確認してください」と提案する仕組み。差分を見ながらコメントし合い、OK ならマージする。チーム開発の中心的な作法で、git pull コマンドとは別物。",
    example: `# GitHub 上の操作（コマンドではない）
# ブランチを push → Compare & pull request → レビュー → Merge`,
    aliases: ["Pull Request", "プルリク"],
  },
  {
    slug: "clone",
    term: "クローン",
    category: "Git/GitHub",
    oneLiner: "GitHub 上のリポジトリを丸ごと手元に複製する。",
    description:
      "リモートリポジトリを履歴ごとダウンロードして、手元で作業できるようにする操作。他の人の公開リポジトリを手元で動かしたいときや、新しい PC で自分のプロジェクトを再開するときの入口。",
    example: `git clone https://github.com/ry071702-prog/codelog.git`,
    aliases: ["clone", "git clone"],
  },
  {
    slug: "fork",
    term: "フォーク",
    category: "Git/GitHub",
    oneLiner: "他人のリポジトリを自分のアカウントに複製する（GitHub の機能）。",
    description:
      "他人のプロジェクトに直接 push はできないので、まず自分のアカウント側にコピー（フォーク）を作り、そこで変更してからプルリクエストで本家に提案する。オープンソースに貢献するときの標準の流れ。",
    aliases: ["fork"],
  },
  {
    slug: "conflict",
    term: "コンフリクト",
    category: "Git/GitHub",
    oneLiner: "同じ場所への変更がぶつかって、自動で合流できない状態。",
    description:
      "マージや pull のとき、同じファイルの同じ行を別々に変更していると Git は「どちらが正しいか」を決められない。ファイルに <<<<<<< と >>>>>>> の印がつくので、残したい内容に手で直して、改めてコミットすれば解消する。慌てなくてよい。",
    example: `<<<<<<< HEAD
自分の変更
=======
相手の変更
>>>>>>> feature/xxx`,
    aliases: ["conflict", "競合"],
  },
  {
    slug: "deploy",
    term: "デプロイ",
    category: "Git/GitHub",
    oneLiner: "作ったものを本番環境に公開・反映すること。",
    description:
      "手元で動くコードを、インターネット上の誰でもアクセスできる場所に配置する作業。codelog では GitHub に push するだけで Vercel が自動でビルドしてデプロイする（CD = 継続的デプロイ）。",
    example: `git push   # → Vercel が自動ビルド → 本番URLが更新される`,
    aliases: ["deploy"],
  },
  // ---------- 開発現場 ----------
  {
    slug: "terminal",
    term: "ターミナル",
    category: "開発現場",
    oneLiner: "コマンドを文字で打ち込んでコンピュータを操作する画面。通称「黒い画面」。",
    description:
      "マウスの代わりに文字の命令（コマンド）でコンピュータを操作する画面。中で動いている解釈係をシェルと呼ぶ。開発では npm run dev や git push など、ほとんどの操作をここから行う。",
    example: `cd codelog     # フォルダを移動
npm run dev    # 開発サーバーを起動`,
    aliases: ["シェル", "コマンドライン", "黒い画面"],
  },
  {
    slug: "command-cli",
    term: "コマンド / CLI",
    category: "開発現場",
    oneLiner: "ターミナルに打ち込む文字の命令。CLI はコマンドで操作する道具のこと。",
    description:
      "CLI（Command Line Interface）は、画面のボタンではなく文字の命令で使う道具の総称。git も npm も vercel も CLI。「コマンドを叩く」=「命令を打って実行する」の意味で使われる。",
    example: `npm install    # ← これが「コマンド」
git status`,
    aliases: ["CLI"],
  },
  {
    slug: "directory",
    term: "ディレクトリとパス",
    category: "開発現場",
    oneLiner: "ディレクトリ=フォルダ。パス=その場所を表す住所文字列。",
    description:
      "エンジニアはフォルダをディレクトリと呼ぶ。パスは「どこにあるか」を表す文字列で、/ 区切りで書く。先頭が / なら絶対パス（ルートから）、そうでなければ相対パス（今いる場所から）。lib/lessons.ts のような表記もパス。",
    example: `~/codelog/lib/lessons.ts   # ~ はホームディレクトリ
./components/Sidebar.tsx   # . は「今いる場所」`,
    aliases: ["ディレクトリ", "パス", "フォルダ"],
  },
  {
    slug: "environment-setup",
    term: "環境構築",
    category: "開発現場",
    oneLiner: "開発を始められる状態に PC を整えること。",
    description:
      "Node.js を入れる、npm install で依存を揃える、など「コードを書いて動かせる状態」を作る作業。初心者最初の壁と言われるが、codelog のようなブラウザ実行のサイトなら環境構築ゼロで学べる。",
    example: `node -v        # Node.js が入っているか確認
npm install    # プロジェクトの依存を揃える`,
  },
  {
    slug: "package",
    term: "パッケージと依存関係",
    category: "開発現場",
    oneLiner: "パッケージ=他人が作った再利用できるコード。依存=それを使っている関係。",
    description:
      "世界中の開発者が公開しているコード部品（パッケージ）を組み合わせて開発するのが現代の標準。自分のプロジェクトが使っているパッケージを依存関係（dependencies）と呼び、package.json に一覧が書かれる。",
    example: `npm install lucide-react   # パッケージを追加
# → package.json の dependencies に記録される`,
    aliases: ["パッケージ", "依存関係", "dependencies"],
  },
  {
    slug: "npm",
    term: "npm",
    category: "開発現場",
    oneLiner: "JavaScript のパッケージを入れる・管理する道具。",
    description:
      "Node Package Manager。npm install でパッケージを取ってきて node_modules フォルダに置き、npm run ◯◯ で package.json に書いたスクリプトを実行する。似た道具に pnpm / yarn があるが、まずは npm だけでよい。",
    example: `npm install        # 依存を全部入れる
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド`,
    aliases: ["node_modules", "package.json"],
  },
  {
    slug: "library-framework",
    term: "ライブラリとフレームワーク",
    category: "開発現場",
    oneLiner: "ライブラリ=呼んで使う部品。フレームワーク=その上に乗って作る土台。",
    description:
      "ライブラリは自分のコードから呼び出す道具（例: アイコン集の lucide-react）。フレームワークは全体の構造を決める土台で、自分のコードがその流儀に乗る（例: React の上に立つ Next.js）。「主導権がどちらにあるか」が違い。",
    aliases: ["ライブラリ", "フレームワーク"],
  },
  {
    slug: "build",
    term: "ビルド",
    category: "開発現場",
    oneLiner: "書いたコードを、配信できる形に変換・最適化する工程。",
    description:
      "TypeScript や JSX のような「開発用の書き方」を、ブラウザが解釈できる JS/HTML/CSS に変換し、小さく最適化する工程。npm run build で実行され、ビルドが失敗する=どこかにエラーがある、なので公開前の健康診断でもある。",
    example: `npm run build
# ✓ Compiled successfully ← これが通れば公開できる`,
    aliases: ["build", "コンパイル"],
  },
  {
    slug: "local-production",
    term: "ローカルと本番",
    category: "開発現場",
    oneLiner: "ローカル=自分のPCの中だけ。本番=公開されて誰でも見られる環境。",
    description:
      "開発は「ローカル環境（localhost）で動かして確認 → 良ければ本番環境（production）へデプロイ」の往復。http://localhost:3000 の localhost は「自分のPC自身」、3000 はポート番号（同じPC内の窓口の番号）。ローカルは何を壊しても誰にも迷惑がかからない練習場。",
    example: `npm run dev
# → http://localhost:3000 （自分だけが見える）
git push
# → https://codelog-three.vercel.app （全世界に公開）`,
    aliases: ["localhost", "ローカル環境", "本番環境", "ポート番号"],
  },
  {
    slug: "server",
    term: "サーバー",
    category: "開発現場",
    oneLiner: "リクエストを受けてデータやページを返す側のコンピュータ／プログラム。",
    description:
      "「ください（リクエスト）」を受けて「どうぞ（レスポンス）」を返す役。Webサイトを配信するのも、API でデータを返すのもサーバー。npm run dev で手元に立ち上がるのは開発用サーバー。",
    aliases: ["リクエスト", "レスポンス"],
  },
  {
    slug: "frontend-backend",
    term: "フロントエンドとバックエンド",
    category: "開発現場",
    oneLiner: "フロント=ユーザーが見て触る側。バック=裏でデータや処理を担う側。",
    description:
      "フロントエンドはブラウザで動く画面側（HTML/CSS/JS、React など）、バックエンドはサーバー側の処理（API、データベース、認証など）。codelog は今フロントエンドだけで動いており、Phase 1 の AI チューターでバックエンド（API Route）が登場する予定。",
    aliases: ["フロントエンド", "バックエンド"],
  },
  {
    slug: "database",
    term: "データベース",
    category: "開発現場",
    oneLiner: "データを永続的に保存・検索するための専用の仕組み。DB と略す。",
    description:
      "アプリのデータ（ユーザー、投稿、進捗など）を安全に保存して高速に探せる倉庫。localStorage が「個人のブラウザ内のメモ」なのに対し、DB はサーバー側にあり全ユーザーで共有できる。代表は PostgreSQL、MySQL、SQLite など。",
    aliases: ["DB"],
  },
  {
    slug: "env-var",
    term: "環境変数",
    category: "開発現場",
    oneLiner: "コードの外に置く設定値。APIキーなどの秘密はここに入れる。",
    description:
      "実行環境ごとに変えたい値や、コードに直書きしてはいけない秘密（APIキー等）を置く場所。ローカルでは .env ファイルに書き、.gitignore で Git 管理から外す（=GitHub に上げない）。本番では Vercel の設定画面から登録する。",
    example: `# .env（GitHub には絶対上げない）
ANTHROPIC_API_KEY=sk-ant-...`,
    aliases: [".env", "APIキー", "シークレット"],
  },
  {
    slug: "log",
    term: "ログ",
    category: "開発現場",
    oneLiner: "プログラムが動いた記録。調査の第一の手がかり。",
    description:
      "「いつ何が起きたか」をプログラムが書き残したもの。console.log の出力も、サーバーのアクセス記録も、ビルドの経過もぜんぶログ。何かおかしいときは「まずログを見る」がエンジニアの初動。codelog という名前もここから。",
    aliases: ["log"],
  },
  {
    slug: "bug-issue",
    term: "バグとイシュー",
    category: "開発現場",
    oneLiner: "バグ=プログラムの不具合。イシュー=直したいこと・課題の管理単位。",
    description:
      "思い通りに動かない原因となる欠陥がバグ（虫）。GitHub にはイシュー（Issue）という「バグ報告・要望・タスクを1件ずつ管理する掲示板」があり、「イシューを立てる」=課題を登録すること。",
    aliases: ["バグ", "イシュー", "issue"],
  },
  {
    slug: "test",
    term: "テスト",
    category: "開発現場",
    oneLiner: "コードが正しく動くことを自動で確かめる仕組み・コード。",
    description:
      "「この関数にこれを入れたらこれが返るはず」を検証するコードを書いておき、変更のたびに自動実行して壊れていないか確かめる。codelog のレッスンのクリア判定（check 関数）も小さなテストの一種。",
    example: `// テストのイメージ
expect(multiply(4, 5)).toBe(20);`,
    aliases: ["ユニットテスト"],
  },
  {
    slug: "refactoring",
    term: "リファクタリング",
    category: "開発現場",
    oneLiner: "動きは変えずに、コードの中身を読みやすく整理し直すこと。",
    description:
      "機能追加ではなく「同じ動きのまま綺麗にする」作業。変数名を分かりやすくする、重複をまとめる、長い関数を分割するなど。動きが変わらないことを保証するためにテストとセットで行うのが定石。",
  },
  {
    slug: "code-review",
    term: "コードレビュー",
    category: "開発現場",
    oneLiner: "他の人が書いたコードを読んで、問題や改善点を指摘し合うこと。",
    description:
      "主にプルリクエスト上で行われる。バグの早期発見だけでなく、知識共有や書き方を揃える目的もある。指摘は人格でなくコードへのコメント、が大事な文化。LGTM（Looks Good To Me）=「良いと思います、承認」の定番略語。",
    aliases: ["レビュー", "LGTM"],
  },
  {
    slug: "linter",
    term: "lint / リンター",
    category: "開発現場",
    oneLiner: "コードの怪しい書き方やスタイル違反を自動検出する道具。",
    description:
      "実行しなくても分かる問題（使っていない変数、危険な書き方、スタイル不統一）を機械的に指摘してくれる。JS/TS では ESLint が定番。「lint を通す」=指摘ゼロにすること。フォーマット（見た目の整形）は Prettier が担うことが多い。",
    example: `npm run lint   # コードの静的チェック`,
    aliases: ["ESLint", "リンター"],
  },
  {
    slug: "ci-cd",
    term: "CI/CD",
    category: "開発現場",
    oneLiner: "push のたびにテスト・ビルド・デプロイを自動で回す仕組み。",
    description:
      "CI（継続的インテグレーション）は push のたびに自動でテストやビルドを走らせて壊れていないか確認すること、CD（継続的デリバリー/デプロイ）は合格したら自動で本番反映まですること。codelog の「push すると Vercel が自動デプロイ」はまさに CD。GitHub Actions が代表的な CI サービス。",
    aliases: ["CI", "CD", "GitHub Actions"],
  },
  {
    slug: "markdown",
    term: "Markdown",
    category: "開発現場",
    oneLiner: "# や - などの記号で文書を書く軽量フォーマット。README の標準。",
    description:
      "# 見出し、- 箇条書き、**太字**、```コードブロック``` のような記号で構造を表す書き方。GitHub の README・イシュー・PR、そして AI とのチャットの多くがこれで書かれている。ファイルの拡張子は .md。",
    example: `# 見出し
- 箇条書き
**太字** と \`コード\``,
    aliases: ["README"],
  },
  {
    slug: "regex",
    term: "正規表現",
    category: "開発現場",
    oneLiner: "文字列のパターンを表す記法。検索・検証の強力な道具。",
    description:
      "「console.log という文字を含む」「数字が3桁続く」のようなパターンを /.../ の記法で表す。JS では /pattern/.test(文字列) でマッチ判定できる。codelog のクリア判定も正規表現を使っている。読めると強いが、最初は「そういう記法がある」と知っていれば十分。",
    example: `/console\\.log/.test(code)   // code に console.log を含む？
/^[0-9]+$/.test("123")      // 全部数字？ → true`,
    aliases: ["regex"],
  },
  // ---------- AI ----------
  {
    slug: "llm",
    term: "LLM（大規模言語モデル）",
    category: "AI",
    oneLiner: "大量の文章で訓練された、文章を理解・生成する AI。生成AI の中核。",
    description:
      "ChatGPT や Claude、Gemini の中身。次に来る言葉を予測する仕組みを極限まで大きくしたもので、会話・要約・翻訳・コード生成までこなす。「モデル」は訓練済みの AI 本体のことで、モデルごとに性能や得意分野が違う。",
    aliases: ["生成AI", "大規模言語モデル", "モデル"],
  },
  {
    slug: "prompt",
    term: "プロンプト",
    category: "AI",
    oneLiner: "AI への指示・入力文。書き方しだいで出力の質が大きく変わる。",
    description:
      "AI に渡す指示のこと。目的・条件・例を具体的に書くほど狙った出力に近づく（プロンプトを設計する技術をプロンプトエンジニアリングと呼ぶ）。「システムプロンプト」は会話全体の前提として最初に仕込まれる指示のこと。",
    aliases: ["システムプロンプト", "プロンプトエンジニアリング"],
  },
  {
    slug: "token",
    term: "トークン",
    category: "AI",
    oneLiner: "AI が文章を処理する最小単位。料金や上限の数え方でもある。",
    description:
      "LLM は文章をトークンという細切れ（日本語なら1〜2文字、英語なら単語の断片程度）に分けて処理する。API の料金は入出力のトークン数で決まり、「トークンを消費する」=それだけ処理・課金されるという意味。※Web開発で出てくる認証トークン（ログイン証明の文字列）は別物。",
    aliases: ["token"],
  },
  {
    slug: "context",
    term: "コンテキスト",
    category: "AI",
    oneLiner: "AI が「いま覚えている」会話や資料の範囲。上限がある。",
    description:
      "LLM が一度に参照できる情報の範囲（コンテキストウィンドウ）。会話が長くなると古い内容が入り切らなくなり、AI が前の話を忘れたように見えるのはこのため。開発AIに「このファイルを読んで」と渡すのは、コンテキストに情報を入れる行為。",
    aliases: ["コンテキストウィンドウ", "context"],
  },
  {
    slug: "hallucination",
    term: "ハルシネーション",
    category: "AI",
    oneLiner: "AI がもっともらしい嘘を自信満々に出力すること。",
    description:
      "存在しない関数、実在しない URL、間違った事実を「それっぽく」生成してしまう現象。AI の出力は必ず動かして・調べて検証するのが基本姿勢。コードなら実行とテスト、事実なら一次情報の確認で防ぐ。",
  },
  {
    slug: "ai-agent",
    term: "AIエージェント",
    category: "AI",
    oneLiner: "指示を受けて、自分で手順を考えツールを使いながらタスクを進める AI。",
    description:
      "1回の質問応答で終わらず、「ファイルを読む→コードを書く→実行して確かめる→直す」のような複数ステップを自律的に回す AI のこと。Claude Code や Codex のようなコーディングエージェントは、ターミナルやエディタを操作しながら開発を進める。",
    aliases: ["エージェント", "コーディングエージェント", "Claude Code"],
  },
  {
    slug: "mcp",
    term: "MCP",
    category: "AI",
    oneLiner: "AI に外部ツールやデータへの接続口を生やすための共通規格。",
    description:
      "Model Context Protocol。「AI からブラウザを操作する」「AI からカレンダーを読む」のような外部連携を、共通の作法でつなげる仕組み。対応ツールを MCP サーバーとして登録すると、AI がそれを道具として使えるようになる。",
  },
  {
    slug: "rate-limit",
    term: "レート制限",
    category: "AI",
    oneLiner: "一定時間に使える回数・量の上限。API 全般にある。",
    description:
      "「1分間に◯回まで」「1日◯トークンまで」のような利用上限。AI API に限らず Web API 全般にあり、超えると 429 エラー（Too Many Requests）が返る。アプリ側では回数を数えて制限したり、時間を置いて再試行（リトライ）したりして付き合う。",
    aliases: ["rate limit", "429"],
  },
];

export function getTerm(slug: string): GlossaryTerm | undefined {
  return glossary.find((t) => t.slug === slug);
}
