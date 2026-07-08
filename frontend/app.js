// ================= i18n =================
const I18N = {
  zh:{
    brandName:'情绪镜像', navText:'典藏 · 人类处境回声录',
    eyebrow:'写下你此刻的处境',
    heroTitle:'你的故事，<br><em>曾在另一角落回响过</em>',
    heroDesc:'不必是一句话。写下最近这段时间真实发生的、纠结的、说不清的部分，我们会从电影、诗歌、历史、小说与更广阔的人类经验里，为你找到 3-5 段曾经历过相似处境的回声。',
    compassIdle:'此刻<br>静待落笔', compassActive:'点击<br>任一方位', compassLoading:'正在<br>凝聚回声',
    catMovieCn:'电影', catMovieEn:'Film', catPoemCn:'诗歌', catPoemEn:'Poetry',
    catHistoryCn:'历史', catHistoryEn:'History', catNovelCn:'小说', catNovelEn:'Novel', catOtherCn:'其他', catOtherEn:'Other',
    yourSituation:'你的处境',
    exampleNote:'下方仅为<b>示例引导</b>，请清空后写下你真实的处境。',
    placeholder:'示例：这段时间我总在深夜睡不着，脑海里反复回放白天和一位朋友的争执，说不清自己是该道歉，还是该坚持当时的立场——但更让我不安的是，我发现自己好像总在类似的关系里，重复同样的退让……',
    charHint:'可以写得很长、很复杂——越真实，回声越准确',
    submitIdle:'开 始 照 见', submitLoading:'打 捞 中…',
    loading0:'正在解析你的处境……', loading1:'正在检索文明中的相似经历……', loading2:'正在撰写五重回响……', loading3:'即将完成……',
    footerNote:'这里陪你看看别人是怎么走过来的。如果你正在经历很艰难的时刻，也别忘了找身边信任的人，或专业人士聊聊。',
    closeBtn:'收起 ✕', backBtn:'返回列表',
    disclaimer:'此内容为 AI 基于真实历史 / 文学 / 影视素材归纳创作，我们已要求 AI 尽量避免编造细节、简化因果关系，但仍可能存在事实偏差。人物与作品名一般真实存在，具体细节请以下方查证链接核实为准。',
    verifyLinkText:'→ 在搜索引擎查证这段内容',
    askLabel:'继续追问这一段', askPlaceholder:'例如：当时具体发生了什么？后来他是怎么改变的？', askSend:'发送',
    errorMsg:'生成失败，请重试（可能是网络问题）'
  },
  en:{
    brandName:'Emotion Mirror', navText:'Archive of Human Situations',
    eyebrow:'Write down where you are right now',
    heroTitle:'Your story<br>has <em>echoed elsewhere before</em>',
    heroDesc:"It doesn't have to be one sentence. Write down what's really been happening lately — the tangled, hard-to-name part — and we'll surface 3–5 echoes of similar situations from film, poetry, history, novels, and the wider human record.",
    compassIdle:'Awaiting<br>your words', compassActive:'Click any<br>point', compassLoading:'Gathering<br>echoes…',
    catMovieCn:'Film', catMovieEn:'FILM', catPoemCn:'Poetry', catPoemEn:'POETRY',
    catHistoryCn:'History', catHistoryEn:'HISTORY', catNovelCn:'Novel', catNovelEn:'NOVEL', catOtherCn:'Other', catOtherEn:'OTHER',
    yourSituation:'Your situation',
    exampleNote:'The text below is just an <b>example prompt</b> — clear it and write your own.',
    placeholder:"Example: I've been lying awake at night lately, replaying an argument with a friend. I don't know if I should apologize or hold my ground — but what unsettles me more is noticing I keep making the same kind of concession in relationships like this…",
    charHint:'Write as much as you need — the more real it is, the more accurate the echo',
    submitIdle:'BEGIN THE MIRROR', submitLoading:'Searching…',
    loading0:'Reading your situation…', loading1:'Searching the human record…', loading2:'Writing five reflections…', loading3:'Almost there…',
    footerNote:"This is a place to see how others made it through. If you're going through something difficult, please also reach out to someone you trust, or a professional.",
    closeBtn:'Close ✕', backBtn:'Back to list',
    disclaimer:'This content is an AI-composed synthesis drawn from real history, literature, and film. We\'ve instructed the AI to avoid fabricating details or oversimplifying causes, but factual drift is still possible. Names and works are generally real — please use the link below to verify specifics.',
    verifyLinkText:'→ Verify this on a search engine',
    askLabel:'Ask more about this', askPlaceholder:'e.g. What exactly happened then? How did they change afterward?', askSend:'Send',
    errorMsg:'Generation failed, please try again (possibly a network issue)'
  }
};
let LANG = 'zh';

