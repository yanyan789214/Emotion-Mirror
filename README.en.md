# Emotion Mirror

> Write down a situation you can't quite put into words, and AI will find echoes of it across film, poetry, history, and novels.

---

## Table of Contents

- [What This Is](#what-this-is)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Deploying to the Public Internet](#deploying-to-the-public-internet)
- [A Note on Accuracy](#a-note-on-accuracy)
- [Want to Customize It?](#want-to-customize-it)

---

## What This Is

**Emotion Mirror** is a small web app. The user writes down a real, complicated,
hard-to-articulate situation they're going through right now (a tough decision,
a relationship, a feeling they can't quite name). After clicking "Begin the
Reflection," the backend calls an AI model (Qwen) and returns 3-5 "echoes" per
category, across 5 dimensions — real cases of people or characters who once
faced something similar:

| Dimension | Description |
|---|---|
| 🎬 Film | A real movie in which a character faced a similar situation |
| ✍️ Poetry | A real poem whose imagery resonates with the situation |
| 📜 History | A real historical figure who went through something similar, and what came of it |
| 📖 Novel | A real novel's plot or a character's psychological shift |
| 💭 Other | A philosopher's quote, a painting, a piece of music — any other kind of resonance |

Each echo can be expanded into a fuller account of what happened, and you can
keep asking follow-up questions about that specific case (e.g. "what exactly
happened?" / "how did it turn out?"). The interface supports both Chinese and
English.

The project is built as a **separate frontend and backend**: the webpage
contains no API key at all. Every call to the AI goes through your own backend
server, and the key only ever lives in that server's environment variables.

---

## Features

- ✅ One situation in → 5 categories, 3-5 cases each
- ✅ Expandable detail view + multi-turn follow-up chat on a single case
- ✅ Chinese / English UI toggle (including the language of the AI-generated content)
- ✅ A loading progress bar + rotating status text + elapsed timer, so it never feels stuck
- ✅ A "verify on a search engine" link on each detail page
- ✅ Backend rate limiting (to prevent abuse and control API cost) and input validation
- ✅ The API key lives only on the backend `.env` — never in the browser or on the wire

---

## Tech Stack

- **Frontend**: plain HTML / CSS / JavaScript (no build step needed; you can't just double-click index.html though — see Quick Start below)
- **Backend**: Node.js + Express
- **AI provider**: Qwen (via its OpenAI-compatible chat completions endpoint)

---

## Project Structure

```
emotion-mirror-v4/
├── frontend/                          Everything the browser sees — no keys in here
│   ├── index.html                       The page skeleton: header, language
│   │                                     toggle, situation input, the compass
│   │                                     decoration, result modal, etc. —
│   │                                     every HTML element lives here
│   ├── style.css                        All visual styling: colors, fonts,
│   │                                     animations (the spinning compass,
│   │                                     the loading progress bar, etc.)
│   └── app.js                           All the interaction logic:
│                                         · the zh/en text dictionary and toggle
│                                         · the background particle animation
│                                         · on "Begin the Reflection": show
│                                           loading progress, call
│                                           /api/mirrors, render the results
│                                         · clicking a compass point: open
│                                           that category's list of cases
│                                         · clicking a case: expand its detail
│                                         · the follow-up input: calls
│                                           /api/followup
│
├── backend/                           Handles requests and safely calls the AI
│   ├── server.js                        Server entry point. Responsible for:
│                                         · loading config from .env
│                                         · CORS (which frontend origins may call it)
│                                         · rate limiting (to prevent abuse)
│                                         · mounting the /api/mirrors and
│                                           /api/followup routes
│                                         · serving the frontend folder as a
│                                           static site
│   ├── src/
│   │   ├── routes/
│   │   │   ├── mirrors.js                Handles "generate the five-category
│   │   │                                  echoes" requests: validates input →
│   │   │                                  calls qwenClient → returns the result
│   │   │   └── followup.js               Handles "ask a follow-up about one
│   │   │                                  case" requests: validates input →
│   │   │                                  calls qwenClient → returns the answer
│   │   └── services/
│   │       └── qwenClient.js             The core logic:
│                                          · the full prompt for generating the
│                                            five-category echoes (including the
│                                            accuracy requirements)
│                                          · the prompt for the follow-up case
│                                          · the actual HTTP call to the Qwen API
│                                          · parsing the AI's plain-text output
│                                            into structured data
│   ├── package.json                     Declares which npm packages this backend needs
│   ├── .env.example                     A template for your environment variables —
│   │                                     copy it to .env and fill in real values
│   └── .gitignore                       Keeps .env (your real API key) out of git
│
├── README.md                          Chinese documentation
└── README.en.md                       This file
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) installed (18 or later recommended)
- A working Qwen API key

### Steps

```bash
# 1. Unzip the project, then go into the backend folder
cd emotion-mirror-v4/backend

# 2. Copy the environment variable template
cp .env.example .env

# 3. Open .env in an editor and fill in your real key
#    QWEN_API_KEY=sk-xxxxxxxxxxxxxxxx

# 4. Install dependencies
npm install

# 5. Start the server
npm start
```

Once the terminal prints `情绪镜像 v4 后端已启动: http://localhost:3000`
("Emotion Mirror v4 backend started"), you're good to go.

Open your browser to **http://localhost:3000** and you'll see the full app
ready to use (the backend already serves the `frontend` folder as a static
site, so you don't need to start anything else separately).

> 💡 At this point, only your own computer can reach that address. See
> "Deploying to the Public Internet" below if you want others to use it too.

---

## Environment Variables

Configured in `backend/.env` (run `cp .env.example .env` first, then edit):

| Variable | Required | Description |
|---|---|---|
| `QWEN_API_KEY` | ✅ | Your Qwen API key. **Never commit this to git or share it.** |
| `QWEN_BASE_URL` | No | Qwen's OpenAI-compatible endpoint. Defaults to Alibaba Cloud Bailian/DashScope's `https://dashscope.aliyuncs.com/compatible-mode/v1`. If you're using a different gateway or reseller, change this to match. |
| `QWEN_MODEL` | No | Model name, defaults to `qwen3.6-flash` |
| `PORT` | No | Port the server listens on, defaults to `3000` |
| `CORS_ORIGIN` | No | Comma-separated list of frontend origins allowed to call the API. Not needed if you deploy frontend and backend together (the default setup described here). |

---

## API Reference

The backend exposes two endpoints. `app.js` calls them automatically, so you
generally won't need to call these yourself — but here's the reference in
case you want to extend or debug the project.

### `POST /api/mirrors` — generate the five-category echoes

Request body:
```json
{ "situation": "the user's written situation...", "language": "en" }
```
- `situation`: required, 4–4000 characters
- `language`: optional, `"zh"` or `"en"`, defaults to `"zh"`

Response:
```json
{
  "movie": [ { "title": "...", "teaser": "...", "detail": "..." }, ... ],
  "poem": [ ... ],
  "history": [ ... ],
  "novel": [ ... ],
  "other": [ ... ]
}
```

### `POST /api/followup` — ask a follow-up about a specific case

Request body:
```json
{
  "entry": { "title": "case title", "detail": "case detail" },
  "question": "the user's follow-up question",
  "history": [ { "q": "previous question", "a": "previous answer" } ],
  "language": "en"
}
```

Response:
```json
{ "answer": "the AI's answer to that question" }
```

Both endpoints return `{ "error": "a friendly error message" }` on failure.
The detailed underlying error is only printed to the backend's terminal log
and is never sent to the browser.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Terminal says `服务器未配置 QWEN_API_KEY` (server has no QWEN_API_KEY configured) | You forgot to fill in the key in `.env`, or forgot to run `cp .env.example .env` in the first place |
| Clicking "Begin the Reflection" always errors out | Double-check `QWEN_API_KEY` is correct, that `QWEN_BASE_URL` is actually reachable from your server, and that your server's network can reach that address |
| Some category is occasionally missing content | The AI sometimes doesn't follow the expected text format exactly; the backend already falls back to a "parsing issue, please regenerate" placeholder in that case — just click "Begin the Reflection" again |
| The page won't load / "site can't be reached" | Confirm `npm start` is still running with no errors, and that the address/port you're visiting matches what the terminal printed |

---

## Deploying to the Public Internet

Running it locally means only your own machine can reach it. To let others use it too:

1. **Backend**: deploy it to any platform that supports Node.js 18+ (Railway,
   Render, Fly.io, or your own VPS with PM2/Docker). Set `QWEN_API_KEY` and
   the other variables as that platform's environment variables.
2. **Frontend**:
   - Simplest option: let the backend keep serving it (`server.js` already
     has `express.static` set up for this) — once the backend is deployed,
     visiting its public URL shows the full site.
   - Or: deploy `frontend` separately to Vercel / Netlify / Cloudflare Pages.
     In that case, add this line to `frontend/index.html` right before
     `<script src="app.js">`:
     ```html
     <script>window.EMOTION_MIRROR_API_BASE = "https://your-backend-domain.com";</script>
     ```
3. In production, tighten `CORS_ORIGIN` in `.env` to your real frontend
   domain rather than leaving it open.

---

## A Note on Accuracy

These "echoes" are generated by AI drawing on general knowledge — **they are
not facts individually verified against an authoritative source.** The prompt
already asks the model to avoid fabricating specific details or oversimplifying
cause and effect, and to say plainly when historical records are limited or
disputed rather than making something up — but inaccuracies can still occur.
Each detail page includes a "verify on a search engine" link; please check
anything important yourself before relying on it or citing it somewhere
formal. Answers from the follow-up chat are likewise AI-generated extensions,
not the result of looking anything up in a primary source.

---

