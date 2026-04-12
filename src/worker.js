import questionsData from '../cca_questions.json';

const QUESTIONS = questionsData.questions;
const DOMAINS = questionsData.meta.domains;
const QUESTIONS_PER_DOMAIN = 3;

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectExamQuestions() {
  const byDomain = new Map();
  for (const q of QUESTIONS) {
    if (!byDomain.has(q.domain)) byDomain.set(q.domain, []);
    byDomain.get(q.domain).push(q);
  }
  const selected = [];
  for (const qs of byDomain.values()) {
    selected.push(...shuffle(qs).slice(0, QUESTIONS_PER_DOMAIN));
  }
  // Sort by domain id so questions group neatly in the UI
  selected.sort((a, b) => a.domain - b.domain);
  return selected;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── HTML ────────────────────────────────────────────────────────────────────

const TOTAL_QUESTIONS = DOMAINS.length * QUESTIONS_PER_DOMAIN;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CCA Foundations Practice Exam</title>
<style>
  :root {
    --primary: #4f46e5;
    --primary-dark: #3730a3;
    --primary-light: #eef2ff;
    --success: #059669;
    --success-light: #ecfdf5;
    --danger: #dc2626;
    --danger-light: #fef2f2;
    --warning: #d97706;
    --warning-light: #fffbeb;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-500: #6b7280;
    --gray-700: #374151;
    --gray-900: #111827;
    --radius: 12px;
    --shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--gray-50);
    color: var(--gray-900);
    min-height: 100vh;
  }

  /* ── Screens ── */
  .screen { display: none; }
  .screen.active { display: block; }

  /* ── Register ── */
  #screen-register {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 24px;
  }
  #screen-register.active { display: flex; }
  .register-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 48px 40px;
    max-width: 480px;
    width: 100%;
  }
  .register-card .logo {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--primary-light); color: var(--primary);
    font-size: 12px; font-weight: 600; padding: 4px 10px;
    border-radius: 20px; margin-bottom: 20px;
    letter-spacing: .5px; text-transform: uppercase;
  }
  .register-card h1 { font-size: 26px; font-weight: 700; line-height: 1.3; }
  .register-card .subtitle {
    color: var(--gray-500); font-size: 14px; margin-top: 8px; margin-bottom: 32px;
  }
  .register-card .meta-chips {
    display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px;
  }
  .chip {
    background: var(--gray-100); color: var(--gray-700);
    font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 500;
  }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--gray-700); }
  .form-group input {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid var(--gray-200); border-radius: 8px;
    font-size: 15px; outline: none; transition: border-color .15s;
  }
  .form-group input:focus { border-color: var(--primary); }
  .btn-primary {
    display: block; width: 100%; padding: 12px;
    background: var(--primary); color: #fff; border: none;
    border-radius: 8px; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: background .15s; margin-top: 24px;
  }
  .btn-primary:hover { background: var(--primary-dark); }
  .btn-primary:disabled { background: var(--gray-300); cursor: not-allowed; }

  /* ── Exam ── */
  #screen-exam { padding-bottom: 80px; }
  #screen-exam.active { display: block; }
  .exam-header {
    position: sticky; top: 0; z-index: 100;
    background: #fff; border-bottom: 1px solid var(--gray-200);
    padding: 12px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .exam-header .title { font-weight: 700; font-size: 15px; color: var(--primary); }
  .exam-header .timer {
    font-size: 22px; font-weight: 700; letter-spacing: 1px;
    color: var(--gray-700); font-variant-numeric: tabular-nums;
  }
  .exam-header .timer.warn { color: var(--warning); }
  .progress-wrap { flex: 1; min-width: 80px; }
  .progress-bar { height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--primary); border-radius: 3px; transition: width .3s; }
  .progress-label { font-size: 11px; color: var(--gray-500); margin-top: 3px; text-align: right; }

  .exam-body { max-width: 780px; margin: 0 auto; padding: 24px 16px; }

  .domain-section { margin-bottom: 32px; }
  .domain-header {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; margin-bottom: 16px;
    border-bottom: 2px solid var(--primary-light);
  }
  .domain-num {
    background: var(--primary); color: #fff;
    font-size: 11px; font-weight: 700;
    padding: 2px 8px; border-radius: 4px;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .domain-name { font-size: 15px; font-weight: 700; color: var(--primary-dark); }
  .domain-score-badge { margin-left: auto; font-size: 12px; color: var(--gray-500); }

  .question-card {
    background: #fff; border-radius: var(--radius);
    box-shadow: var(--shadow); margin-bottom: 16px;
    border: 1.5px solid var(--gray-200); overflow: hidden;
    transition: border-color .2s;
  }
  .question-card.answered { border-color: var(--primary-light); }
  .question-card-head {
    padding: 12px 16px 0;
    display: flex; align-items: center; gap: 8px;
  }
  .q-num { font-size: 12px; font-weight: 700; color: var(--primary); }
  .q-scenario {
    font-size: 11px; color: var(--gray-500);
    background: var(--gray-100); padding: 2px 8px; border-radius: 10px;
  }
  .question-text { padding: 12px 16px 14px; font-size: 14px; line-height: 1.65; }

  .options { padding: 0 12px 14px; display: flex; flex-direction: column; gap: 8px; }
  .option {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px; border-radius: 8px; cursor: pointer;
    border: 1.5px solid var(--gray-200); transition: all .15s;
    font-size: 13.5px; line-height: 1.5; user-select: none;
  }
  .option:hover { border-color: var(--primary); background: var(--primary-light); }
  .option.selected { border-color: var(--primary); background: var(--primary-light); }
  .option .key {
    flex-shrink: 0; width: 24px; height: 24px;
    border-radius: 50%; border: 1.5px solid currentColor;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: var(--gray-500);
    margin-top: 1px;
  }
  .option.selected .key { border-color: var(--primary); color: var(--primary); background: #fff; }

  /* ── Submit bar ── */
  .submit-bar {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #fff; border-top: 1px solid var(--gray-200);
    padding: 12px 20px; z-index: 100;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    max-width: 100%;
  }
  .submit-bar .answered-count { font-size: 13px; color: var(--gray-500); }
  .btn-submit {
    padding: 10px 28px; background: var(--primary); color: #fff; border: none;
    border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background .15s;
  }
  .btn-submit:hover { background: var(--primary-dark); }
  .btn-submit.ready { background: var(--success); }
  .btn-submit.ready:hover { background: #047857; }

  /* ── Results ── */
  #screen-results { max-width: 780px; margin: 0 auto; padding: 32px 16px 60px; }
  #screen-results.active { display: block; }
  .result-hero {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 36px 32px; text-align: center; margin-bottom: 24px;
  }
  .result-badge {
    display: inline-block; padding: 6px 16px; border-radius: 20px;
    font-size: 13px; font-weight: 700; margin-bottom: 16px;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .result-badge.pass { background: var(--success-light); color: var(--success); }
  .result-badge.fail { background: var(--danger-light); color: var(--danger); }
  .result-score { font-size: 64px; font-weight: 800; color: var(--gray-900); line-height: 1; }
  .result-score span { font-size: 28px; font-weight: 500; color: var(--gray-500); }
  .result-percent { font-size: 22px; font-weight: 600; color: var(--primary); margin-top: 4px; }
  .result-meta {
    display: flex; justify-content: center; gap: 32px; margin-top: 20px;
    flex-wrap: wrap;
  }
  .result-meta-item { text-align: center; }
  .result-meta-item .val { font-size: 18px; font-weight: 700; color: var(--gray-800); }
  .result-meta-item .lbl { font-size: 12px; color: var(--gray-500); margin-top: 2px; }

  .breakdown-card {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 24px 28px; margin-bottom: 24px;
  }
  .breakdown-card h2 { font-size: 16px; font-weight: 700; margin-bottom: 18px; }
  .breakdown-row { margin-bottom: 14px; }
  .breakdown-row-head {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 5px;
  }
  .breakdown-name { font-size: 13px; font-weight: 600; color: var(--gray-700); }
  .breakdown-frac { font-size: 13px; font-weight: 700; }
  .breakdown-bar { height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
  .breakdown-fill { height: 100%; border-radius: 4px; }
  .fill-full { background: var(--success); }
  .fill-partial { background: var(--primary); }
  .fill-poor { background: var(--danger); }

  .review-section { }
  .review-section h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
  .review-card {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    margin-bottom: 14px; overflow: hidden;
    border-left: 4px solid var(--gray-200);
  }
  .review-card.correct { border-left-color: var(--success); }
  .review-card.wrong { border-left-color: var(--danger); }
  .review-head {
    padding: 12px 16px; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
  }
  .review-status { font-size: 18px; flex-shrink: 0; }
  .review-qtext { font-size: 13px; line-height: 1.5; flex: 1; color: var(--gray-700); }
  .review-toggle { font-size: 18px; color: var(--gray-300); transition: transform .2s; }
  .review-card.open .review-toggle { transform: rotate(180deg); }
  .review-body { display: none; padding: 0 16px 16px; }
  .review-card.open .review-body { display: block; }
  .review-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .review-opt {
    padding: 8px 12px; border-radius: 6px; font-size: 12.5px;
    border: 1px solid var(--gray-200);
  }
  .review-opt.correct-answer { background: var(--success-light); border-color: var(--success); font-weight: 600; }
  .review-opt.wrong-answer { background: var(--danger-light); border-color: var(--danger); }
  .review-explanation {
    background: var(--gray-50); border-radius: 6px; padding: 10px 12px;
    font-size: 12.5px; color: var(--gray-700); line-height: 1.6; border: 1px solid var(--gray-200);
  }
  .review-explanation strong { color: var(--gray-900); }

  .btn-restart {
    display: block; width: 100%; max-width: 320px; margin: 32px auto 0;
    padding: 12px; background: var(--primary); color: #fff; border: none;
    border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;
    transition: background .15s; text-align: center;
  }
  .btn-restart:hover { background: var(--primary-dark); }

  /* ── Loading/error ── */
  .spinner {
    width: 40px; height: 40px; border: 3px solid var(--gray-200);
    border-top-color: var(--primary); border-radius: 50%;
    animation: spin .8s linear infinite; margin: 60px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg {
    background: var(--danger-light); color: var(--danger); padding: 12px 16px;
    border-radius: 8px; font-size: 14px; margin: 16px 0;
  }

  @media (max-width: 600px) {
    .register-card { padding: 32px 20px; }
    .result-score { font-size: 48px; }
    .exam-header .title { display: none; }
  }
</style>
</head>
<body>

<!-- ── Screen 1: Register ── -->
<div id="screen-register" class="screen active">
  <div class="register-card">
    <div class="logo">CCA Certified</div>
    <h1>Foundations Practice Exam</h1>
    <p class="subtitle">Claude Certified Architect — practice test</p>
    <div class="meta-chips">
      <span class="chip">15 questions</span>
      <span class="chip">3 per domain</span>
      <span class="chip">5 domains</span>
      <span class="chip">No time limit</span>
    </div>
    <div id="register-error" class="error-msg" style="display:none"></div>
    <form id="register-form">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" name="name" placeholder="Jane Smith" required autocomplete="name">
      </div>
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" placeholder="jane@example.com" required autocomplete="email">
      </div>
      <button type="submit" class="btn-primary" id="start-btn">Start Exam →</button>
    </form>
  </div>
</div>

<!-- ── Screen 2: Exam ── -->
<div id="screen-exam" class="screen">
  <header class="exam-header">
    <div class="title">CCA Foundations</div>
    <div id="timer" class="timer">00:00</div>
    <div class="progress-wrap">
      <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
      <div class="progress-label" id="progress-label">0 / ${TOTAL_QUESTIONS} answered</div>
    </div>
  </header>
  <div class="exam-body" id="questions-container"></div>
  <div class="submit-bar">
    <div class="answered-count" id="submit-count">Select all answers to submit</div>
    <button class="btn-submit" id="submit-btn" onclick="submitExam()">Submit Exam</button>
  </div>
</div>

<!-- ── Screen 3: Results ── -->
<div id="screen-results" class="screen"></div>

<script>
let examToken = null;
let examQuestions = [];
let examAnswers = {};
let startTime = null;
let timerInterval = null;
let candidateName = '';
let candidateEmail = '';

// ── Navigation ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Registration ──
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  candidateName = document.getElementById('name').value.trim();
  candidateEmail = document.getElementById('email').value.trim();
  const btn = document.getElementById('start-btn');
  const errEl = document.getElementById('register-error');
  btn.disabled = true;
  btn.textContent = 'Loading exam…';
  errEl.style.display = 'none';
  try {
    await loadExam();
  } catch (err) {
    errEl.textContent = err.message || 'Failed to load exam. Please try again.';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Start Exam →';
  }
});

// ── Load Exam ──
async function loadExam() {
  const res = await fetch('/api/questions');
  if (!res.ok) throw new Error('Could not fetch questions (' + res.status + ')');
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  examToken = data.token;
  examQuestions = data.questions;
  examAnswers = {};

  renderQuestions(examQuestions);
  showScreen('screen-exam');
  startTime = Date.now();
  startTimer();
}

// ── Render Questions ──
function renderQuestions(questions) {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  // Group by domain
  const domainMap = new Map();
  questions.forEach((q, idx) => {
    if (!domainMap.has(q.domain)) domainMap.set(q.domain, []);
    domainMap.get(q.domain).push({ q, idx });
  });

  let overallNum = 0;
  for (const [domainId, items] of domainMap) {
    overallNum++;
    const section = document.createElement('div');
    section.className = 'domain-section';
    section.innerHTML = \`
      <div class="domain-header">
        <span class="domain-num">Domain \${domainId}</span>
        <span class="domain-name">\${escapeHtml(items[0].q.domain_name)}</span>
      </div>
    \`;

    items.forEach(({ q, idx }) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.id = 'qcard-' + q.id;

      const optionsHtml = Object.entries(q.options).map(([key, text]) =>
        \`<div class="option" id="opt-\${q.id}-\${key}" onclick="selectAnswer(\${q.id}, '\${key}')">
          <span class="key">\${key}</span>
          <span>\${escapeHtml(text)}</span>
        </div>\`
      ).join('');

      card.innerHTML = \`
        <div class="question-card-head">
          <span class="q-num">Q\${idx + 1}</span>
          \${q.scenario ? \`<span class="q-scenario">\${escapeHtml(q.scenario)}</span>\` : ''}
        </div>
        <div class="question-text">\${escapeHtml(q.question)}</div>
        <div class="options">\${optionsHtml}</div>
      \`;
      section.appendChild(card);
    });

    container.appendChild(section);
  }
}

// ── Answer selection ──
function selectAnswer(qid, choice) {
  examAnswers[String(qid)] = choice;

  // Update UI
  document.querySelectorAll(\`[id^="opt-\${qid}-"]\`).forEach(el => el.classList.remove('selected'));
  const chosen = document.getElementById(\`opt-\${qid}-\${choice}\`);
  if (chosen) chosen.classList.add('selected');

  const card = document.getElementById('qcard-' + qid);
  if (card) card.classList.add('answered');

  updateProgress();
}

function updateProgress() {
  const answered = Object.keys(examAnswers).length;
  const total = examQuestions.length;
  const pct = Math.round((answered / total) * 100);

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = answered + ' / ' + total + ' answered';

  const submitBtn = document.getElementById('submit-btn');
  const submitCount = document.getElementById('submit-count');

  if (answered === total) {
    submitBtn.classList.add('ready');
    submitCount.textContent = 'All questions answered — ready to submit!';
  } else {
    submitBtn.classList.remove('ready');
    submitCount.textContent = (total - answered) + ' question' + (total - answered !== 1 ? 's' : '') + ' remaining';
  }
}

// ── Timer ──
function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const el = document.getElementById('timer');
    el.textContent = formatTime(elapsed);
  }, 1000);
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return m + ':' + sec;
}

// ── Submit ──
async function submitExam() {
  const answered = Object.keys(examAnswers).length;
  const total = examQuestions.length;

  if (answered < total) {
    const unanswered = total - answered;
    if (!confirm(\`You have \${unanswered} unanswered question\${unanswered !== 1 ? 's' : ''}. Submit anyway?\`)) return;
  }

  clearInterval(timerInterval);
  const endTime = Date.now();

  document.getElementById('submit-btn').disabled = true;
  document.getElementById('submit-btn').textContent = 'Submitting…';

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: examToken,
        answers: examAnswers,
        name: candidateName,
        email: candidateEmail,
        startTime,
        endTime,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Submission failed');
    showResults(data.result);
  } catch (err) {
    alert('Submission failed: ' + err.message);
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('submit-btn').textContent = 'Submit Exam';
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById('timer').textContent = formatTime(elapsed);
    }, 1000);
  }
}

// ── Results ──
function showResults(result) {
  showScreen('screen-results');
  window.scrollTo(0, 0);

  const passScore = 720;
  const pass = result.scaledScore >= passScore;
  const container = document.getElementById('screen-results');

  // Domain breakdown HTML
  const breakdownRows = Object.entries(result.domainBreakdown).map(([name, b]) => {
    const pct = Math.round((b.correct / b.total) * 100);
    const fillClass = pct === 100 ? 'fill-full' : pct >= 67 ? 'fill-partial' : 'fill-poor';
    return \`
      <div class="breakdown-row">
        <div class="breakdown-row-head">
          <span class="breakdown-name">\${escapeHtml(name)}</span>
          <span class="breakdown-frac" style="color:\${pct===100?'var(--success)':pct>=67?'var(--primary)':'var(--danger)'}">\${b.correct}/\${b.total}</span>
        </div>
        <div class="breakdown-bar">
          <div class="breakdown-fill \${fillClass}" style="width:\${pct}%"></div>
        </div>
      </div>
    \`;
  }).join('');

  // Question review HTML
  const reviewCards = result.questionResults.map((qr, i) => {
    const correctClass = qr.isCorrect ? 'correct' : 'wrong';
    const statusIcon = qr.isCorrect ? '✅' : '❌';
    const optionsHtml = Object.entries(qr.options || {}).map(([key, text]) => {
      let cls = 'review-opt';
      if (key === qr.correct) cls += ' correct-answer';
      else if (key === qr.given && !qr.isCorrect) cls += ' wrong-answer';
      const marker = key === qr.correct ? ' ✓ Correct' : (key === qr.given && !qr.isCorrect ? ' ✗ Your answer' : '');
      return \`<div class="\${cls}"><strong>\${key}.</strong> \${escapeHtml(text)}\${marker}</div>\`;
    }).join('');
    return \`
      <div class="review-card \${correctClass}" id="rev-\${i}">
        <div class="review-head" onclick="toggleReview(\${i})">
          <span class="review-status">\${statusIcon}</span>
          <span class="review-qtext">\${escapeHtml(qr.question)}</span>
          <span class="review-toggle">▼</span>
        </div>
        <div class="review-body">
          <div class="review-options">\${optionsHtml}</div>
          \${qr.explanation ? \`<div class="review-explanation"><strong>Explanation:</strong> \${escapeHtml(qr.explanation)}</div>\` : ''}
        </div>
      </div>
    \`;
  }).join('');

  container.innerHTML = \`
    <div class="result-hero">
      <div class="result-badge \${pass ? 'pass' : 'fail'}">\${pass ? '✓ Likely Pass' : '✗ Needs Review'}</div>
      <div class="result-score">\${result.score}<span>/\${result.total}</span></div>
      <div class="result-percent">\${result.percentage}% — Scaled: \${result.scaledScore}/1000</div>
      <div class="result-meta">
        <div class="result-meta-item"><div class="val">\${formatTime(result.timeTaken)}</div><div class="lbl">Time taken</div></div>
        <div class="result-meta-item"><div class="val">\${result.scaledScore}/1000</div><div class="lbl">Scaled score</div></div>
        <div class="result-meta-item"><div class="val">\${passScore}</div><div class="lbl">Pass threshold</div></div>
      </div>
    </div>

    <div class="breakdown-card">
      <h2>Score by Domain</h2>
      \${breakdownRows}
    </div>

    <div class="review-section">
      <h2>Question Review</h2>
      \${reviewCards}
    </div>

    <button class="btn-restart" onclick="restartExam()">Take Another Exam</button>
  \`;
}

function toggleReview(i) {
  const card = document.getElementById('rev-' + i);
  card.classList.toggle('open');
}

function restartExam() {
  examToken = null; examQuestions = []; examAnswers = {};
  startTime = null; clearInterval(timerInterval);
  document.getElementById('register-form').reset();
  showScreen('screen-register');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
</script>
</body>
</html>`;

// ─── Email HTML ───────────────────────────────────────────────────────────────

function generateEmailHTML(result) {
  const pass = result.scaledScore >= 720;
  const passColor = pass ? '#059669' : '#dc2626';
  const passLabel = pass ? 'Likely Pass' : 'Needs Review';

  const breakdownRows = Object.entries(result.domainBreakdown).map(([name, b]) => {
    const pct = Math.round((b.correct / b.total) * 100);
    const color = pct === 100 ? '#059669' : pct >= 67 ? '#4f46e5' : '#dc2626';
    return `<tr>
      <td style="padding:6px 12px;font-size:13px;color:#374151;">${name}</td>
      <td style="padding:6px 12px;font-size:13px;font-weight:700;color:${color};text-align:right;">${b.correct}/${b.total}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
    <div style="background:#4f46e5;padding:28px 32px;">
      <div style="color:#c7d2fe;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">CCA Foundations Practice Exam</div>
      <div style="color:#ffffff;font-size:22px;font-weight:700;">New Exam Result</div>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;width:140px;">Candidate</td>
          <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${result.name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;">Email</td>
          <td style="padding:8px 0;font-size:14px;color:#4f46e5;"><a href="mailto:${result.email}" style="color:#4f46e5;text-decoration:none;">${result.email}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;">Score</td>
          <td style="padding:8px 0;font-size:14px;font-weight:700;color:#111827;">${result.score}/${result.total} (${result.percentage}%) — Scaled: ${result.scaledScore}/1000</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;">Result</td>
          <td style="padding:8px 0;"><span style="background:${pass ? '#ecfdf5' : '#fef2f2'};color:${passColor};font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">${passLabel}</span></td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;">Time taken</td>
          <td style="padding:8px 0;font-size:14px;color:#111827;">${formatTime(result.timeTaken)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;">Submitted</td>
          <td style="padding:8px 0;font-size:14px;color:#111827;">${new Date(result.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
        </tr>
      </table>

      <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <div style="background:#f3f4f6;padding:8px 12px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.4px;">Domain Breakdown</div>
        <table style="width:100%;border-collapse:collapse;">
          ${breakdownRows}
        </table>
      </div>
    </div>
    <div style="padding:16px 32px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center;">
      CCA Foundations Practice Exam · Sent automatically on exam completion
    </div>
  </div>
</body>
</html>`;
}

// ─── API Handlers ────────────────────────────────────────────────────────────

async function handleGetQuestions(env) {
  const selected = selectExamQuestions();
  const token = crypto.randomUUID();

  const sessionData = {
    questionIds: selected.map(q => q.id),
    correctAnswers: Object.fromEntries(selected.map(q => [String(q.id), q.correct_answer])),
    domainNames: Object.fromEntries(selected.map(q => [String(q.id), q.domain_name])),
    explanations: Object.fromEntries(selected.map(q => [String(q.id), q.explanation || ''])),
    createdAt: Date.now(),
  };

  if (!env.EXAM_KV) {
    return json({ error: 'KV namespace EXAM_KV is not configured.' }, 500);
  }

  await env.EXAM_KV.put(`session:${token}`, JSON.stringify(sessionData), { expirationTtl: 7200 });

  // Return questions without correct answers
  const clientQuestions = selected.map(q => ({
    id: q.id,
    domain: q.domain,
    domain_name: q.domain_name,
    scenario: q.scenario || '',
    question: q.question,
    options: q.options,
  }));

  return json({ token, questions: clientQuestions });
}

async function handleSubmit(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { token, answers, name, email, startTime, endTime } = body;

  if (!token || !name || !email || !answers || typeof startTime !== 'number') {
    return json({ error: 'Missing required fields: token, name, email, answers, startTime' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email address' }, 400);
  }

  if (!env.EXAM_KV) {
    return json({ error: 'KV namespace EXAM_KV is not configured.' }, 500);
  }

  const sessionData = await env.EXAM_KV.get(`session:${token}`, 'json');
  if (!sessionData) {
    return json({ error: 'Session not found or expired. Please restart the exam.' }, 400);
  }

  const { questionIds, correctAnswers, domainNames, explanations } = sessionData;

  let score = 0;
  const domainBreakdown = {};
  const questionResults = [];

  for (const qId of questionIds) {
    const key = String(qId);
    const correctAnswer = correctAnswers[key];
    const givenAnswer = answers[key] || null;
    const isCorrect = givenAnswer === correctAnswer;

    if (isCorrect) score++;

    const domainName = domainNames[key];
    if (!domainBreakdown[domainName]) {
      domainBreakdown[domainName] = { correct: 0, total: 0 };
    }
    domainBreakdown[domainName].total++;
    if (isCorrect) domainBreakdown[domainName].correct++;

    // Pull full question data for the review panel
    const qData = QUESTIONS.find(q => q.id === qId);

    questionResults.push({
      id: qId,
      domain_name: domainName,
      question: qData?.question || '',
      options: qData?.options || {},
      given: givenAnswer,
      correct: correctAnswer,
      isCorrect,
      explanation: explanations[key] || qData?.explanation || '',
    });
  }

  const total = questionIds.length;
  const safeEndTime = typeof endTime === 'number' ? endTime : Date.now();
  const timeTaken = Math.max(0, Math.round((safeEndTime - startTime) / 1000));
  const percentage = Math.round((score / total) * 100);
  const scaledScore = Math.round((score / total) * 1000);

  const result = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    score, total, percentage, scaledScore,
    timeTaken, domainBreakdown, questionResults,
    submittedAt: new Date().toISOString(),
  };

  // Persist result (90-day TTL)
  await env.EXAM_KV.put(`result:${token}`, JSON.stringify(result), { expirationTtl: 86400 * 90 });
  // Delete the session to prevent re-submission
  await env.EXAM_KV.delete(`session:${token}`);

  // Send email to admin via ctx.waitUntil so it completes after the response is sent
  if (env.RESEND_API_KEY && env.ADMIN_EMAIL) {
    ctx.waitUntil(
      sendAdminEmail(env, result).catch(err => console.error('[email] send failed:', err))
    );
  }

  return json({ success: true, result });
}

async function sendAdminEmail(env, result) {
  const from = env.EMAIL_FROM || 'CCA Exam <onboarding@resend.dev>';
  const subject = `[CCA Exam] ${result.name} — ${result.score}/${result.total} (${result.percentage}%) · ${result.scaledScore >= 720 ? 'PASS' : 'FAIL'}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [env.ADMIN_EMAIL],
      subject,
      html: generateEmailHTML(result),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API ${res.status}: ${text}`);
  }
}

// ─── Admin Results Page ───────────────────────────────────────────────────────

async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  // List all result keys
  const list = await env.EXAM_KV.list({ prefix: 'result:' });
  const results = await Promise.all(
    list.keys.map(async ({ name }) => env.EXAM_KV.get(name, 'json'))
  );
  const valid = results.filter(Boolean).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const rows = valid.map(r => {
    const pass = r.scaledScore >= 720;
    return `<tr>
      <td>${new Date(r.submittedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
      <td>${escHtml(r.name)}</td>
      <td>${escHtml(r.email)}</td>
      <td style="font-weight:700;">${r.score}/${r.total}</td>
      <td>${r.percentage}%</td>
      <td>${r.scaledScore}/1000</td>
      <td><span style="color:${pass ? '#059669' : '#dc2626'};font-weight:700;">${pass ? 'PASS' : 'FAIL'}</span></td>
      <td>${formatTime(r.timeTaken)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>CCA Exam Results</title>
<style>
  body{font-family:system-ui,sans-serif;background:#f9fafb;padding:32px}
  h1{color:#4f46e5;margin-bottom:8px}
  .count{color:#6b7280;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  th{background:#4f46e5;color:#fff;padding:10px 14px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  td{padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#f9fafb}
</style></head>
<body>
  <h1>CCA Exam Results</h1>
  <p class="count">${valid.length} submission${valid.length !== 1 ? 's' : ''}</p>
  <table>
    <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Score</th><th>%</th><th>Scaled</th><th>Result</th><th>Time</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#9ca3af;padding:40px">No results yet</td></tr>'}</tbody>
  </table>
</body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      if (url.pathname === '/') {
        return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      if (url.pathname === '/api/questions' && request.method === 'GET') {
        return handleGetQuestions(env);
      }
      if (url.pathname === '/api/submit' && request.method === 'POST') {
        return handleSubmit(request, env, ctx);
      }
      if (url.pathname === '/admin') {
        return handleAdmin(request, env);
      }
      return new Response('Not Found', { status: 404 });
    } catch (err) {
      console.error('[worker]', err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