function applyI18n(){
  const dict = I18N[LANG];
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if(dict[k]) el.textContent = dict[k]; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { const k = el.dataset.i18nHtml; if(dict[k]) el.innerHTML = dict[k]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.dataset.i18nPlaceholder; if(dict[k]) el.placeholder = dict[k]; });
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === LANG));
}
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => { LANG = btn.dataset.lang; applyI18n(); });
});
applyI18n();

// ================= 背景微粒 =================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
const dots = Array.from({length: 44}, () => ({
  x: Math.random()*innerWidth, y: Math.random()*innerHeight,
  r: Math.random()*1.1+0.3, vy: Math.random()*0.1+0.02, o: Math.random()*0.18+0.05
}));
(function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  dots.forEach(d=>{
    d.y -= d.vy;
    if(d.y < -5){ d.y = canvas.height+5; d.x = Math.random()*canvas.width; }
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(36,66,90,${d.o})`; ctx.fill();
  });
  requestAnimationFrame(loop);
})();

// ================= 核心逻辑 =================
const categories = { movie:{}, poem:{}, history:{}, novel:{}, other:{} };
const manuscript = document.getElementById('manuscript');
const submitBtn = document.getElementById('submitBtn');
const userInput = document.getElementById('userInput');
const loadingPanel = document.getElementById('loadingPanel');
const loadingStatus = document.getElementById('loadingStatus');
const loadingBarFill = document.getElementById('loadingBarFill');
const loadingTimer = document.getElementById('loadingTimer');
const compassCenterLabel = document.getElementById('compassCenterLabel');
const overlay = document.getElementById('overlay');
const listPage = document.getElementById('listPage');
const detailPage = document.getElementById('detailPage');
const listIcon = document.getElementById('listIcon');
const listTag = document.getElementById('listTag');
const listTitle = document.getElementById('listTitle');
const entryList = document.getElementById('entryList');
const detailTag = document.getElementById('detailTag');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const chatThread = document.getElementById('chatThread');
const askInput = document.getElementById('askInput');
const askBtn = document.getElementById('askBtn');

let resultData = null;
let currentCategoryKey = null;
let currentEntry = null;
let currentChatHistory = [];
let timerInterval = null;

// 后端 API 地址。同源部署时留空即可；若前后端分开部署，
// 在页面里注入 window.EMOTION_MIRROR_API_BASE = "https://your-backend.example.com" 即可覆盖。
const API_BASE = window.EMOTION_MIRROR_API_BASE || "";

/**
 * 真正的模型调用（含 prompt、准确性要求、@@CATEGORY 文本格式解析）
 * 现在全部发生在后端 backend/src/services/qwenClient.js 里。
 * 前端只需要把处境和语言传过去，拿到已经解析好的 { movie:[...], poem:[...], ... } 即可。
 */
async function generateMirrors(situation){
  const response = await fetch(`${API_BASE}/api/mirrors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ situation, language: LANG })
  });
  if(!response.ok){
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json();
}

const loadingStages = [
  {t:0, key:'loading0', pct:8},
  {t:4, key:'loading1', pct:32},
  {t:12, key:'loading2', pct:62},
  {t:28, key:'loading3', pct:88}
];

function startLoadingAnimation(){
  let elapsed = 0;
  loadingBarFill.style.width = '4%';
  loadingStatus.textContent = I18N[LANG].loading0;
  timerInterval = setInterval(() => {
    elapsed += 1;
    loadingTimer.textContent = elapsed + 's';
    const stage = [...loadingStages].reverse().find(s => elapsed >= s.t);
    if(stage){ loadingStatus.textContent = I18N[LANG][stage.key]; loadingBarFill.style.width = stage.pct + '%'; }
  }, 1000);
}
function stopLoadingAnimation(success){
  clearInterval(timerInterval);
  if(success) loadingBarFill.style.width = '100%';
}

