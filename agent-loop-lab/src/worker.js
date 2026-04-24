const HTML = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Agent Loop Lab · Claude Code</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23CC785C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 8V4H8'/><rect width='16' height='12' x='4' y='8' rx='2'/><path d='M2 14h2'/><path d='M20 14h2'/><path d='M15 13v2'/><path d='M9 13v2'/></svg>">
<style>
  :root {
    --bg:        #F5F0E8;
    --surface:   #FDFCFA;
    --surface-2: #F9F6F1;
    --border:    #E2D8CC;
    --border-2:  #CEC4B8;
    --text:      #1A1714;
    --text-2:    #6B6259;
    --text-3:    #A09890;
    --accent:    #CC785C;
    --accent-bg: #F8EEE9;
    --dark:      #1A1714;
    --shadow:    0 2px 8px rgba(26,23,20,.08), 0 1px 3px rgba(26,23,20,.04);
    --shadow-lg: 0 8px 32px rgba(26,23,20,.1), 0 2px 8px rgba(26,23,20,.06);
    --radius:    12px;
    --radius-sm: 8px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 56px 24px 72px;
  }

  /* ── Header ── */
  .brand {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 20px;
  }

  h1 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 2.6rem;
    font-weight: 400;
    font-style: italic;
    color: var(--text);
    text-align: center;
    line-height: 1.2;
    letter-spacing: -.3px;
    max-width: 600px;
    margin-bottom: 12px;
  }

  .subtitle {
    font-size: 14px;
    color: var(--text-2);
    text-align: center;
    line-height: 1.6;
    margin-bottom: 48px;
    max-width: 480px;
  }

  /* ── Diagram card ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    padding: 44px 52px;
    margin-bottom: 16px;
    width: 100%;
    max-width: 760px;
  }

  /* ── Loop container ── */
  .loop-wrap {
    position: relative;
    width: 340px;
    height: 212px;
    flex-shrink: 0;
  }

  .loop-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .16em;
    color: var(--text-3);
    text-transform: uppercase;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  }

  .arrows {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  }

  /* ── Node boxes (HTML, flexbox — no SVG text issues) ── */
  .node {
    position: absolute;
    width: 130px;
    height: 76px;
    border-radius: 10px;
    background: var(--surface);
    border: 1px solid var(--border-2);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    color: var(--text);
  }

  .node-message { top: 0;     left: 0;   }
  .node-response { top: 0;     left: 210px; background: #FDF7F5; border-color: #D8C4BF; }
  .node-llm      { top: 136px; left: 0;   }
  .node-tools    { top: 136px; left: 210px; }

  .nt { font-size: 12.5px; font-weight: 600; line-height: 1; color: var(--text); }
  .ns { font-size: 10px;   font-weight: 400; line-height: 1; color: var(--text-3); }

  /* ── Requirements ── */
  .reqs-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 760px;
    overflow: hidden;
  }

  .sec-header {
    padding: 14px 24px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sec-header-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .req-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    line-height: 1.6;
  }

  .req-row:last-child { border-bottom: none; }

  .req-row.bonus {
    background: var(--surface-2);
    align-items: center;
    padding: 12px 24px;
  }

  .req-icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-top: 2px;
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .req-icon svg {
    width: 100%;
    height: 100%;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .req-row.bonus .req-icon { margin-top: 0; color: var(--text-2); }

  .req-text strong { font-weight: 600; color: var(--text); display: block; margin-bottom: 2px; }
  .req-text p { font-size: 13px; color: var(--text-2); }

  .bonus-sec-header {
    padding: 12px 24px 12px;
    border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--border);
    background: var(--bg);
  }
  .bonus-sub {
    margin: 6px 0 0;
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--text-2);
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }

  /* ── Bonus grid inside diagram card ── */
  .bonus-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 36px 0 20px;
    color: var(--text-3);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  .bonus-divider::before,
  .bonus-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .bonus-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .bonus-cell {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 10px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }
  .bonus-cell svg {
    width: 22px;
    height: 22px;
    stroke: var(--accent);
    fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .bonus-cell .b-name {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.25;
    color: var(--text);
    letter-spacing: .01em;
  }
  .loop-center { display: flex; justify-content: center; }
  @media (max-width: 640px) {
    .bonus-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<p class="brand">Claude Code · 动手实践题</p>

<h1>实现一个 Agent Loop</h1>
<p class="subtitle">基于下图的核心循环，设计并实现你对 Agent Loop 的理解。规模、工具、形态不限，重点是展示你对这一范式的思考与取舍</p>

<!-- Diagram card -->
<div class="card">
  <div class="loop-center">

    <!-- Loop area -->
    <div class="loop-wrap">
      <span class="loop-label">Agent Loop</span>

      <!-- Arrows only in SVG — no icon/text positioning -->
      <svg class="arrows" viewBox="0 0 340 212">
        <defs>
          <marker id="ao" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0.5 L0,5.5 L7,3 Z" fill="#CC785C"/>
          </marker>
        </defs>
        <!-- Message ↓ LLM -->
        <line x1="65"  y1="77"  x2="65"  y2="135" stroke="#CC785C" stroke-width="1.8" marker-end="url(#ao)"/>
        <!-- LLM → Tools -->
        <line x1="131" y1="174" x2="209" y2="174" stroke="#CC785C" stroke-width="1.8" marker-end="url(#ao)"/>
        <!-- Tools ↑ Response -->
        <line x1="275" y1="135" x2="275" y2="77"  stroke="#CC785C" stroke-width="1.8" marker-end="url(#ao)"/>
        <!-- Response ← Message -->
        <line x1="209" y1="38"  x2="131" y2="38"  stroke="#CC785C" stroke-width="1.8" marker-end="url(#ao)"/>
      </svg>

      <!-- Message -->
      <div class="node node-message">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="1" width="18" height="14" rx="3.5" fill="#CC785C" opacity="0.9"/>
          <polygon points="3,15 3,19 8,15" fill="#CC785C" opacity="0.9"/>
          <line x1="4.5" y1="6"  x2="15.5" y2="6"  stroke="white" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="4.5" y1="9.5" x2="12"   y2="9.5" stroke="white" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span class="nt">Message</span>
      </div>

      <!-- Response -->
      <div class="node node-response">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="1" width="18" height="14" rx="3.5" fill="#A06050" opacity="0.8"/>
          <polygon points="17,15 17,19 12,15" fill="#A06050" opacity="0.8"/>
          <circle cx="6.5"  cy="8" r="1.7" fill="white"/>
          <circle cx="10"   cy="8" r="1.7" fill="white"/>
          <circle cx="13.5" cy="8" r="1.7" fill="white"/>
        </svg>
        <span class="nt">Response</span>
      </div>

      <!-- LLM -->
      <div class="node node-llm">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="7" width="16" height="11" rx="2.5" fill="#CC785C" opacity="0.9"/>
          <rect x="7" y="2" width="6"  height="6"  rx="2"   fill="#CC785C" opacity="0.9"/>
          <circle cx="7.5"  cy="12.5" r="2" fill="white"/>
          <circle cx="12.5" cy="12.5" r="2" fill="white"/>
          <line x1="7.5" y1="16" x2="12.5" y2="16" stroke="white" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span class="nt">LLM</span>
        <span class="ns">claude / gpt / …</span>
      </div>

      <!-- Tools -->
      <div class="node node-tools">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="1" width="18" height="18" rx="4" fill="#CC785C" opacity="0.9"/>
          <polyline points="4,7 8.5,10 4,13" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="11" y1="13" x2="16" y2="13" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span class="nt">Tools</span>
        <span class="ns">Bash / Shell</span>
      </div>
    </div>

  </div>

  <!-- Bonus grid -->
  <div class="bonus-divider">加分方向 · 任选其一深入</div>
  <div class="bonus-grid">
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 21.67"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 21.67"/></svg>
      <span class="b-name">Memory</span>
    </div>
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      <span class="b-name">Skills</span>
    </div>
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></svg>
      <span class="b-name">Planning</span>
    </div>
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
      <span class="b-name">Sandbox</span>
    </div>
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      <span class="b-name">Prompt Cache</span>
    </div>
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
      <span class="b-name">Context Eng.</span>
    </div>
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      <span class="b-name">Observability</span>
    </div>
    <div class="bonus-cell">
      <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span class="b-name">Subagents</span>
    </div>
  </div>

</div>

<!-- Example tasks -->
<div class="reqs-card" style="margin-bottom: 16px;">

  <div class="sec-header">
    <span class="sec-header-label">示例任务 · 本机系统诊断</span>
  </div>

  <div class="req-row">
    <span class="req-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
    <div class="req-text">
      <strong>让你的 agent 能完成下列任意一个本机诊断任务</strong>
      <p>这些任务没有固定命令序列，每一步都要基于上一步的输出决定下一步查什么——正是体现 Agent Loop 能力的场景</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2"/><path d="M15 2v2"/><path d="M9 20v2"/><path d="M15 20v2"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/></svg></span>
    <div class="req-text">
      <strong>CPU / 内存占用排查</strong>
      <p>找出当前最占 CPU 或内存的进程，说明它是什么、在做什么、是否需要关注</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon"><svg viewBox="0 0 24 24"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg></span>
    <div class="req-text">
      <strong>磁盘空间诊断</strong>
      <p>"磁盘快满了" —— 找出最占空间的目录并给出清理建议</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon"><svg viewBox="0 0 24 24"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg></span>
    <div class="req-text">
      <strong>端口占用排查</strong>
      <p>查清某个端口被谁占用、对应进程是什么、服务是否健康</p>
    </div>
  </div>

</div>

<!-- Requirements -->
<div class="reqs-card">

  <div class="sec-header">
    <span class="sec-header-label">验收要求</span>
  </div>

  <div class="req-row">
    <span class="req-icon"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg></span>
    <div class="req-text">
      <strong>完整的循环</strong>
      <p>LLM 能自主判断是否调用工具、处理工具结果、并持续推理直到给出最终答复</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon"><svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg></span>
    <div class="req-text">
      <strong>至少包含 Bash / Shell 工具</strong>
      <p>可在此基础上扩展任意其它工具，数量、形态不限</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
    <div class="req-text">
      <strong>可交互验收</strong>
      <p>能通过网页、CLI、Notebook 等任意界面真实对话体验</p>
    </div>
  </div>

  <div class="bonus-sec-header">
    <span class="sec-header-label">加分项 · 聚焦一个方向深入</span>
    <p class="bonus-sub">只选一个方向深入，重点呈现你对 harness 的设计思考与取舍</p>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 21.67"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 21.67"/></svg></span>
    <div class="req-text"><strong>Memory</strong> — 跨轮次 / 跨会话的上下文管理</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
    <div class="req-text"><strong>Skills / Multi-tool</strong> — 多工具协作、工具选择策略</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></svg></span>
    <div class="req-text"><strong>Planning / Reflection / Robustness</strong> — 规划、反思、错误恢复、并行</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></span>
    <div class="req-text"><strong>Sandbox</strong> — 工具执行隔离、权限与资源边界</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
    <div class="req-text"><strong>Prompt Cache</strong> — 提示词缓存，降低延迟与成本</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span>
    <div class="req-text"><strong>Context Engineering</strong> — 长对话压缩、窗口管理、上下文裁剪</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
    <div class="req-text"><strong>Observability</strong> — 追踪、日志、Token / 成本统计</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
    <div class="req-text"><strong>Subagents</strong> — 子 agent 分派、多角色协作</div>
  </div>

</div>

</body>
</html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return new Response(HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return new Response('Not Found', { status: 404 });
  },
};
