const express = require("express");
const { generateFollowup } = require("../services/qwenClient");

const router = express.Router();

const SUPPORTED_LANGS = ["zh", "en"];
const MAX_QUESTION_LEN = 500;
const MAX_HISTORY_TURNS = 6;

router.post("/followup", async (req, res) => {
  const { entry, question, history } = req.body || {};

  if (!entry || typeof entry.title !== "string" || typeof entry.detail !== "string") {
    return res.status(400).json({ error: "缺少案例信息（title/detail）" });
  }
  const q = typeof question === "string" ? question.trim() : "";
  if (!q) {
    return res.status(400).json({ error: "请输入你想追问的问题" });
  }
  if (q.length > MAX_QUESTION_LEN) {
    return res.status(400).json({ error: `问题过长，请控制在 ${MAX_QUESTION_LEN} 字以内` });
  }

  const language = SUPPORTED_LANGS.includes(req.body?.language) ? req.body.language : "zh";
  // 历史记录沿用 v4 前端的 {q, a} 结构（而不是 role/content），保持与前端 currentChatHistory 一致
  const safeHistory = Array.isArray(history)
    ? history
        .filter((h) => h && typeof h.q === "string" && typeof h.a === "string")
        .slice(-MAX_HISTORY_TURNS)
    : [];

  try {
    const answer = await generateFollowup({
      entry: { title: entry.title, detail: entry.detail },
      question: q,
      history: safeHistory,
      language
    });
    return res.json({ answer });
  } catch (err) {
    console.error("[/api/followup] 生成失败:", err.message);
    return res.status(502).json({ error: "追问失败，请稍后重试" });
  }
});

module.exports = router;
