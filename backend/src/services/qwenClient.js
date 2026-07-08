const QWEN_BASE_URL = process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen3.6-flash";

const CATEGORY_KEYS = ["movie", "poem", "history", "novel", "other"];

const FALLBACK_TEXT = {
  zh: { title: "解析异常", teaser: "请重新生成一次", detail: "这部分内容解析出现问题，请重新点击“开始照见”再试一次。" },
  en: { title: "Parsing issue", teaser: "Please try again", detail: "This section could not be parsed correctly, please try submitting again." }
};

/**
 * 生成主 prompt。刻意使用纯文本自定义格式（@@CATEGORY / @@ENTRY / TITLE:: / TEASER:: / DETAIL::）
 * 而不是 JSON —— 这是 v4 原型的设计，好处是模型在长文本、多条目输出时更不容易因为一个
 * 转义符/引号错误就让整段 JSON 解析失败。
 */
function buildPrompt(situation, language) {
  const langInstruction = language === "en" ? "请用英文（English）撰写全部内容。" : "请用中文撰写全部内容。";

  return `用户写下了TA近期真实、复杂、可能交织多条线索的处境：

"""${situation}"""

${langInstruction}

请先理解这段处境里最核心的情感张力和真正的抉择本质（不要只抓表面关键词），然后分别从以下5个维度，各提供 3 到 5 条相关的回响条目：

1. movie：真实存在的电影里，角色面临相似处境或转变
2. poem：相关诗句意境（可引用极短的一两句经典名句，其余用自己的话描述）
3. history：真实历史人物经历过的相似处境及后续转变
4. novel：真实小说里的情节或角色心理转变
5. other：哲人名言、画作意象、或音乐情绪联想

【非常重要的准确性要求】
- 对于 history（历史人物）和 novel（小说情节），准确性优先于文采。宁可写得平实、留有余地，也不要为了让故事"更好读"而简化因果关系、编造具体对话/书信内容/心理独白，或者把多重原因压缩成单一戏剧化原因。
- 如果一件事的真实原因是复杂的（比如同时涉及阶级、金钱、家庭、个人选择等多重因素），请如实体现这种复杂性，不要为了叙事流畅而只挑一个简化的理由。
- 如果某个具体细节你不确定是否准确，使用更概括、留有余地的表述（比如"这段关系最终没有走下去"而不是编造具体的分手场景），不要编造听起来真实但无法确认的具体情节。
- 时间线、人物关系、因果顺序，尽量贴近真实历史，不要为了让故事看起来更利落而调整时间发生的先后顺序。

请严格按照下面这种纯文本格式输出，不要输出JSON，不要用markdown代码块，不要有多余的说明文字。每个字段独占一行，标题/引子不要换行，正文DETAIL可以是一段完整文字（不要人为断行）：

@@CATEGORY:movie
@@ENTRY
TITLE::标题
TEASER::一句话引子，20-30字
DETAIL::完整段落，160-220字，温柔克制、有文学质感、绝不说教
@@ENTRY
TITLE::...
TEASER::...
DETAIL::...
@@CATEGORY:poem
@@ENTRY
...
@@CATEGORY:history
...
@@CATEGORY:novel
...
@@CATEGORY:other
...

（movie/poem/history/novel/other 五个类别都要有，每个类别下 3-5 个 @@ENTRY）`;
}

/**
 * 解析 @@CATEGORY / @@ENTRY 格式的纯文本输出。
 * 与 v4 前端原来的 parseMirrorText 逻辑保持一致，只是搬到了服务器端。
 */
function parseMirrorText(text, language) {
  const result = { movie: [], poem: [], history: [], novel: [], other: [] };
  const catBlocks = text.split(/@@CATEGORY:/).slice(1);

  catBlocks.forEach((block) => {
    const catMatch = block.match(/^(\w+)/);
    if (!catMatch) return;
    const catKey = catMatch[1].trim();
    if (!result[catKey]) return;

    const entryBlocks = block.split(/@@ENTRY/).slice(1);
    entryBlocks.forEach((eb) => {
      const titleMatch = eb.match(/TITLE::(.*)/);
      const teaserMatch = eb.match(/TEASER::(.*)/);
      const detailMatch = eb.match(/DETAIL::([\s\S]*?)(?=@@CATEGORY:|$)/);
      if (titleMatch && teaserMatch && detailMatch) {
        result[catKey].push({
          title: titleMatch[1].trim(),
          teaser: teaserMatch[1].trim(),
          detail: detailMatch[1].trim()
        });
      }
    });
  });

  // 兜底：如果解析失败某个类别为空，避免前端报错
  const fallback = FALLBACK_TEXT[language] || FALLBACK_TEXT.zh;
  CATEGORY_KEYS.forEach((k) => {
    if (result[k].length === 0) {
      result[k].push({ ...fallback });
    }
  });

  return result;
}

/**
 * 构造"追问"场景下发给模型的 prompt，与 v4 前端原来内联在 askBtn 处理函数里的
 * prompt 保持一致（同样强调"准确性优先于文采，不确定就明说"）。
 */
function buildFollowupPrompt({ entry, question, history, language }) {
  const langInstruction = language === "en" ? "Answer in English." : "请用中文回答。";
  const historyText = (history || [])
    .map((h) => `Q: ${h.q}\nA: ${h.a}`)
    .join("\n\n");

  return `背景条目 —— 标题：《${entry.title}》
内容：${entry.detail}

${historyText ? `此前追问记录：\n${historyText}\n\n` : ""}用户现在追问："${question}"

${langInstruction}请基于这个条目的背景，用温柔、克制、有文学质感的语气回答用户的追问（120-180字左右）。准确性优先于文采：如果涉及具体史实/情节细节，请如实反映其复杂性，不确定的地方请明确说"这一点历史记载有限/说法不一"，不要为了让回答更完整而编造听起来合理但无法确认的细节。`;
}

async function callQwen(prompt) {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error("服务器未配置 QWEN_API_KEY，请检查 .env 文件");
  }

  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: QWEN_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8
      // 注意：这里故意不设 response_format=json_object，
      // 因为主 prompt 要求的是自定义纯文本格式，不是 JSON。
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Qwen API 请求失败: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Qwen API 返回结构异常，未找到生成内容");
  }
  return text;
}

async function generateMirrors(situation, language = "zh") {
  const prompt = buildPrompt(situation, language);
  const text = await callQwen(prompt);
  return parseMirrorText(text, language);
}

async function generateFollowup(params) {
  const prompt = buildFollowupPrompt(params);
  const text = await callQwen(prompt);
  return text.trim();
}

module.exports = { generateMirrors, generateFollowup };
