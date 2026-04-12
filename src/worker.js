import questionsData from '../cca_questions.json';

const QUESTIONS = questionsData.questions;
const DOMAINS = questionsData.meta.domains;
const QUESTIONS_PER_DOMAIN = 4;

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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:         #F5F0E8;
    --surface:    #FDFCFA;
    --surface-2:  #F9F6F1;
    --border:     #E2D8CC;
    --border-2:   #CEC4B8;
    --text:       #1A1714;
    --text-2:     #6B6259;
    --text-3:     #A09890;
    --accent:     #CC785C;
    --accent-bg:  #F8EEE9;
    --dark:       #1A1714;
    --success:    #2D6A4F;
    --success-bg: #EBF5EF;
    --danger:     #9B2335;
    --danger-bg:  #FAEDEF;
    --shadow-sm:  0 1px 2px rgba(26,23,20,.05);
    --shadow:     0 2px 8px rgba(26,23,20,.08), 0 1px 3px rgba(26,23,20,.04);
    --shadow-lg:  0 8px 32px rgba(26,23,20,.1), 0 2px 8px rgba(26,23,20,.06);
    --radius:     12px;
    --radius-sm:  8px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Screen transitions ── */
  .screen { display: none; }
  .screen.active { display: block; animation: fadeUp .35s ease both; }
  #screen-register.active { display: flex; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─────────────────────────────────────────────
     SCREEN 1 — REGISTER
  ───────────────────────────────────────────── */
  #screen-register { min-height: 100vh; align-items: stretch; }

  .reg-left {
    width: 420px; flex-shrink: 0;
    background: var(--dark);
    padding: 52px 44px;
    display: flex; flex-direction: column; justify-content: center;
    color: var(--bg);
  }
  .reg-brand {
    font-family: 'Inter', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 32px;
  }
  .reg-left h1 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 44px; font-weight: 400; font-style: italic; line-height: 1.15;
    color: var(--bg); margin-bottom: 16px; letter-spacing: -.3px;
  }
  .reg-left p {
    font-size: 14px; color: rgba(245,240,232,.55); line-height: 1.7; margin-bottom: 36px;
  }
  .exam-stats { display: flex; gap: 28px; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid rgba(245,240,232,.1); }
  .stat-val { display: block; font-family: 'Instrument Serif', serif; font-size: 36px; color: var(--bg); line-height: 1; }
  .stat-lbl { display: block; font-size: 11px; color: rgba(245,240,232,.4); text-transform: uppercase; letter-spacing: .6px; margin-top: 4px; }

  .domain-list { display: flex; flex-direction: column; gap: 6px; }
  .di {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--radius-sm);
    border: 1px solid rgba(245,240,232,.08);
    transition: background .15s;
  }
  .di:hover { background: rgba(245,240,232,.05); }
  .di-num  { font-size: 10px; font-weight: 700; letter-spacing: .4px; color: var(--accent); width: 22px; flex-shrink: 0; }
  .di-name { font-size: 12.5px; color: rgba(245,240,232,.7); flex: 1; line-height: 1.4; }
  .di-tag  { font-size: 10px; color: rgba(245,240,232,.3); flex-shrink: 0; }

  .reg-right {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 48px 32px; background: var(--bg);
  }
  .reg-card {
    background: var(--surface); border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg); padding: 44px 40px;
    width: 100%; max-width: 400px;
  }
  .reg-card h2 {
    font-family: 'Instrument Serif', serif;
    font-size: 32px; font-weight: 400; font-style: italic; line-height: 1.2; margin-bottom: 8px;
  }
  .reg-card > p { font-size: 13.5px; color: var(--text-2); margin-bottom: 32px; line-height: 1.5; }
  .form-group { margin-bottom: 20px; }
  .form-group label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 7px; letter-spacing: .2px; }
  .form-group input {
    width: 100%; padding: 11px 14px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-family: 'Inter', sans-serif;
    font-size: 14.5px; color: var(--text); outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .form-group input:focus { border-color: var(--text); box-shadow: 0 0 0 3px rgba(26,23,20,.07); }
  .form-group input::placeholder { color: var(--text-3); }
  .btn-start {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px;
    background: var(--dark); color: var(--bg); border: none;
    border-radius: var(--radius-sm); font-family: 'Inter', sans-serif;
    font-size: 14.5px; font-weight: 600; cursor: pointer; margin-top: 8px;
    transition: opacity .15s, transform .1s;
  }
  .btn-start:hover { opacity: .88; transform: translateY(-1px); }
  .btn-start:disabled { opacity: .4; cursor: not-allowed; transform: none; }
  .btn-arrow { transition: transform .2s; }
  .btn-start:hover .btn-arrow { transform: translateX(3px); }
  .reg-note { font-size: 12px; color: var(--text-3); text-align: center; margin-top: 18px; }
  .error-msg { background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; border: 1px solid rgba(155,35,53,.15); }

  /* ─────────────────────────────────────────────
     SCREEN 2 — EXAM
  ───────────────────────────────────────────── */
  #screen-exam { padding-bottom: 88px; }

  .exam-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(245,240,232,.96); backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }
  .exam-header-inner {
    max-width: 860px; margin: 0 auto;
    padding: 12px 28px;
    display: flex; align-items: center; gap: 20px;
  }
  .eh-title { font-size: 13px; font-weight: 600; color: var(--text-2); white-space: nowrap; letter-spacing: .2px; }
  .eh-timer {
    font-family: 'Instrument Serif', serif;
    font-size: 22px; color: var(--text);
    font-variant-numeric: tabular-nums; white-space: nowrap;
    letter-spacing: 1px;
  }
  .eh-progress { flex: 1; min-width: 60px; }
  .progress-bar  { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--dark); border-radius: 2px; transition: width .4s ease; }
  .progress-label { font-size: 11px; color: var(--text-3); margin-top: 5px; text-align: right; letter-spacing: .2px; }

  .exam-body { max-width: 860px; margin: 0 auto; padding: 40px 28px; }

  .domain-section { margin-bottom: 52px; }
  .domain-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
  }
  .ds-num  { font-size: 11px; font-weight: 600; color: var(--text-3); letter-spacing: .8px; text-transform: uppercase; }
  .ds-name { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); flex: 1; line-height: 1.3; }
  .ds-progress {
    font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    background: var(--surface-2); color: var(--text-3);
    border: 1px solid var(--border); transition: all .2s;
  }
  .ds-progress.complete { background: var(--success-bg); color: var(--success); border-color: rgba(45,106,79,.2); }

  .question-card {
    background: var(--surface); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow-sm);
    margin-bottom: 14px; overflow: hidden;
    transition: border-color .2s, box-shadow .2s;
  }
  .question-card.answered { border-color: var(--border-2); box-shadow: var(--shadow); }
  .qcard-head { padding: 18px 22px 0; display: flex; align-items: center; gap: 8px; }
  .q-num { font-size: 11px; font-weight: 600; color: var(--text-3); letter-spacing: .3px; }
  .q-scenario {
    font-size: 11px; color: var(--text-3);
    background: var(--surface-2); border: 1px solid var(--border);
    padding: 2px 8px; border-radius: 4px;
  }
  .question-text {
    padding: 12px 22px 18px;
    font-size: 15px; line-height: 1.75; color: var(--text);
  }
  .options { padding: 0 16px 18px; display: flex; flex-direction: column; gap: 8px; }
  .option {
    display: flex; align-items: flex-start; gap: 13px;
    padding: 13px 16px; border-radius: 9px; cursor: pointer;
    border: 1px solid var(--border); background: var(--bg);
    transition: all .15s ease; font-size: 14px; line-height: 1.6; user-select: none;
  }
  .option:hover { border-color: var(--border-2); background: var(--surface); }
  .option.selected { border-color: var(--dark); background: var(--surface); }
  .opt-indicator {
    width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
    border: 1.5px solid var(--border-2);
    display: flex; align-items: center; justify-content: center;
    transition: all .15s ease;
  }
  .option:hover .opt-indicator { border-color: var(--border-2); }
  .option.selected .opt-indicator { border-color: var(--dark); background: var(--dark); }
  .opt-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bg); opacity: 0; transform: scale(0); transition: all .15s ease; }
  .option.selected .opt-dot { opacity: 1; transform: scale(1); }
  .opt-key { font-size: 12px; font-weight: 600; color: var(--text-3); flex-shrink: 0; width: 16px; margin-top: 1px; }
  .option.selected .opt-key { color: var(--text); }

  /* ── Submit bar ── */
  .submit-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    background: rgba(245,240,232,.97); backdrop-filter: blur(10px);
    border-top: 1px solid var(--border);
    padding: 14px 28px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .sb-info { font-size: 13px; color: var(--text-2); }
  .btn-submit {
    padding: 11px 28px; background: var(--surface-2); color: var(--text-2);
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: all .15s;
  }
  .btn-submit:hover { border-color: var(--border-2); color: var(--text); }
  .btn-submit.ready {
    background: var(--dark); color: var(--bg); border-color: var(--dark);
    box-shadow: 0 2px 8px rgba(26,23,20,.2);
  }
  .btn-submit.ready:hover { opacity: .88; }
  .btn-submit:disabled { opacity: .4; cursor: not-allowed; }

  /* ─────────────────────────────────────────────
     SCREEN 3 — RESULTS
  ───────────────────────────────────────────── */
  #screen-results { max-width: 820px; margin: 0 auto; padding: 44px 28px 100px; }

  .result-hero {
    background: var(--surface); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow);
    padding: 48px 40px 40px; text-align: center; margin-bottom: 18px;
    animation: fadeUp .4s ease both;
  }
  .result-ring-wrap { position: relative; display: inline-block; margin-bottom: 24px; }
  .score-ring-svg { width: 168px; height: 168px; transform: rotate(-90deg); }
  .ring-bg   { fill: none; stroke: var(--border); stroke-width: 9; }
  .ring-fill {
    fill: none; stroke: var(--dark); stroke-width: 9; stroke-linecap: round;
    stroke-dasharray: 339.3; stroke-dashoffset: 339.3;
    transition: stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke .3s;
  }
  .ring-label {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    text-align: center;
  }
  .ring-score { font-family: 'Instrument Serif', serif; font-size: 44px; line-height: 1; color: var(--text); }
  .ring-total { font-size: 13px; color: var(--text-3); margin-top: 2px; }

  .result-badge {
    display: inline-block; padding: 4px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .7px; text-transform: uppercase;
    margin-bottom: 10px; border: 1px solid transparent;
  }
  .result-badge.pass { background: var(--success-bg); color: var(--success); border-color: rgba(45,106,79,.2); }
  .result-badge.fail { background: var(--danger-bg);  color: var(--danger);  border-color: rgba(155,35,53,.15); }
  .result-scaled { font-size: 14px; color: var(--text-2); margin-bottom: 28px; }
  .result-scaled strong { color: var(--text); }
  .result-meta { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid var(--border); }
  .rm-item { text-align: center; }
  .rm-val { font-family: 'Instrument Serif', serif; font-size: 26px; color: var(--text); }
  .rm-lbl { font-size: 11px; color: var(--text-3); text-transform: uppercase; letter-spacing: .5px; margin-top: 3px; }

  .breakdown-card {
    background: var(--surface); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow-sm);
    padding: 28px 32px; margin-bottom: 18px;
    animation: fadeUp .4s .1s ease both;
  }
  .breakdown-card h2 {
    font-family: 'Instrument Serif', serif; font-size: 18px; font-weight: 400;
    color: var(--text); margin-bottom: 24px;
  }
  .bd-row { margin-bottom: 18px; }
  .bd-row:last-child { margin-bottom: 0; }
  .bd-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 7px; }
  .bd-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .bd-frac { font-size: 13px; font-weight: 700; }
  .bd-bar  { height: 5px; background: var(--surface-2); border-radius: 3px; overflow: hidden; border: 1px solid var(--border); }
  .bd-fill { height: 100%; border-radius: 3px; width: 0; transition: width 1.1s .25s cubic-bezier(.4,0,.2,1); }
  .bd-fill.c-full    { background: var(--success); }
  .bd-fill.c-partial { background: var(--dark); }
  .bd-fill.c-poor    { background: var(--danger); }

  .review-section { animation: fadeUp .4s .2s ease both; }
  .review-section h2 {
    font-family: 'Instrument Serif', serif; font-size: 18px; font-weight: 400;
    color: var(--text); margin-bottom: 14px;
  }
  .review-card {
    background: var(--surface); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow-sm);
    margin-bottom: 10px; overflow: hidden;
    border-left: 3px solid var(--border);
    transition: box-shadow .2s;
  }
  .review-card:hover { box-shadow: var(--shadow); }
  .review-card.correct { border-left-color: var(--success); }
  .review-card.wrong   { border-left-color: var(--danger); }
  .review-head { padding: 14px 18px; cursor: pointer; display: flex; align-items: center; gap: 10px; }
  .rv-icon  { font-size: 14px; flex-shrink: 0; }
  .rv-text  { font-size: 13px; line-height: 1.55; flex: 1; color: var(--text-2); }
  .rv-arrow { font-size: 11px; color: var(--border-2); transition: transform .2s; flex-shrink: 0; }
  .review-card.open .rv-arrow { transform: rotate(180deg); }
  .review-body { display: none; padding: 0 18px 16px; }
  .review-card.open .review-body { display: block; }
  .rv-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .rv-opt {
    padding: 9px 13px; border-radius: 7px; font-size: 13px; line-height: 1.5;
    border: 1px solid var(--border); color: var(--text-2); background: var(--bg);
  }
  .rv-opt.is-correct { background: var(--success-bg); border-color: rgba(45,106,79,.2); color: var(--success); font-weight: 600; }
  .rv-opt.is-wrong   { background: var(--danger-bg);  border-color: rgba(155,35,53,.15); color: var(--danger); }
  .rv-explanation {
    background: var(--surface-2); border-radius: 7px; padding: 12px 14px;
    font-size: 13px; color: var(--text-2); line-height: 1.7;
    border: 1px solid var(--border);
  }
  .rv-explanation strong { color: var(--text); }

  .btn-restart {
    display: block; width: fit-content; margin: 36px auto 0;
    padding: 12px 36px; background: var(--dark); color: var(--bg); border: none;
    border-radius: var(--radius-sm); font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: .2px;
    transition: opacity .15s, transform .1s;
  }
  .btn-restart:hover { opacity: .85; transform: translateY(-1px); }

  /* ── Mobile ── */
  @media (max-width: 700px) {
    #screen-register { flex-direction: column; }
    .reg-left { width: 100%; padding: 36px 24px; }
    .reg-left h1 { font-size: 34px; }
    .domain-list { display: none; }
    .reg-right { padding: 28px 16px; }
    .reg-card { padding: 32px 24px; }
    .eh-title { display: none; }
    .exam-body { padding: 28px 16px; }
    .submit-bar { padding: 12px 16px; }
    .result-hero { padding: 32px 20px 28px; }
    .breakdown-card { padding: 22px 18px; }
    #screen-results { padding: 28px 16px 80px; }
  }
