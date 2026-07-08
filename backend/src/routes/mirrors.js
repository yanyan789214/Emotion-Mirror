const express = require("express");
const { generateMirrors } = require("../services/qwenClient");

const router = express.Router();

const MAX_LEN = 4000;
const MIN_LEN = 4;
const SUPPORTED_LANGS = ["zh", "en"];

router.post("/mirrors", async (req, res) => {
  const situation = typeof req.body?.situation === "string" ? req.body.situation.trim() : "";
  const language = SUPPORTED_LANGS.includes(req.body?.language) ? req.body.language : "zh";

  if (situation.length < MIN_LEN) {
    return res.status(400).json({ error: "请输入更完整的处境描述" });
  }
  if (situation.length > MAX_LEN) {
    return res.status(400).json({ error: `文本过长，请控制在 ${MAX_LEN} 字以内` });
  }

  try {
    const result = await generateMirrors(situation, language);
    return res.json(result);
  } catch (err) {
    console.error("[/api/mirrors] 生成失败:", err.message);
    return res.status(502).json({ error: "生成失败，请稍后重试" });
  }
});

module.exports = router;