submitBtn.addEventListener('click', async () => {
  const val = userInput.value.trim();
  if(!val){ userInput.focus(); return; }

  submitBtn.disabled = true;
  submitBtn.textContent = I18N[LANG].submitLoading;
  manuscript.classList.add('hidden');
  loadingPanel.classList.add('show');
  compassCenterLabel.innerHTML = I18N[LANG].compassLoading;
  startLoadingAnimation();

  try{
    resultData = await generateMirrors(val);
    stopLoadingAnimation(true);
    setTimeout(() => {
      loadingPanel.classList.remove('show');
      document.querySelectorAll('.compass-point').forEach(el => {
        el.classList.add('active');
        const key = el.dataset.key;
        document.getElementById('count-' + key).textContent = resultData[key].length;
      });
      compassCenterLabel.innerHTML = I18N[LANG].compassActive;
    }, 500);
  }catch(e){
    stopLoadingAnimation(false);
    loadingPanel.classList.remove('show');
    submitBtn.disabled = false;
    submitBtn.textContent = I18N[LANG].submitIdle;
    manuscript.classList.remove('hidden');
    compassCenterLabel.innerHTML = I18N[LANG].compassIdle;
    alert(I18N[LANG].errorMsg);
    console.error(e);
  }
});

document.querySelectorAll('.compass-point').forEach(item => {
  item.addEventListener('click', () => {
    if(!resultData) return;
    const key = item.dataset.key;
    openList(key, item.querySelector('svg').innerHTML);
  });
});

function openList(key, iconHtml){
  currentCategoryKey = key;
  const dict = I18N[LANG];
  const catLabels = { movie: dict.catMovieEn, poem: dict.catPoemEn, history: dict.catHistoryEn, novel: dict.catNovelEn, other: dict.catOtherEn };
  listIcon.innerHTML = iconHtml;
  listTag.textContent = catLabels[key];
  listTitle.textContent = { movie:dict.catMovieCn, poem:dict.catPoemCn, history:dict.catHistoryCn, novel:dict.catNovelCn, other:dict.catOtherCn }[key];
  entryList.innerHTML = '';
  resultData[key].forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'entry-item';
    div.innerHTML = `<div class="entry-num">0${i+1}</div><div class="entry-body"><div class="entry-title">${entry.title}</div><div class="entry-teaser">${entry.teaser}</div></div>`;
    div.addEventListener('click', () => openDetail(key, i, iconHtml));
    entryList.appendChild(div);
  });
  listPage.style.display = 'block';
  detailPage.style.display = 'none';
  overlay.classList.add('show');
}

function openDetail(key, index, iconHtml){
  currentEntry = { key, index };
  currentChatHistory = [];
  const dict = I18N[LANG];
  const catLabels = { movie: dict.catMovieEn, poem: dict.catPoemEn, history: dict.catHistoryEn, novel: dict.catNovelEn, other: dict.catOtherEn };
  const entry = resultData[key][index];
  detailTag.textContent = catLabels[key];
  detailTitle.textContent = entry.title;
  detailBody.textContent = entry.detail;
  document.getElementById('verifyLink').href = 'https://www.google.com/search?q=' + encodeURIComponent(entry.title);
  chatThread.innerHTML = '';
  askInput.value = '';
  listPage.style.display = 'none';
  detailPage.style.display = 'block';
}

document.getElementById('closeListBtn').addEventListener('click', () => overlay.classList.remove('show'));
document.getElementById('closeDetailBtn').addEventListener('click', () => overlay.classList.remove('show'));
document.getElementById('backBtn').addEventListener('click', () => { listPage.style.display = 'block'; detailPage.style.display = 'none'; });
overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.classList.remove('show'); });

async function requestFollowup({ entry, question, history }){
  const response = await fetch(`${API_BASE}/api/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entry, question, history, language: LANG })
  });
  if(!response.ok){
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  const data = await response.json();
  return data.answer;
}

askBtn.addEventListener('click', async () => {
  const q = askInput.value.trim();
  if(!q || !currentEntry) return;
  const entry = resultData[currentEntry.key][currentEntry.index];

  const qDiv = document.createElement('div');
  qDiv.className = 'chat-q'; qDiv.textContent = q;
  chatThread.appendChild(qDiv);
  askInput.value = '';
  askBtn.disabled = true;
  askBtn.textContent = '···';

  try{
    const answer = await requestFollowup({
      entry: { title: entry.title, detail: entry.detail },
      question: q,
      history: currentChatHistory
    });
    const aDiv = document.createElement('div');
    aDiv.className = 'chat-a'; aDiv.textContent = answer;
    chatThread.appendChild(aDiv);
    currentChatHistory.push({q, a: answer});
    chatThread.scrollTop = chatThread.scrollHeight;
  }catch(e){
    const aDiv = document.createElement('div');
    aDiv.className = 'chat-a'; aDiv.textContent = I18N[LANG].errorMsg;
    chatThread.appendChild(aDiv);
  }
  askBtn.disabled = false;
  askBtn.textContent = I18N[LANG].askSend;
});
askInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') askBtn.click(); });
