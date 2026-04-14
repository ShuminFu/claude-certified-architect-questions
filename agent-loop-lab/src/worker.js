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

  /* ── Connector SVG ── */
  .connector { flex-shrink: 0; }

  /* ── Context box ── */
  .ctx-wrap {
    background: var(--surface-2);
    border: 1px solid var(--border-2);
    border-radius: 12px;
    padding: 18px 18px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    box-shadow: var(--shadow);
    min-width: 148px;
  }

  .ctx-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-2);
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .ctx-nodes { display: flex; gap: 8px; }

  .ctx-node {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 9px;
    padding: 9px 10px 7px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    min-width: 58px;
    box-shadow: var(--shadow);
  }

  .ctx-node span {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-2);
    line-height: 1;
    white-space: nowrap;
  }

  .ctx-badge {
    background: var(--accent-bg);
    border: 1px solid rgba(204,120,92,.2);
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 10px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: .04em;
  }

  /* ── Diagram flex layout ── */
  .diagram-inner {
    display: flex;
    align-items: center;
    gap: 0;
  }

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

  .req-icon { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
  .req-row.bonus .req-icon { margin-top: 0; }

  .req-text strong { font-weight: 600; color: var(--text); display: block; margin-bottom: 2px; }
  .req-text p { font-size: 13px; color: var(--text-2); }

  .bonus-sec-header {
    padding: 12px 24px 10px;
    border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--border);
    background: var(--bg);
  }
</style>
</head>
<body>

<p class="brand">Claude Code · 动手实践题</p>

<h1>实现一个 Agent Loop</h1>
<p class="subtitle">基于下图的核心循环，设计并实现你对 Agent Loop 的理解。规模、工具、形态不限，重点是展示你对这一范式的思考与取舍</p>

<!-- Diagram card -->
<div class="card">
  <div class="diagram-inner">

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

    <!-- Connector -->
    <svg class="connector" width="52" height="212" viewBox="0 0 52 212">
      <defs>
        <marker id="ap"   markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0.5 L0,5.5 L6,3 Z" fill="#A09890"/>
        </marker>
        <marker id="ap-r" markerWidth="7" markerHeight="7" refX="0.5" refY="3" orient="auto">
          <path d="M6,0.5 L6,5.5 L0,3 Z" fill="#A09890"/>
        </marker>
      </defs>
      <line x1="6" y1="106" x2="46" y2="106"
            stroke="#A09890" stroke-width="1.8" stroke-dasharray="4,3"
            marker-start="url(#ap-r)" marker-end="url(#ap)"/>
    </svg>

    <!-- Context -->
    <div class="ctx-wrap">
      <span class="ctx-title">Context</span>
      <div class="ctx-nodes">

        <div class="ctx-node">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="9" rx="7" ry="6.5" fill="#6B6259" opacity="0.7"/>
            <line x1="9" y1="2.5" x2="9" y2="15.5" stroke="white" stroke-width="1.1"/>
            <path d="M3.5,6.5 Q9,4.5 14.5,6.5"  stroke="white" stroke-width="0.9" fill="none" opacity="0.6"/>
            <path d="M2,9 Q9,7 16,9"             stroke="white" stroke-width="0.9" fill="none" opacity="0.6"/>
            <path d="M3.5,11.5 Q9,9.5 14.5,11.5" stroke="white" stroke-width="0.9" fill="none" opacity="0.6"/>
          </svg>
          <span>Memory</span>
        </div>

        <div class="ctx-node">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="3" stroke="#6B6259" stroke-width="1.6" opacity="0.8"/>
            <line x1="9" y1="1"  x2="9"  y2="4"  stroke="#6B6259" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
            <line x1="9" y1="14" x2="9"  y2="17" stroke="#6B6259" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
            <line x1="1" y1="9"  x2="4"  y2="9"  stroke="#6B6259" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
            <line x1="14" y1="9" x2="17" y2="9"  stroke="#6B6259" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
            <line x1="2.8" y1="2.8" x2="4.9" y2="4.9" stroke="#6B6259" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
            <line x1="13.1" y1="13.1" x2="15.2" y2="15.2" stroke="#6B6259" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
            <line x1="2.8" y1="15.2" x2="4.9" y2="13.1" stroke="#6B6259" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
            <line x1="13.1" y1="4.9" x2="15.2" y2="2.8" stroke="#6B6259" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
          </svg>
          <span>Skills</span>
        </div>

      </div>
      <span class="ctx-badge">加分项</span>
    </div>

  </div>
</div>

<!-- Example tasks -->
<div class="reqs-card" style="margin-bottom: 16px;">

  <div class="sec-header">
    <span class="sec-header-label">示例任务 · 本机系统诊断</span>
  </div>

  <div class="req-row">
    <span class="req-icon">🎯</span>
    <div class="req-text">
      <strong>让你的 agent 能完成下列任意一个本机诊断任务</strong>
      <p>这些任务没有固定命令序列，每一步都要基于上一步的输出决定下一步查什么——正是体现 Agent Loop 能力的场景</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">🔥</span>
    <div class="req-text">
      <strong>CPU / 内存占用排查</strong>
      <p>找出当前最占 CPU 或内存的进程，说明它是什么、在做什么、是否需要关注</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">💾</span>
    <div class="req-text">
      <strong>磁盘空间诊断</strong>
      <p>"磁盘快满了" —— 找出最占空间的目录并给出清理建议</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">🌐</span>
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
    <span class="req-icon">🔁</span>
    <div class="req-text">
      <strong>完整的循环</strong>
      <p>LLM 能自主判断是否调用工具、处理工具结果、并持续推理直到给出最终答复</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">🛠️</span>
    <div class="req-text">
      <strong>至少包含 Bash / Shell 工具</strong>
      <p>可在此基础上扩展任意其它工具，数量、形态不限</p>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">💬</span>
    <div class="req-text">
      <strong>可交互验收</strong>
      <p>能通过网页、CLI、Notebook 等任意界面真实对话体验</p>
    </div>
  </div>

  <div class="bonus-sec-header">
    <span class="sec-header-label">加分项 · 任选方向自由发挥</span>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">🧠</span>
    <div class="req-text"><strong>Memory</strong> — 跨轮次 / 跨会话的上下文管理</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">⚙️</span>
    <div class="req-text"><strong>Skills / Multi-tool</strong> — 多工具协作、工具选择策略</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">🧭</span>
    <div class="req-text"><strong>Planning / Reflection / Robustness</strong> — 规划、反思、错误恢复、并行</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">🛡️</span>
    <div class="req-text"><strong>Sandbox</strong> — 工具执行隔离、权限与资源边界</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">⚡</span>
    <div class="req-text"><strong>Prompt Cache</strong> — 提示词缓存，降低延迟与成本</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">🗜️</span>
    <div class="req-text"><strong>Context Engineering</strong> — 长对话压缩、窗口管理、上下文裁剪</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">📊</span>
    <div class="req-text"><strong>Observability</strong> — 追踪、日志、Token / 成本统计</div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">👥</span>
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
