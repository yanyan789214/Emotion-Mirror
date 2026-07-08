# 情绪镜像 · Emotion Mirror

**情绪镜像**是一个小型 Web 应用。使用者在网页上写下自己近期真实、复杂、
说不清的处境(比如一次抉择、一段关系、一种说不出口的情绪),点击"开始照见"后,
后台会调用 AI,从 5 个维度分别找出 3-5 个曾经历过相似处境的"回声":

**Emotion Mirror** is a small web app. The user writes down a real, complex, hard-to-name situation they're currently facing (a decision, a relationship, a feeling they can't quite put into words). After clicking "Begin the Mirror," the backend calls an AI to surface 3–5 "echoes" of similar situations across 5 dimensions:*

| 维度 · Dimension | 说明 · Description |
|---|---|
| 🎬 电影 Movie | 真实存在的电影里,某个角色面临过相似处境 <br> *A character in a real film who faced a similar situation* |
| ✍️ 诗歌 Poem | 意境与处境有共鸣的真实诗作 <br> *A real poem whose imagery resonates with the situation* |
| 📜 历史 History | 真实历史人物经历过的相似处境及后续转变 <br> *A real historical figure who went through something similar, and how they changed afterward* |
| 📖 小说 Novel | 真实小说里的情节或角色心理转变 <br> *A plot or character transformation from a real novel* |
| 💭 其他 Other | 哲人名言 / 画作 / 音乐等其他形式的联想 <br> *Associations from philosophy, art, or music* |

每一条"回声"可以点开看完整的起因经过结果,还能针对这一条继续追问细节
(比如"具体发生了什么""后来他怎么样了")。界面支持中文 / English 切换。

*Each "echo" can be opened to read the full arc — beginning, development, and outcome — and you can keep asking follow-up questions about it (e.g. "what exactly happened" or "how did things turn out for them"). The interface supports both Chinese and English.*

项目采用**前后端分离**结构:浏览器端的网页不包含任何密钥,所有对 AI 的调用
都经过你自己的后端服务器代理,密钥只保存在服务器的环境变量里。(本项目以Qwen为例,后文用xxxx代替)

*The project uses a __frontend/backend separation__ architecture: the browser-side page contains no keys at all. Every call to the AI is proxied through your own backend server, and the key is stored only in the server's environment variables. (This project uses Qwen as the example provider; "xxxx" is used as a placeholder for it below.)*

---

## 目录 · Table of Contents

