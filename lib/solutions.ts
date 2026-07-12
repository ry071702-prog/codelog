// レッスンの模範解答。
//
// 2つの役割がある:
//   1. テスト — 「解答を実行すると check がクリアを返す」ことを機械的に検証する土台
//      （レッスンや実行エンジンを直したときの回帰検知）
//   2. 学習者への解答例 — どうしても進めないときだけ開ける「解答例を見る」
//
// スターターのままでクリアになるレッスン（コードを読むのが主目的の回）は載せない。

export const solutions: Record<string, string> = {
  hello: `console.log("1行目");
console.log("2行目");
console.log("3行目、自分で書いた!");`,

  // ── MODULE 03 / 04 — 章末演習
  ex1: `const students = [
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

// 3) 全員の平均点
const avg = students.reduce((sum, s) => sum + s.score, 0) / students.length;
console.log(\`平均: \${avg.toFixed(1)}点\`);`,

  ex2: `const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);

console.log(\`\${users.length}人のユーザー、\${posts.length}件の投稿\`);

users.forEach((u) => {
  const count = posts.filter((p) => p.author === u.name).length;
  console.log(\`\${u.name}: \${count}件\`);
});`,

  // ── MODULE 05 — ブラウザとDOM
  "dom-intro": `const msg = document.querySelector("#msg");

msg.textContent = "やった、画面が動いた!";`,

  "dom-select": `const items = document.querySelectorAll(".item");

console.log(items.length);
console.log(items[0].textContent);`,

  "dom-text": `const box = document.querySelector("#box");

box.textContent = "codelog で学習中";`,

  "dom-style": `const card = document.querySelector("#card");

card.classList.add("highlight");`,

  "dom-create": `const list = document.querySelector("#list");

const li = document.createElement("li");
li.textContent = "1つ目";
list.appendChild(li);

const li2 = document.createElement("li");
li2.textContent = "2つ目";
list.appendChild(li2);

const li3 = document.createElement("li");
li3.textContent = "3つ目";
list.appendChild(li3);`,

  "dom-list": `const tasks = ["朝ラン", "買い物", "読書"];
const list = document.querySelector("#list");

tasks.forEach((task) => {
  const li = document.createElement("li");
  li.textContent = task;
  list.appendChild(li);
});`,

  "dom-event": `const btn = document.querySelector("#btn");
const countEl = document.querySelector("#count");
let count = 0;

btn.addEventListener("click", () => {
  count = count + 1;
  countEl.textContent = count;
});`,

  "dom-input": `const input = document.querySelector("#name");
const btn = document.querySelector("#go");
const hello = document.querySelector("#hello");

btn.addEventListener("click", () => {
  const name = input.value;
  hello.textContent = \`こんにちは、\${name}さん\`;
});`,

  "dom-state": `let count = 0;
const view = document.querySelector("#view");

function render() {
  view.textContent = count;
}

document.querySelector("#plus").addEventListener("click", () => {
  count = count + 1;
  render();
});

document.querySelector("#minus").addEventListener("click", () => {
  count = count - 1;
  render();
});

render();`,

  "dom-fetch": `const btn = document.querySelector("#load");
const list = document.querySelector("#users");

btn.addEventListener("click", async () => {
  list.textContent = "読み込み中…";
  const users = await fetchUsers();
  list.textContent = "";

  users.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = \`\${u.name}（\${u.age}歳）\`;
    list.appendChild(li);
  });
});`,

  "dom-todo": `const todos = [];
const input = document.querySelector("#text");
const list = document.querySelector("#list");

function render() {
  list.textContent = "";
  todos.forEach((text, i) => {
    const li = document.createElement("li");
    li.textContent = text;

    const del = document.createElement("button");
    del.textContent = "削除";
    del.addEventListener("click", () => {
      todos.splice(i, 1);
      render();
    });
    li.appendChild(del);

    list.appendChild(li);
  });
}

document.querySelector("#add").addEventListener("click", () => {
  const text = input.value;
  if (text === "") return;

  todos.push(text);
  input.value = "";
  render();
});

render();`,

  // ── MODULE 06 — TypeScript
  "ts-intro": `const count: number = 3;
const message: string = "個あります";

console.log(count + message);`,

  "ts-infer": `const user = "りーたん";

function greet(name: string) {
  return \`こんにちは、\${name}さん\`;
}

console.log(greet(user));`,

  "ts-func": `function withTax(price: number): number {
  return Math.round(price * 1.1);
}

console.log(withTax(1000));   // 1100 になるはず`,

  "ts-object": `type Book = { title: string; pages: number };

const book: Book = { title: "リーダブルコード", pages: 260 };

console.log(\`\${book.title}（\${book.pages}ページ）\`);`,

  "ts-union": `type Size = "S" | "M" | "L";

function describe(size: Size): string {
  if (size === "S") return "小さめ";
  if (size === "M") return "ふつう";
  return "大きめ";
}

console.log(describe("M"));`,

  "ts-optional": `type Profile = { name: string; nickname?: string };

const p1: Profile = { name: "Sato", nickname: "サトちん" };
const p2: Profile = { name: "Suzuki" };

function hello(p: Profile): string {
  return \`こんにちは、\${p.nickname ?? p.name}さん\`;
}

console.log(hello(p1));
console.log(hello(p2));`,

  "ts-array": `function average(scores: number[]): number {
  const total = scores.reduce((sum, n) => sum + n, 0);
  return total / scores.length;
}

console.log(average([80, 95, 60, 100]));`,

  "ts-interface": `interface Item {
  name: string;
  price: number;
}

const item: Item = { name: "コーヒー", price: 500 };

function total(i: Item): number {
  return Math.round(i.price * 1.1);
}

console.log(\`\${item.name}: \${total(item)}円\`);`,

  "ts-async": `type User = { name: string; age: number };

async function loadAdults(): Promise<User[]> {
  const users = await fetchUsers();
  return users.filter((u) => u.age >= 25);
}

const adults = await loadAdults();
adults.forEach((u) => console.log(u.name));`,

  "ts-exercise": `type User = { name: string; age: number };
type Post = { author: string; title: string };

const users: User[] = await fetchUsers();
const posts: Post[] = await fetchPosts();

users.forEach((u) => {
  const count = posts.filter((p) => p.author === u.name).length;
  console.log(\`\${u.name}: \${count}件\`);
});`,

  // ── MODULE 07 — React / Next.js
  "react-intro": `function App() {
  return (
    <div>
      <h1>はじめての React</h1>
      <p>コンポーネントは、見た目を返す関数。</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`,

  "react-jsx": `function App() {
  const price = 1000;

  return (
    <div className="card">
      <h1>コーヒー</h1>
      <p>税込み {Math.round(price * 1.1)} 円</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "react-props": `function Card({ title, price, stock }) {
  return (
    <div className="card">
      <strong>{title}</strong> — {price}円（在庫 {stock}）
    </div>
  );
}

function App() {
  return (
    <div>
      <Card title="コーヒー" price={500} stock={12} />
      <Card title="紅茶" price={450} stock={3} />
      <Card title="ココア" price={480} stock={7} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "react-list": `const tasks = [
  { id: 1, title: "朝ラン", done: true },
  { id: 2, title: "買い物", done: false },
  { id: 3, title: "読書", done: false },
];

function App() {
  return (
    <ul>
      {tasks.map((t) => (
        <li key={t.id} className={t.done ? "done" : ""}>
          {t.title}
        </li>
      ))}
    </ul>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "react-state": `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);`,

  "react-event": `function App() {
  const [count, setCount] = useState(0);

  const addThree = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={addThree}>+3</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "react-form": `function App() {
  const [text, setText] = useState("");

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ひとこと"
      />
      <button disabled={text === ""}>送信</button>
      <p>入力中: {text}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "react-effect": `function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>読み込み中…</p>;

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.title}>
          {p.title} — {p.author}
        </li>
      ))}
    </ul>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "react-lift": `function Display({ count }) {
  return <p>いまのカウント: {count}</p>;
}

function Controls({ onAdd, onSub }) {
  return (
    <div>
      <button onClick={onAdd}>+1</button>
      <button onClick={onSub}>-1</button>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Display count={count} />
      <Controls
        onAdd={() => setCount((prev) => prev + 1)}
        onSub={() => setCount((prev) => prev - 1)}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "react-todo": `function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  const add = () => {
    if (text === "") return;
    setTodos([...todos, { id: Date.now(), text }]);
    setText("");
  };

  const remove = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h2>TODO（React版）</h2>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="やることを入力"
      />
      <button onClick={add}>追加</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            {t.text}
            <button onClick={() => remove(t.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "next-intro": `function Page() {
  const [tab, setTab] = useState("home");

  return (
    <div>
      <button onClick={() => setTab("home")}>ホーム</button>
      <button onClick={() => setTab("about")}>このサイトについて</button>
      <button onClick={() => setTab("contact")}>お問い合わせ</button>

      <div className="card">
        {tab === "home" && <p>ようこそ</p>}
        {tab === "about" && <p>codelog について</p>}
        {tab === "contact" && <p>お問い合わせはこちら</p>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Page />);`,

  // ── MODULE 08 — 個人開発の実践
  "dev-scope": `const plan = {
  name: "booklog",
  who: "本を読むけど、内容を忘れてしまう自分",
  problem: "読んだ本と、そこから学んだ一言が残らない",
  mvp: ["本を追加する", "一言メモを書く", "一覧で読み返す"],
};

console.log(\`\${plan.name}: \${plan.problem}\`);
plan.mvp.forEach((f, i) => console.log(\`機能\${i + 1}: \${f}\`));`,

  "dev-data": `const items = [
  { id: 1, title: "リーダブルコード", note: "命名が9割", done: true },
  { id: 2, title: "達人プログラマー", note: "", done: false },
  { id: 3, title: "リファクタリング", note: "小さく直す", done: true },
];

const doneCount = items.filter((i) => i.done).length;
console.log(\`\${items.length}冊中 \${doneCount}冊 読了\`);`,

  "dev-ui": `function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  const add = () => {
    if (text === "") return;
    setItems([...items, { id: Date.now(), title: text }]);
    setText("");
  };

  return (
    <div>
      <h2>マイアプリ</h2>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="追加するもの"
      />
      <button onClick={add}>追加</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  "dev-persist": `const KEY = "myapp:items";

function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const add = () => {
    if (text === "") return;
    const next = [...items, { id: Date.now(), title: text }];
    setItems(next);
    setText("");
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="追加するもの"
      />
      <button onClick={add}>追加</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
      <p>{items.length}件（リロードしても残る）</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,

  // ── MODULE 09 — テストを書く
  "test-why": `const multiply = (a, b) => a * b;

test("4 × 5 は 20", () => {
  expect(multiply(4, 5)).toBe(20);
});

test("0 を掛けると 0", () => {
  expect(multiply(7, 0)).toBe(0);
});`,

  "test-fail": `const toCelsius = (f) => (f - 32) / 1.8;

test("212°F は 100°C", () => {
  expect(toCelsius(212)).toBe(100);
});

test("32°F は 0°C", () => {
  expect(toCelsius(32)).toBe(0);
});`,

  "test-edge": `const maxOf = (nums) => {
  if (nums.length === 0) return null;
  return Math.max(...nums);
};

test("最大値を返す", () => {
  expect(maxOf([3, 9, 4])).toBe(9);
});

test("空配列なら null", () => {
  expect(maxOf([])).toBe(null);
});

test("マイナスだけでも動く", () => {
  expect(maxOf([-5, -2, -9])).toBe(-2);
});`,

  "test-async": `test("投稿を5件取得できる", async () => {
  const posts = await fetchPosts();
  expect(posts.length).toBe(5);
});

test("1件目の著者は Aoi", async () => {
  const posts = await fetchPosts();
  expect(posts[0].author).toBe("Aoi");
});`,

  "test-tdd": `const slugify = (text) => text.trim().toLowerCase().replaceAll(" ", "-");

test("空白はハイフンになる", () => {
  expect(slugify("Hello World")).toBe("hello-world");
});

test("小文字になる", () => {
  expect(slugify("CodeLog")).toBe("codelog");
});

test("前後の空白は消える", () => {
  expect(slugify("  hi there  ")).toBe("hi-there");
});`,

  "test-design": `const totalWithTax = (items) => {
  const sum = items.reduce((s, i) => s + i.price, 0);
  return Math.round(sum * 1.1);
};

test("税込み合計を求められる", () => {
  expect(totalWithTax([{ price: 100 }, { price: 250 }])).toBe(385);
});

test("空なら 0", () => {
  expect(totalWithTax([])).toBe(0);
});`,
};

export function getSolution(lessonId: string): string | undefined {
  return solutions[lessonId];
}
