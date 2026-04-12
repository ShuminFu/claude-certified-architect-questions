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

const DOMAIN_LIST_HTML = DOMAINS.map(d => `
  <div class="di">
    <span class="di-num">D${d.id}</span>
    <span class="di-name">${d.name}</span>
    <span class="di-tag">${QUESTIONS_PER_DOMAIN}Q · ${d.weight_pct}%</span>
  </div>`).join('');

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
    --primary-mid: #6366f1;
    --success: #059669;
    --success-light: #ecfdf5;
    --danger: #dc2626;
    --danger-light: #fef2f2;
    --warning: #d97706;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-700: #374151;
    --gray-900: #111827;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
    --shadow: 0 4px 6px -1px rgba(0,0,0,.07),0 2px 4px -1px rgba(0,0,0,.04);
    --shadow-lg: 0 10px 25px -3px rgba(0,0,0,.08),0 4px 6px -2px rgba(0,0,0,.05);
    --radius: 14px;
    --radius-sm: 8px;
  }
  *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background: var(--gray-50); color: var(--gray-900); min-height: 100vh; }

  /* ── Screen transitions ── */
  .screen { display: none; }
  .screen.active { display: block; animation: fadeUp .3s ease both; }
  #screen-register.active { display: flex; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─────────────────────────────────────────────
     SCREEN 1 — REGISTER
  ───────────────────────────────────────────── */
  #screen-register {
    min-height: 100vh;
    align-items: stretch;
  }
  .reg-left {
    background: linear-gradient(160deg,#312e81 0%,#4f46e5 50%,#7c3aed 100%);
    color: #fff;
    padding: 48px 40px;
    width: 420px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .reg-brand {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.15); backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,.2);
    padding: 5px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase;
    margin-bottom: 28px; width: fit-content;
  }
  .reg-left h1 { font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
  .reg-left p  { font-size: 14px; color: rgba(255,255,255,.75); margin-bottom: 32px; line-height: 1.6; }
  .exam-stats  { display: flex; gap: 24px; margin-bottom: 36px; }
  .stat { text-align: center; }
  .stat-val { display: block; font-size: 28px; font-weight: 800; }
  .stat-lbl { display: block; font-size: 11px; color: rgba(255,255,255,.65); text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
  .domain-list { display: flex; flex-direction: column; gap: 8px; }
  .di {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
    border-radius: var(--radius-sm); padding: 9px 12px;
    transition: background .15s;
  }
  .di:hover { background: rgba(255,255,255,.14); }
  .di-num { font-size: 10px; font-weight: 700; background: rgba(255,255,255,.2); padding: 2px 7px; border-radius: 4px; flex-shrink: 0; letter-spacing: .4px; }
  .di-name { font-size: 12.5px; flex: 1; }
  .di-tag { font-size: 10px; color: rgba(255,255,255,.55); flex-shrink: 0; font-weight: 600; }

  .reg-right {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 24px;
    background: var(--gray-50);
  }
  .reg-card {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow-lg);
    padding: 40px 36px; width: 100%; max-width: 400px;
  }
  .reg-card h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .reg-card > p { font-size: 14px; color: var(--gray-500); margin-bottom: 28px; }
  .form-group { margin-bottom: 18px; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
  .form-group input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
    font-size: 15px; outline: none; transition: border-color .15s, box-shadow .15s;
  }
  .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
  .btn-start {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px;
    background: linear-gradient(135deg,var(--primary),var(--primary-mid));
    color: #fff; border: none; border-radius: var(--radius-sm);
    font-size: 15px; font-weight: 700; cursor: pointer;
    transition: opacity .15s, transform .1s; margin-top: 8px;
    box-shadow: 0 4px 14px rgba(79,70,229,.35);
  }
  .btn-start:hover { opacity: .92; transform: translateY(-1px); }
  .btn-start:active { transform: translateY(0); }
  .btn-start:disabled { background: var(--gray-300); box-shadow: none; cursor: not-allowed; transform: none; }
  .btn-arrow { font-size: 18px; transition: transform .2s; }
  .btn-start:hover .btn-arrow { transform: translateX(3px); }
  .reg-note { font-size: 12px; color: var(--gray-400); text-align: center; margin-top: 16px; }
  .error-msg { background: var(--danger-light); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; }

  /* ─────────────────────────────────────────────
     SCREEN 2 — EXAM
  ───────────────────────────────────────────── */
  #screen-exam { padding-bottom: 80px; }
  .exam-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,.95); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }
  .exam-header-inner {
    max-width: 820px; margin: 0 auto;
    padding: 10px 16px;
    display: flex; align-items: center; gap: 16px;
  }
  .eh-title { font-weight: 700; font-size: 14px; color: var(--primary); white-space: nowrap; }
  .eh-timer {
    font-size: 20px; font-weight: 800; letter-spacing: 1.5px;
    color: var(--gray-700); font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .eh-progress { flex: 1; min-width: 60px; }
  .progress-bar { height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg,var(--primary),var(--primary-mid)); border-radius: 3px; transition: width .4s ease; }
  .progress-label { font-size: 11px; color: var(--gray-500); margin-top: 4px; text-align: right; }

  .exam-body { max-width: 820px; margin: 0 auto; padding: 24px 16px; }

  .domain-section { margin-bottom: 28px; }
  .domain-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px; padding-bottom: 10px;
    border-bottom: 2px solid var(--primary-light);
  }
  .ds-badge { background: var(--primary); color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px; text-transform: uppercase; letter-spacing: .5px; }
  .ds-name  { font-size: 14px; font-weight: 700; color: var(--primary-dark); flex: 1; }
  .ds-progress {
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
    background: var(--gray-100); color: var(--gray-500); transition: all .2s;
  }
  .ds-progress.complete { background: var(--success-light); color: var(--success); }

  .question-card {
    background: #fff; border-radius: var(--radius); border: 1.5px solid var(--gray-200);
    box-shadow: var(--shadow-sm); margin-bottom: 12px; overflow: hidden;
    transition: border-color .2s, box-shadow .2s;
  }
  .question-card.answered { border-color: #c7d2fe; box-shadow: 0 0 0 3px rgba(79,70,229,.06); }
  .qcard-head {
    padding: 12px 16px 0;
    display: flex; align-items: center; gap: 8px;
  }
  .q-num { font-size: 11px; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 2px 8px; border-radius: 4px; }
  .q-scenario { font-size: 11px; color: var(--gray-400); background: var(--gray-100); padding: 2px 8px; border-radius: 4px; }
  .question-text { padding: 11px 16px 14px; font-size: 14px; line-height: 1.7; color: var(--gray-900); }

  .options { padding: 0 12px 14px; display: flex; flex-direction: column; gap: 7px; }
  .option {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 10px 14px; border-radius: 9px; cursor: pointer;
    border: 1.5px solid var(--gray-200); transition: all .15s ease;
    font-size: 13.5px; line-height: 1.55; user-select: none;
  }
  .option:hover { border-color: var(--primary); background: var(--primary-light); }
  .option:hover .opt-indicator { border-color: var(--primary); }
  .option.selected { border-color: var(--primary); background: var(--primary-light); }
  .opt-indicator {
    width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
    border: 2px solid var(--gray-300);
    display: flex; align-items: center; justify-content: center;
    transition: all .15s ease;
  }
  .option.selected .opt-indicator { border-color: var(--primary); background: var(--primary); }
  .opt-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; opacity: 0; transform: scale(0); transition: all .15s ease; }
  .option.selected .opt-dot { opacity: 1; transform: scale(1); }
  .opt-key { font-weight: 700; color: var(--gray-500); font-size: 12px; flex-shrink: 0; width: 16px; margin-top: 1px; }
  .option.selected .opt-key { color: var(--primary); }

  /* ── Submit bar ── */
  .submit-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,255,255,.97); backdrop-filter: blur(8px);
    border-top: 1px solid var(--gray-200); box-shadow: 0 -4px 16px rgba(0,0,0,.06);
    padding: 12px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .sb-info { font-size: 13px; color: var(--gray-500); }
  .btn-submit {
    padding: 11px 28px; background: var(--primary); color: #fff; border: none;
    border-radius: var(--radius-sm); font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all .15s; box-shadow: 0 3px 10px rgba(79,70,229,.3);
  }
  .btn-submit:hover { background: var(--primary-dark); transform: translateY(-1px); }
  .btn-submit.ready { background: var(--success); box-shadow: 0 3px 10px rgba(5,150,105,.3); }
  .btn-submit.ready:hover { background: #047857; }
  .btn-submit:disabled { background: var(--gray-300); box-shadow: none; cursor: not-allowed; transform: none; }

  /* ─────────────────────────────────────────────
     SCREEN 3 — RESULTS
  ───────────────────────────────────────────── */
  #screen-results { max-width: 820px; margin: 0 auto; padding: 36px 16px 80px; }

  .result-hero {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow-lg);
    padding: 40px 32px 32px; text-align: center; margin-bottom: 20px;
    animation: fadeUp .4s ease both;
  }
  .result-ring-wrap { position: relative; display: inline-block; margin-bottom: 20px; }
  .score-ring-svg { width: 160px; height: 160px; transform: rotate(-90deg); }
  .ring-bg   { fill: none; stroke: var(--gray-100); stroke-width: 11; }
  .ring-fill {
    fill: none; stroke: var(--primary); stroke-width: 11; stroke-linecap: round;
    stroke-dasharray: 339.3; stroke-dashoffset: 339.3;
    transition: stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1), stroke .3s;
  }
  .ring-label {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    text-align: center; pointer-events: none;
  }
  .ring-score { font-size: 32px; font-weight: 800; color: var(--gray-900); line-height: 1; }
  .ring-total { font-size: 13px; color: var(--gray-400); margin-top: 2px; }

  .result-badge {
    display: inline-block; padding: 5px 16px; border-radius: 20px;
    font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .result-badge.pass { background: var(--success-light); color: var(--success); }
  .result-badge.fail { background: var(--danger-light); color: var(--danger); }
  .result-scaled { font-size: 15px; color: var(--gray-500); margin-bottom: 20px; }
  .result-scaled strong { color: var(--gray-900); }

  .result-meta { display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; }
  .rm-item { text-align: center; }
  .rm-val { font-size: 20px; font-weight: 800; color: var(--gray-900); }
  .rm-lbl { font-size: 11px; color: var(--gray-400); text-transform: uppercase; letter-spacing: .4px; margin-top: 2px; }

  .breakdown-card {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 24px 28px; margin-bottom: 20px;
    animation: fadeUp .4s .1s ease both;
  }
  .breakdown-card h2 { font-size: 15px; font-weight: 700; margin-bottom: 20px; color: var(--gray-700); }
  .bd-row { margin-bottom: 16px; }
  .bd-row:last-child { margin-bottom: 0; }
  .bd-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
  .bd-name { font-size: 13px; font-weight: 600; color: var(--gray-700); }
  .bd-frac { font-size: 13px; font-weight: 800; }
  .bd-bar  { height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
  .bd-fill { height: 100%; border-radius: 4px; width: 0; transition: width 1s .3s cubic-bezier(.4,0,.2,1); }
  .bd-fill.c-full    { background: linear-gradient(90deg,#059669,#10b981); }
  .bd-fill.c-partial { background: linear-gradient(90deg,var(--primary),var(--primary-mid)); }
  .bd-fill.c-poor    { background: linear-gradient(90deg,#dc2626,#ef4444); }

  .review-section { animation: fadeUp .4s .2s ease both; }
  .review-section h2 { font-size: 15px; font-weight: 700; margin-bottom: 14px; color: var(--gray-700); }
  .review-card {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow-sm);
    margin-bottom: 10px; overflow: hidden;
    border-left: 4px solid var(--gray-200);
    transition: box-shadow .2s;
  }
  .review-card:hover { box-shadow: var(--shadow); }
  .review-card.correct { border-left-color: var(--success); }
  .review-card.wrong   { border-left-color: var(--danger); }
  .review-head {
    padding: 13px 16px; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
  }
  .rv-icon  { font-size: 16px; flex-shrink: 0; }
  .rv-text  { font-size: 13px; line-height: 1.5; flex: 1; color: var(--gray-700); }
  .rv-arrow { font-size: 12px; color: var(--gray-300); transition: transform .2s; flex-shrink: 0; }
  .review-card.open .rv-arrow { transform: rotate(180deg); }
  .review-body { display: none; padding: 0 16px 16px; }
  .review-card.open .review-body { display: block; }
  .rv-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .rv-opt {
    padding: 8px 12px; border-radius: 7px; font-size: 12.5px;
    border: 1px solid var(--gray-200); color: var(--gray-700); line-height: 1.5;
  }
  .rv-opt.is-correct { background: var(--success-light); border-color: #6ee7b7; font-weight: 600; color: #065f46; }
  .rv-opt.is-wrong   { background: var(--danger-light); border-color: #fca5a5; color: #991b1b; }
  .rv-explanation {
    background: var(--gray-50); border-radius: 7px; padding: 10px 12px;
    font-size: 12.5px; color: var(--gray-700); line-height: 1.65;
    border: 1px solid var(--gray-200);
  }
  .rv-explanation strong { color: var(--gray-900); }

  .btn-restart {
    display: block; width: 100%; max-width: 300px; margin: 32px auto 0;
    padding: 13px; background: linear-gradient(135deg,var(--primary),var(--primary-mid));
    color: #fff; border: none; border-radius: var(--radius-sm);
    font-size: 15px; font-weight: 700; cursor: pointer;
    transition: opacity .15s, transform .1s;
    box-shadow: 0 4px 14px rgba(79,70,229,.3);
  }
  .btn-restart:hover { opacity: .9; transform: translateY(-1px); }

  /* ── Mobile ── */
  @media (max-width: 700px) {
    #screen-register { flex-direction: column; }
    .reg-left { width: 100%; padding: 32px 24px; }
    .reg-left h1 { font-size: 26px; }
    .domain-list { display: none; }
    .exam-stats { gap: 16px; }
    .reg-right { padding: 24px 16px; }
    .reg-card { padding: 28px 20px; }
    .eh-title { display: none; }
    .result-hero { padding: 28px 20px 24px; }
    .breakdown-card { padding: 20px 16px; }
  }
</style>
</head>
<body>

<!-- ── Screen 1: Register ── -->
<div id="screen-register" class="screen active">
  <div class="reg-left">
    <div class="reg-brand">✦ CCA Certified</div>
    <h1>Foundations<br>Practice Exam</h1>
    <p>Test your knowledge across all 5 domains of the Claude Certified Architect syllabus.</p>
    <div class="exam-stats">
      <div class="stat"><span class="stat-val">${TOTAL_QUESTIONS}</span><span class="stat-lbl">Questions</span></div>
      <div class="stat"><span class="stat-val">${DOMAINS.length}</span><span class="stat-lbl">Domains</span></div>
      <div class="stat"><span class="stat-val">${QUESTIONS_PER_DOMAIN}</span><span class="stat-lbl">Per Domain</span></div>
    </div>
    <div class="domain-list">${DOMAIN_LIST_HTML}</div>
  </div>
  <div class="reg-right">
    <div class="reg-card">
      <h2>Start your exam</h2>
      <p>Enter your details to begin</p>
      <div id="register-error" class="error-msg" style="display:none"></div>
      <form id="register-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" placeholder="Jane Smith" required autocomplete="name">
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" placeholder="jane@example.com" required autocomplete="email">
        </div>
        <button type="submit" class="btn-start" id="start-btn">
          <span>Start Exam</span>
          <span class="btn-arrow">→</span>
        </button>
      </form>
      <p class="reg-note">Your results will be sent to the exam administrator</p>
    </div>
  </div>
</div>

<!-- ── Screen 2: Exam ── -->
<div id="screen-exam" class="screen">
  <header class="exam-header">
    <div class="exam-header-inner">
      <div class="eh-title">CCA Foundations</div>
      <div class="eh-timer" id="timer">00:00</div>
      <div class="eh-progress">
        <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
        <div class="progress-label" id="progress-label">0 / ${TOTAL_QUESTIONS} answered</div>
      </div>
    </div>
  </header>
  <div class="exam-body" id="questions-container"></div>
  <div class="submit-bar">
    <div class="sb-info" id="submit-count">${TOTAL_QUESTIONS} questions remaining</div>
    <button class="btn-submit" id="submit-btn" onclick="submitExam()">Submit Exam</button>
  </div>
</div>

<!-- ── Screen 3: Results ── -->
<div id="screen-results" class="screen"></div>

<script>
let examToken = null, examQuestions = [], examAnswers = {}, startTime = null, timerInterval = null;
let candidateName = '', candidateEmail = '';

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Register ──
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  candidateName  = document.getElementById('name').value.trim();
  candidateEmail = document.getElementById('email').value.trim();
  const btn = document.getElementById('start-btn');
  const err = document.getElementById('register-error');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Loading…';
  err.style.display = 'none';
  try { await loadExam(); }
  catch (e) {
    err.textContent = e.message || 'Failed to load. Please try again.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Start Exam';
  }
});

// ── Load Exam ──
async function loadExam() {
  const res  = await fetch('/api/questions');
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Could not fetch questions');
  examToken     = data.token;
  examQuestions = data.questions;
  examAnswers   = {};
  renderQuestions(examQuestions);
  showScreen('screen-exam');
  window.scrollTo(0, 0);
  startTime = Date.now();
  startTimer();
}

// ── Render Questions ──
function renderQuestions(questions) {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';
  const domainMap = new Map();
  questions.forEach((q, idx) => {
    if (!domainMap.has(q.domain)) domainMap.set(q.domain, []);
    domainMap.get(q.domain).push({ q, idx });
  });

  for (const [domainId, items] of domainMap) {
    const sec = document.createElement('div');
    sec.className = 'domain-section';
    sec.innerHTML = \`
      <div class="domain-header">
        <span class="ds-badge">Domain \${domainId}</span>
        <span class="ds-name">\${esc(items[0].q.domain_name)}</span>
        <span class="ds-progress" id="dp-\${domainId}">0 / \${items.length}</span>
      </div>\`;

    items.forEach(({ q, idx }) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.id = 'qcard-' + q.id;
      const opts = Object.entries(q.options).map(([k, v]) => \`
        <div class="option" id="opt-\${q.id}-\${k}" onclick="selectAnswer(\${q.id},'\${k}')">
          <span class="opt-indicator"><span class="opt-dot"></span></span>
          <span class="opt-key">\${k}</span>
          <span>\${esc(v)}</span>
        </div>\`).join('');
      card.innerHTML = \`
        <div class="qcard-head">
          <span class="q-num">Q\${idx + 1}</span>
          \${q.scenario ? \`<span class="q-scenario">\${esc(q.scenario)}</span>\` : ''}
        </div>
        <div class="question-text">\${esc(q.question)}</div>
        <div class="options">\${opts}</div>\`;
      sec.appendChild(card);
    });
    container.appendChild(sec);
  }
}

// ── Answer ──
function selectAnswer(qid, choice) {
  examAnswers[String(qid)] = choice;
  document.querySelectorAll(\`[id^="opt-\${qid}-"]\`).forEach(el => el.classList.remove('selected'));
  document.getElementById(\`opt-\${qid}-\${choice}\`)?.classList.add('selected');
  document.getElementById('qcard-' + qid)?.classList.add('answered');
  updateDomainProgress(qid);
  updateProgress();
}

function updateDomainProgress(qid) {
  const q = examQuestions.find(q => q.id === parseInt(qid));
  if (!q) return;
  const domainQs = examQuestions.filter(dq => dq.domain === q.domain);
  const done = domainQs.filter(dq => examAnswers[String(dq.id)]).length;
  const el = document.getElementById('dp-' + q.domain);
  if (!el) return;
  el.textContent = done + ' / ' + domainQs.length;
  el.classList.toggle('complete', done === domainQs.length);
}

function updateProgress() {
  const answered = Object.keys(examAnswers).length;
  const total    = examQuestions.length;
  const pct = Math.round((answered / total) * 100);
  document.getElementById('progress-fill').style.width  = pct + '%';
  document.getElementById('progress-label').textContent = answered + ' / ' + total + ' answered';
  const btn = document.getElementById('submit-btn');
  const info = document.getElementById('submit-count');
  if (answered === total) {
    btn.classList.add('ready');
    info.textContent = 'All questions answered — ready!';
  } else {
    btn.classList.remove('ready');
    const rem = total - answered;
    info.textContent = rem + ' question' + (rem !== 1 ? 's' : '') + ' remaining';
  }
}

// ── Timer ──
function startTimer() {
  timerInterval = setInterval(() => {
    document.getElementById('timer').textContent = fmt(Math.floor((Date.now() - startTime) / 1000));
  }, 1000);
}
function fmt(s) {
  return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
}

// ── Submit ──
async function submitExam() {
  const answered = Object.keys(examAnswers).length;
  const total    = examQuestions.length;
  if (answered < total && !confirm(\`\${total - answered} question(s) unanswered. Submit anyway?\`)) return;
  clearInterval(timerInterval);
  const endTime = Date.now();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    const res  = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: examToken, answers: examAnswers, name: candidateName, email: candidateEmail, startTime, endTime }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Submission failed');
    showResults(data.result);
  } catch (e) {
    alert('Submission failed: ' + e.message);
    btn.disabled = false; btn.textContent = 'Submit Exam';
    startTimer();
  }
}

// ── Results ──
function showResults(result) {
  showScreen('screen-results');
  window.scrollTo(0, 0);
  const pass  = result.scaledScore >= 720;
  const color = pass ? 'var(--success)' : result.percentage >= 50 ? 'var(--primary)' : 'var(--danger)';

  const bdRows = Object.entries(result.domainBreakdown).map(([name, b]) => {
    const pct = Math.round((b.correct / b.total) * 100);
    const cls = pct === 100 ? 'c-full' : pct >= 67 ? 'c-partial' : 'c-poor';
    const fcolor = pct === 100 ? 'var(--success)' : pct >= 67 ? 'var(--primary)' : 'var(--danger)';
    return \`<div class="bd-row">
      <div class="bd-head">
        <span class="bd-name">\${esc(name)}</span>
        <span class="bd-frac" style="color:\${fcolor}">\${b.correct}/\${b.total}</span>
      </div>
      <div class="bd-bar"><div class="bd-fill \${cls}" data-pct="\${pct}"></div></div>
    </div>\`;
  }).join('');

  const rvCards = result.questionResults.map((qr, i) => {
    const opts = Object.entries(qr.options || {}).map(([k, v]) => {
      let cls = 'rv-opt';
      let marker = '';
      if (k === qr.correct) { cls += ' is-correct'; marker = ' ✓'; }
      else if (k === qr.given && !qr.isCorrect) { cls += ' is-wrong'; marker = ' ✗'; }
      return \`<div class="\${cls}"><strong>\${k}.\${marker}</strong> \${esc(v)}</div>\`;
    }).join('');
    return \`<div class="review-card \${qr.isCorrect ? 'correct' : 'wrong'}" id="rv\${i}">
      <div class="review-head" onclick="toggleRv(\${i})">
        <span class="rv-icon">\${qr.isCorrect ? '✅' : '❌'}</span>
        <span class="rv-text">\${esc(qr.question)}</span>
        <span class="rv-arrow">▼</span>
      </div>
      <div class="review-body">
        <div class="rv-options">\${opts}</div>
        \${qr.explanation ? \`<div class="rv-explanation"><strong>Explanation:</strong> \${esc(qr.explanation)}</div>\` : ''}
      </div>
    </div>\`;
  }).join('');

  document.getElementById('screen-results').innerHTML = \`
    <div class="result-hero">
      <div class="result-ring-wrap">
        <svg class="score-ring-svg" viewBox="0 0 120 120">
          <circle class="ring-bg"   cx="60" cy="60" r="54"/>
          <circle class="ring-fill" cx="60" cy="60" r="54" id="score-ring" style="stroke:\${color}"/>
        </svg>
        <div class="ring-label">
          <div class="ring-score">\${result.score}</div>
          <div class="ring-total">of \${result.total}</div>
        </div>
      </div>
      <div class="result-badge \${pass ? 'pass' : 'fail'}">\${pass ? '✓ Likely Pass' : '✗ Needs Review'}</div>
      <div class="result-scaled">Scaled score: <strong>\${result.scaledScore}</strong> / 1000 &nbsp;·&nbsp; Pass threshold: <strong>720</strong></div>
      <div class="result-meta">
        <div class="rm-item"><div class="rm-val">\${result.percentage}%</div><div class="rm-lbl">Percentage</div></div>
        <div class="rm-item"><div class="rm-val">\${fmt(result.timeTaken)}</div><div class="rm-lbl">Time taken</div></div>
      </div>
    </div>
    <div class="breakdown-card"><h2>Score by Domain</h2>\${bdRows}</div>
    <div class="review-section"><h2>Question Review</h2>\${rvCards}</div>
    <button class="btn-restart" onclick="restartExam()">Take Another Exam →</button>
  \`;

  // Animate score ring
  const circumference = 339.3;
  requestAnimationFrame(() => setTimeout(() => {
    document.getElementById('score-ring').style.strokeDashoffset =
      circumference * (1 - result.percentage / 100);
  }, 80));

  // Animate domain bars
  document.querySelectorAll('.bd-fill').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.pct + '%'; }, 200);
  });
}

function toggleRv(i) { document.getElementById('rv' + i)?.classList.toggle('open'); }

function restartExam() {
  examToken = null; examQuestions = []; examAnswers = {};
  clearInterval(timerInterval); startTime = null;
  document.getElementById('register-form').reset();
  showScreen('screen-register');
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

  // Send email to admin (await directly — simpler and more reliable)
  if (env.RESEND_API_KEY && env.ADMIN_EMAIL) {
    try {
      await sendAdminEmail(env, result);
    } catch (err) {
      console.error('[email] send failed:', err.message);
    }
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