- [功能一览 · Feature Overview](#功能一览--feature-overview)
- [技术栈 · Tech Stack](#技术栈--tech-stack)
- [项目结构 · Project Structure](#项目结构--project-structure)
- [快速开始 · Quick Start](#快速开始--quick-start)
- [环境变量说明 · Environment Variables](#环境变量说明--environment-variables)
- [接口说明 · API Reference](#接口说明--api-reference)
- [常见问题排查 · Troubleshooting](#常见问题排查--troubleshooting)
- [关于内容准确性 · On Content Accuracy](#关于内容准确性--on-content-accuracy)

---

## 功能一览 · Feature Overview

- ✅ 输入处境 → 五维度、每维度 3-5 条案例
  *Input a situation → 5 dimensions, each with 3–5 entries*
- ✅ 案例详情页 + 针对单条案例的多轮追问对话
  *Entry detail pages + multi-turn follow-up chat for a single entry*
- ✅ 中文 / English 双语界面(含 AI 生成内容的语言切换)
  *Bilingual Chinese/English interface (including the language of AI-generated content)*
- ✅ 加载中的进度条 + 阶段提示文案 + 计时,避免"卡住了"的困惑
  *A loading progress bar + staged status text + timer, so it never feels like it's stuck*
- ✅ 详情页附带"去搜索引擎查证"的链接
  *Each detail page includes a "verify on a search engine" link*
- ✅ 后端限流(防止接口被刷、控制 API 调用成本)、输入长度校验
  *Backend rate-limiting (to prevent abuse and control API cost) and input length validation*
- ✅ AI 密钥只存在于后端 `.env`,浏览器代码和网络请求里都看不到
  *The AI key lives only in the backend's `.env` — it never appears in browser code or network requests*

---

## 技术栈 · Tech Stack

- **前端 · Frontend**:原生 HTML / CSS / JavaScript(无需构建工具,双击打不开是因为要经过后端,见下方"快速开始")
  *Vanilla HTML / CSS / JavaScript (no build tools needed; double-clicking won't open it because it needs to go through the backend — see "Quick Start" below)*
- **后端 · Backend**:Node.js + Express
- **AI 服务 · AI Service**:AI 兼容接口
  *AI-compatible API*

---

## 项目结构 · Project Structure

```
emotion-mirror-v4/
├── frontend/                          前端:浏览器里看到的一切,不含任何密钥
│                                       Frontend: everything visible in the browser, contains no keys
│   ├── index.html                       网页骨架:头部导航、语言切换按钮、
│   │                                     处境输入框、星盘装饰、结果弹窗等
│   │                                     所有 HTML 元素都在这里
│   │                                     Page skeleton: header nav, language toggle,
│   │                                     situation input, compass decoration, result modals —
│   │                                     all HTML elements live here
│   ├── style.css                        网页样式:配色、字体、
│   │                                     动画(星盘转动、加载进度条等)
│   │                                     Page styling: colors, typography,
│   │                                     animations (compass rotation, loading bar, etc.)
│   └── app.js                           网页交互逻辑,包括:
│                                         Page interaction logic, including:
│                                         · 中英文文案字典与切换
│                                           Chinese/English copy dictionary and switching
│                                         · 背景微粒动画
│                                           Background particle animation
│                                         · 点击"开始照见"后:显示加载进度、
│                                           请求后端 /api/mirrors、渲染结果
│                                           On clicking "Begin the Mirror": show loading progress,
│                                           call the backend /api/mirrors, render the result
│                                         · 点击某个维度:弹出该维度的案例列表
│                                           Clicking a dimension: opens that dimension's entry list
│                                         · 点击某条案例:展开详情
│                                           Clicking an entry: expands its detail
│                                         · 追问输入框:请求后端 /api/followup
│                                           Follow-up input box: calls the backend /api/followup
│
├── backend/                           后端:处理请求、安全调用 AI 的服务器
│                                       Backend: the server that handles requests and safely calls the AI
│   ├── server.js                        服务器入口。做的事情:
│                                         Server entry point. What it does:
│                                         · 加载 .env 里的配置
│                                           Loads config from .env
│                                         · 设置 CORS(允许哪些前端域名访问)
│                                           Sets up CORS (which frontend domains are allowed)
│                                         · 设置限流(防止接口被刷)
│                                           Sets up rate-limiting (to prevent abuse)
│                                         · 挂载 /api/mirrors、/api/followup 路由
│                                           Mounts the /api/mirrors and /api/followup routes
│                                         · 顺带把 frontend 文件夹当静态网站托管
│                                           Also serves the frontend folder as a static site
│   ├── src/
│   │   ├── routes/
│   │   │   ├── mirrors.js                处理"根据处境生成五维回响"的请求:
│   │   │                                  校验输入 → 调用 xxxxClient → 返回结果
│   │   │                                  Handles "generate five-dimension echoes from a situation":
│   │   │                                  validate input → call xxxxClient → return the result
│   │   │   └── followup.js               处理"针对某条案例继续追问"的请求:
│   │   │                                  校验输入 → 调用 xxxxClient → 返回回答
│   │   │                                  Handles "ask a follow-up about a specific entry":
│   │   │                                  validate input → call xxxxClient → return the answer
│   │   └── services/
│   │       └── qwenClient.js             核心业务逻辑,包含:
│                                          Core business logic, including:
│                                          · 生成五维回响的完整 prompt(含准确性要求)
│                                            The full prompt for generating five-dimension echoes
│                                            (including the accuracy requirements)
│                                          · 追问场景的 prompt
│                                            The prompt for the follow-up scenario
│                                          · 真正发起 HTTP 请求调用 xxxx API 的代码
│                                            The code that actually makes the HTTP request to the xxxx API
│                                          · 把 AI 返回的纯文本解析成结构化数据
│                                            Parses the AI's plain-text response into structured data
│   ├── package.json                     声明这个后端依赖了哪些 npm 包
│                                         Declares which npm packages this backend depends on
│   ├── .env.example                     环境变量模板,复制为 .env 后填真实值
│                                         Environment variable template — copy to .env and fill in real values
│   └── .gitignore                       避免 .env(真实密钥)被提交到 git 仓库
│                                         Prevents .env (the real key) from being committed to the git repo
│
└── README.md                          就是你现在在看的这份文档
                                        This very document you're reading
```

---

## 快速开始 · Quick Start

### 前置条件 · Prerequisites

- 已安装 [Node.js](https://nodejs.org/)(建议 18 版本或以上)
  *[Node.js](https://nodejs.org/) installed (v18 or above recommended)*
- 一个可用的通义千问API 密钥
  *A working Qwen (Tongyi Qianwen) API key*

### 步骤 · Steps

```bash
# 1. 解压项目后,进入后端目录
# 1. After unzipping the project, go into the backend directory
cd emotion-mirror-v4/backend

# 2. 复制环境变量模板
# 2. Copy the environment variable template
cp .env.example .env

# 3. 用编辑器打开 .env,填入你的真实密钥
#    xxxx_API_KEY=sk-xxxxxxxxxxxxxxxx
# 3. Open .env in an editor and fill in your real key
#    xxxx_API_KEY=sk-xxxxxxxxxxxxxxxx

# 4. 安装依赖
# 4. Install dependencies
npm install

# 5. 启动服务
# 5. Start the server
npm start
```

看到终端输出 `情绪镜像 v4 后端已启动: http://localhost:3000`,说明启动成功。

*Once the terminal shows `情绪镜像 v4 后端已启动: http://localhost:3000` ("Emotion Mirror v4 backend started"), it means startup succeeded.*

打开浏览器访问 **http://localhost:3000** 即可看到网页并直接使用
(后端已经顺便把 `frontend` 目录当静态网站托管了,不需要再单独起一个前端服务)。

*Open your browser to __http://localhost:3000__ to see the page and use it directly (the backend already serves the `frontend` folder as a static site, so there's no need to run a separate frontend server).*

> 💡 只有你自己电脑能访问这个地址。想让别人也能用,请看下方"部署到公网"。
>
> *💡 Only your own computer can reach this address. If you want others to be able to use it, see "Deploying Publicly" below.*

---

## 环境变量说明 · Environment Variables

在 `backend/.env` 里配置(先 `cp .env.example .env` 再编辑):

*Configured in `backend/.env` (run `cp .env.example .env` first, then edit it):*


---

## 接口说明 · API Reference

后端一共暴露两个接口,前端 `app.js` 会自动调用它们,你一般不需要手动调用,
但如果想二次开发或调试,可以参考:

*The backend exposes two endpoints in total. The frontend's `app.js` calls them automatically, so you generally don't need to call them by hand — but they're documented here in case you want to extend or debug the project:*

### `POST /api/mirrors` —— 生成五维回响 · Generate the five-dimension echoes

请求体 · Request body:
```json
{ "situation": "用户写下的处境文字...", "language": "zh" }
```
- `situation`:必填,4-4000 字
  *Required, 4–4000 characters*
- `language`:可选,`"zh"` 或 `"en"`,默认 `"zh"`
  *Optional, `"zh"` or `"en"`, defaults to `"zh"`*

返回 · Response:
```json
{
  "movie": [ { "title": "...", "teaser": "...", "detail": "..." }, ... ],
  "poem": [ ... ],
  "history": [ ... ],
  "novel": [ ... ],
  "other": [ ... ]
}
```

### `POST /api/followup` —— 针对某条案例继续追问 · Ask a follow-up about a specific entry

请求体 · Request body:
```json
{
  "entry": { "title": "案例标题", "detail": "案例详情" },
  "question": "用户追问的问题",
  "history": [ { "q": "上一轮问题", "a": "上一轮回答" } ],
  "language": "zh"
}
```

返回 · Response:
```json
{ "answer": "AI 针对这个问题的回答" }
```

两个接口出错时都会返回 `{ "error": "友好的错误提示" }`,详细的报错原因只会
打印在后端的终端日志里,不会泄露给浏览器。

*If either endpoint errors, both return `{ "error": "a friendly error message" }`. The detailed error reason is only printed in the backend's terminal log — it is never leaked to the browser.*

---

## 常见问题排查 · Troubleshooting

| 现象 · Symptom | 可能原因 · Possible Cause |
|---|---|
| 终端提示 `服务器未配置 xxxx_API_KEY` <br> *Terminal shows `server not configured with xxxx_API_KEY`* | `.env` 里没填密钥,或者忘了 `cp .env.example .env` <br> *The key wasn't filled in `.env`, or you forgot to run `cp .env.example .env`* |
| 点击"开始照见"后一直报错 <br> *Clicking "Begin the Mirror" keeps erroring* | 检查 `xxxx_API_KEY` 是否正确、`xxxx_BASE_URL` 是否是你实际能访问的地址、服务器网络是否能访问该地址 <br> *Check whether `xxxx_API_KEY` is correct, whether `xxxx_BASE_URL` is an address you can actually reach, and whether your server's network can access that address* |
| 生成的内容偶尔缺了某个维度 <br> *Generated content is occasionally missing a dimension* | AI 偶尔没有严格按格式输出,后端已经做了兜底(显示"解析异常,请重新生成"),重新点一次"开始照见"通常就好 <br> *The AI occasionally doesn't follow the format strictly; the backend already has a fallback (showing "parsing issue, please regenerate"). Clicking "Begin the Mirror" again usually fixes it* |
| 页面打不开 / 显示"无法访问此网站" <br> *Page won't open / shows "can't reach this site"* | 确认 `npm start` 还在运行、终端没有报错、访问的地址和端口跟终端里显示的一致 <br> *Confirm `npm start` is still running, the terminal shows no errors, and the address/port you're visiting matches what the terminal displays* |

---

## 关于内容准确性 · On Content Accuracy

这些"回声"是 AI 结合公开知识生成的,**不是从权威数据库逐条核实过的确凿史实**。
Prompt 里已经要求 AI 尽量避免编造具体细节、简化因果关系,不确定的地方要
明确说"这一点历史记载有限",但仍然可能存在偏差。详情页附带的"去搜索引擎
查证"链接,建议在引用到正式场合前自行核实关键信息;"继续追问"得到的回答
同样是 AI 生成的延伸,不是替你查了原始资料。

*These "echoes" are generated by the AI drawing on public knowledge — they are __not__ facts verified entry-by-entry against an authoritative database. The prompt already instructs the AI to avoid fabricating specific details or oversimplifying causes, and to explicitly say "the historical record here is limited" when uncertain — but deviations are still possible. The "verify on a search engine" link on each detail page is there so you can independently confirm key information before citing it in any formal context. Answers from "continue asking" are likewise AI-generated extensions, not something looked up from primary sources on your behalf.*


如果您有任何问题，欢迎邮件联系：yy123an@163.com
If you have any questions, feel free to reach out via email: yy123an@163.com
(Subject: Emotion Mirror)