</style>
</head>
<body>

<!-- ── Screen 1: Register ── -->
<div id="screen-register" class="screen active">
  <div class="reg-left">
    <div class="reg-brand">CCA · Practice Exam</div>
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

async function loadExam() {
  const res  = await fetch('/api/questions');
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Could not fetch questions');
  examToken = data.token; examQuestions = data.questions; examAnswers = {};
  renderQuestions(examQuestions);
  showScreen('screen-exam');
  window.scrollTo(0, 0);
  startTime = Date.now();
  startTimer();
}

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
        <span class="ds-num">Domain \${domainId}</span>
        <span class="ds-name">\${esc(items[0].q.domain_name)}</span>
        <span class="ds-progress" id="dp-\${domainId}">0 / \${items.length}</span>
      </div>\`;
    items.forEach(({ q, idx }) => {
      const card = document.createElement('div');
      card.className = 'question-card'; card.id = 'qcard-' + q.id;
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
  const total = examQuestions.length;
  document.getElementById('progress-fill').style.width = Math.round(answered/total*100) + '%';
  document.getElementById('progress-label').textContent = answered + ' / ' + total + ' answered';
  const btn = document.getElementById('submit-btn');
  const info = document.getElementById('submit-count');
  if (answered === total) {
    btn.classList.add('ready');
    info.textContent = 'All questions answered';
  } else {
    btn.classList.remove('ready');
    const rem = total - answered;
    info.textContent = rem + ' question' + (rem !== 1 ? 's' : '') + ' remaining';
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    document.getElementById('timer').textContent = fmt(Math.floor((Date.now() - startTime) / 1000));
  }, 1000);
}
function fmt(s) { return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }

async function submitExam() {
  const answered = Object.keys(examAnswers).length;
  const total = examQuestions.length;
  if (answered < total && !confirm(\`\${total - answered} question(s) unanswered. Submit anyway?\`)) return;
  clearInterval(timerInterval);
  const endTime = Date.now();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    const res = await fetch('/api/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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

function showResults(result) {
  showScreen('screen-results');
  window.scrollTo(0, 0);
  const pass  = result.scaledScore >= 720;
  const color = pass ? 'var(--success)' : result.percentage >= 50 ? 'var(--dark)' : 'var(--danger)';

  const bdRows = Object.entries(result.domainBreakdown).map(([name, b]) => {
    const pct = Math.round((b.correct / b.total) * 100);
    const cls = pct === 100 ? 'c-full' : pct >= 67 ? 'c-partial' : 'c-poor';
    const fc  = pct === 100 ? 'var(--success)' : pct >= 67 ? 'var(--text)' : 'var(--danger)';
    return \`<div class="bd-row">
      <div class="bd-head">
        <span class="bd-name">\${esc(name)}</span>
        <span class="bd-frac" style="color:\${fc}">\${b.correct}/\${b.total}</span>
      </div>
      <div class="bd-bar"><div class="bd-fill \${cls}" data-pct="\${pct}"></div></div>
    </div>\`;
  }).join('');

  const rvCards = result.questionResults.map((qr, i) => {
    const opts = Object.entries(qr.options || {}).map(([k, v]) => {
      let cls = 'rv-opt', marker = '';
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
      <div class="result-badge \${pass ? 'pass' : 'fail'}">\${pass ? 'Likely Pass' : 'Needs Review'}</div>
      <div class="result-scaled">Scaled score: <strong>\${result.scaledScore}</strong> / 1000 &nbsp;·&nbsp; Pass threshold: <strong>720</strong></div>
      <div class="result-meta">
        <div class="rm-item"><div class="rm-val">\${result.percentage}%</div><div class="rm-lbl">Correct</div></div>
        <div class="rm-item"><div class="rm-val">\${fmt(result.timeTaken)}</div><div class="rm-lbl">Time taken</div></div>
      </div>
    </div>
    <div class="breakdown-card"><h2>Score by Domain</h2>\${bdRows}</div>
    <div class="review-section"><h2>Question Review</h2>\${rvCards}</div>
    <button class="btn-restart" onclick="restartExam()">Take Another Exam →</button>
  \`;

  requestAnimationFrame(() => setTimeout(() => {
    document.getElementById('score-ring').style.strokeDashoffset = 339.3 * (1 - result.percentage / 100);
  }, 80));
  document.querySelectorAll('.bd-fill').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.pct + '%'; }, 250);
  });
}

function toggleRv(i) { document.getElementById('rv' + i)?.classList.toggle('open'); }

function restartExam() {
  examToken = null; examQuestions = []; examAnswers = {};
  clearInterval(timerInterval); startTime = null;
  document.getElementById('register-form').reset();
  const btn = document.getElementById('start-btn');
  btn.disabled = false;
  btn.querySelector('span').textContent = 'Start Exam';
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

      <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <div style="background:#f3f4f6;padding:8px 12px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.4px;">Domain Breakdown</div>
        <table style="width:100%;border-collapse:collapse;">
          ${breakdownRows}
        </table>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <div style="background:#f3f4f6;padding:8px 12px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.4px;">Question Breakdown</div>
        <table style="width:100%;border-collapse:collapse;">
          ${(result.questionResults || []).map((q, i) => {
            const correct = q.isCorrect;
            const icon = correct ? '✓' : '✗';
            const iconColor = correct ? '#059669' : '#dc2626';
            const rowBg = correct ? '#f0fdf4' : '#fff5f5';
            const short = q.question.length > 90 ? q.question.slice(0, 87) + '…' : q.question;
            return `<tr style="background:${rowBg};border-top:1px solid #e5e7eb;">
              <td style="padding:8px 10px;font-size:18px;color:${iconColor};font-weight:700;width:28px;text-align:center;">${icon}</td>
              <td style="padding:8px 10px;">
                <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">Q${i + 1} · ${q.domain_name}</div>
                <div style="font-size:12px;color:#374151;margin-bottom:4px;">${escHtml(short)}</div>
                <div style="font-size:12px;">
                  <span style="color:#6b7280;">Picked:</span>
                  <strong style="color:${correct ? '#059669' : '#dc2626'};">${q.given || '—'}</strong>
                  ${!correct ? `&nbsp;·&nbsp;<span style="color:#6b7280;">Correct:</span> <strong style="color:#059669;">${q.correct}</strong>` : ''}
                </div>
              </td>
            </tr>`;
          }).join('')}
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

// ─── Admin Auth Helpers ───────────────────────────────────────────────────────

async function adminHmac(adminKey) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(adminKey),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('admin-session'));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getAdminCookie(request) {
  const cookie = request.headers.get('Cookie') || '';
  return cookie.match(/admin_auth=([^;]+)/)?.[1] ?? null;
}

function adminLoginPage(error = false) {
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login · CCA Exam</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#f5f0e8;min-height:100vh;display:flex;align-items:center;justify-content:center}
  .card{background:#fff;border:1px solid #e8e0d4;border-radius:12px;padding:40px;width:100%;max-width:360px;box-shadow:0 2px 12px rgba(26,23,20,.08)}
  h1{font-size:20px;font-weight:700;color:#1a1714;margin-bottom:6px}
  .sub{font-size:13px;color:#9b9189;margin-bottom:28px}
  label{display:block;font-size:12px;font-weight:600;color:#5c5650;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
  input[type=password]{width:100%;padding:10px 14px;border:1px solid #ddd6cc;border-radius:7px;font-size:14px;color:#1a1714;background:#faf8f5;outline:none;transition:border .15s}
  input[type=password]:focus{border-color:#c9a96e;background:#fff}
  .error{font-size:12px;color:#9b2335;margin-top:8px;display:${error ? 'block' : 'none'}}
  button{width:100%;margin-top:20px;padding:11px;background:#1a1714;color:#f5f0e8;border:none;border-radius:7px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}
  button:hover{opacity:.85}
</style>
</head><body>
<div class="card">
  <h1>Admin Access</h1>
  <p class="sub">CCA Exam Results Dashboard</p>
  <form method="POST" action="/admin">
    <label for="pw">Password</label>
    <input type="password" id="pw" name="password" placeholder="Enter admin password" autofocus>
    <p class="error">Incorrect password. Please try again.</p>
    <button type="submit">Sign in</button>
  </form>
</div>
</body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// ─── Admin Results Page ───────────────────────────────────────────────────────

async function handleAdmin(request, env) {
  // POST → process login form
  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password') ?? '';

    if (!env.ADMIN_KEY || password !== env.ADMIN_KEY) {
      return adminLoginPage(true);
    }

    const token = await adminHmac(env.ADMIN_KEY);
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/admin',
        'Set-Cookie': `admin_auth=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800; Path=/`,
      },
    });
  }

  // GET → check session cookie
  const cookie = getAdminCookie(request);
  if (!env.ADMIN_KEY || !cookie) return adminLoginPage(false);

  const expected = await adminHmac(env.ADMIN_KEY);
  if (cookie !== expected) return adminLoginPage(false);

  // Authenticated — render results
  const list = await env.EXAM_KV.list({ prefix: 'result:' });
  const pairs = await Promise.all(
    list.keys.map(async ({ name: kvKey }) => ({
      token: kvKey.replace('result:', ''),
      result: await env.EXAM_KV.get(kvKey, 'json'),
    }))
  );
  const valid = pairs.filter(p => p.result).sort((a, b) => new Date(b.result.submittedAt) - new Date(a.result.submittedAt));

  const rows = valid.map(({ token, result: r }) => {
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
      <td><a href="/admin/result/${token}" style="color:#c9a96e;font-size:12px;text-decoration:none;font-weight:600;">Details →</a></td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>CCA Exam Results</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,sans-serif;background:#f5f0e8;padding:32px;min-height:100vh}
  h1{color:#1a1714;margin-bottom:6px;font-size:22px}
  .count{color:#9b9189;margin-bottom:24px;font-size:14px}
  .logout{float:right;font-size:13px;color:#9b9189;text-decoration:none;padding:6px 12px;border:1px solid #ddd6cc;border-radius:6px;background:#fff}
  .logout:hover{background:#f5f0e8}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.07)}
  th{background:#1a1714;color:#f5f0e8;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
  td{padding:10px 14px;border-bottom:1px solid #f3ede4;font-size:13px;color:#374151}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#faf8f5}
</style></head>
<body>
  <a href="/admin/logout" class="logout">Sign out</a>
  <h1>CCA Exam Results</h1>
  <p class="count">${valid.length} submission${valid.length !== 1 ? 's' : ''}</p>
  <table>
    <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Score</th><th>%</th><th>Scaled</th><th>Result</th><th>Time</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="9" style="text-align:center;color:#9ca3af;padding:40px">No results yet</td></tr>'}</tbody>
  </table>
</body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleAdminResult(token, env) {
  const result = await env.EXAM_KV.get(`result:${token}`, 'json');
  if (!result) return new Response('Result not found', { status: 404 });

  const pass = result.scaledScore >= 720;
  const qRows = (result.questionResults || []).map((q, i) => {
    const correct = q.isCorrect;
    const bg = correct ? '#f0fdf4' : '#fff5f5';
    const optionRows = Object.entries(q.options || {}).map(([letter, text]) => {
      const isGiven = letter === q.given;
      const isCorrect = letter === q.correct;
      let style = 'color:#374151;';
      let rowStyle = 'padding:6px 8px;border-radius:5px;margin-bottom:2px;font-size:13px;color:#374151;';
      let badge = '';
      if (isGiven && isCorrect) {
        rowStyle = 'padding:6px 8px;border-radius:5px;margin-bottom:2px;font-size:13px;background:#dcfce7;color:#059669;font-weight:700;';
        badge = ' <span style="background:#059669;color:#fff;font-size:10px;padding:1px 7px;border-radius:10px;font-weight:700;margin-left:4px;">Selected · Correct</span>';
      } else if (isGiven) {
        rowStyle = 'padding:6px 8px;border-radius:5px;margin-bottom:2px;font-size:13px;background:#fee2e2;color:#dc2626;font-weight:700;';
        badge = ' <span style="background:#dc2626;color:#fff;font-size:10px;padding:1px 7px;border-radius:10px;font-weight:700;margin-left:4px;">Selected</span>';
      } else if (isCorrect) {
        rowStyle = 'padding:6px 8px;border-radius:5px;margin-bottom:2px;font-size:13px;background:#dcfce7;color:#059669;font-weight:700;';
        badge = ' <span style="background:#059669;color:#fff;font-size:10px;padding:1px 7px;border-radius:10px;font-weight:700;margin-left:4px;">Correct</span>';
      }
      return `<div style="${rowStyle}"><strong>${letter}.</strong> ${escHtml(text)}${badge}</div>`;
    }).join('');

    return `<div style="margin-bottom:16px;background:${bg};border:1px solid ${correct ? '#bbf7d0' : '#fecaca'};border-radius:8px;padding:16px;">
      <div style="font-size:11px;color:#9ca3af;margin-bottom:6px;">Q${i + 1} · ${escHtml(q.domain_name)}</div>
      <div style="font-size:14px;font-weight:600;color:#1a1714;margin-bottom:12px;">${escHtml(q.question)}</div>
      <div style="margin-bottom:12px;">${optionRows}</div>
      <div style="font-size:12px;color:#6b7280;border-top:1px solid ${correct ? '#bbf7d0' : '#fecaca'};padding-top:10px;margin-top:4px;"><strong>Explanation:</strong> ${escHtml(q.explanation || '')}</div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Result Detail · ${escHtml(result.name)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,sans-serif;background:#f5f0e8;padding:32px;min-height:100vh;max-width:760px;margin:0 auto}
  .back{display:inline-block;font-size:13px;color:#9b9189;text-decoration:none;margin-bottom:20px}
  .back:hover{color:#1a1714}
  h1{color:#1a1714;font-size:20px;margin-bottom:4px}
  .meta{color:#9b9189;font-size:13px;margin-bottom:24px}
  .summary{background:#fff;border:1px solid #e8e0d4;border-radius:10px;padding:20px;margin-bottom:28px;display:flex;gap:24px;flex-wrap:wrap}
  .stat{text-align:center}
  .stat-val{font-size:22px;font-weight:700;color:#1a1714}
  .stat-lbl{font-size:11px;color:#9b9189;text-transform:uppercase;letter-spacing:.4px}
  h2{font-size:14px;font-weight:700;color:#1a1714;text-transform:uppercase;letter-spacing:.4px;margin-bottom:14px}
</style></head>
<body>
  <a href="/admin" class="back">← Back to results</a>
  <h1>${escHtml(result.name)}</h1>
  <div class="meta">${escHtml(result.email)} · ${new Date(result.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
  <div class="summary">
    <div class="stat"><div class="stat-val">${result.score}/${result.total}</div><div class="stat-lbl">Score</div></div>
    <div class="stat"><div class="stat-val">${result.percentage}%</div><div class="stat-lbl">Correct</div></div>
    <div class="stat"><div class="stat-val">${result.scaledScore}/1000</div><div class="stat-lbl">Scaled</div></div>
    <div class="stat"><div class="stat-val" style="color:${pass ? '#059669' : '#dc2626'}">${pass ? 'PASS' : 'FAIL'}</div><div class="stat-lbl">Result</div></div>
    <div class="stat"><div class="stat-val">${formatTime(result.timeTaken)}</div><div class="stat-lbl">Time</div></div>
  </div>
  <h2>Question Breakdown</h2>
  ${qRows || '<p style="color:#9ca3af">No question detail available.</p>'}
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
      if (url.pathname.startsWith('/admin/result/')) {
        // Require auth for result detail pages too
        const cookie = getAdminCookie(request);
        if (!env.ADMIN_KEY || !cookie || cookie !== await adminHmac(env.ADMIN_KEY)) {
          return new Response(null, { status: 302, headers: { Location: '/admin' } });
        }
        const token = url.pathname.replace('/admin/result/', '');
        return handleAdminResult(token, env);
      }
      if (url.pathname === '/admin/logout') {
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/admin',
            'Set-Cookie': 'admin_auth=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
          },
        });
      }
      return new Response('Not Found', { status: 404 });
    } catch (err) {
      console.error('[worker]', err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
