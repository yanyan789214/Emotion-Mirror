require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const mirrorsRouter = require("./src/routes/mirrors");
const followupRouter = require("./src/routes/followup");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);
app.use(express.json({ limit: "200kb" }));

// 简单限流：防止接口被刷、控制 Qwen API 调用成本
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 30, // 每个 IP 15 分钟内最多 30 次
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "请求过于频繁，请稍后再试" },
});

// 追问接口单独限流：单次问答成本更低，但避免被当聊天窗口无限刷
const followupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "追问过于频繁，请稍后再试" },
});

app.use("/api", apiLimiter, mirrorsRouter);
app.use("/api", followupLimiter, followupRouter);

// 生产环境下顺带把前端静态文件也托管起来（可选，也可以用 Nginx / Vercel 等单独部署前端）
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`情绪镜像 v4 后端已启动: http://localhost:${PORT}`);
});
