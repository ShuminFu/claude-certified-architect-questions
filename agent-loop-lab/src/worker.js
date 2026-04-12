const HTML = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Agent Loop Lab</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    background: #f7f6f3;
    font-family: 'Inter', system-ui, sans-serif;
    padding: 48px 24px 64px;
    color: #1a1a1a;
  }

  /* ── Header ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff3e0;
    border: 1px solid #ffc46b;
    color: #b05a00;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 20px;
    padding: 4px 12px;
    margin-bottom: 18px;
  }

  h1 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #111;
    text-align: center;
    line-height: 1.3;
    max-width: 540px;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 0.88rem;
    color: #666;
    text-align: center;
    margin-bottom: 48px;
  }

  /* ── Diagram ── */
  .diagram-wrap {
    background: #fff;
    border: 1px solid #e8e4de;
    border-radius: 24px;
    padding: 40px 48px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 40px;
  }

  /* SVG diagram */
  .diagram-svg {
    display: block;
    overflow: visible;
  }

  /* ── Requirements ── */
  .reqs {
    width: 100%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .req-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8e4de;
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .req-row.bonus {
    border-color: #c9b8f0;
    background: #faf7ff;
  }

  .req-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .req-text strong {
    display: block;
    font-weight: 600;
    margin-bottom: 2px;
    color: #111;
  }

  .req-text span {
    color: #555;
  }

  .section-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #999;
    margin: 20px 0 8px;
  }
</style>
</head>
<body>

<div class="badge">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  动手实践题
</div>

<h1>使用 Claude Code 写一个<br>能用的最小 Agent Loop</h1>
<p class="subtitle">实现下图所示的循环，让 LLM 能够调用工具并持续推理直到任务完成</p>

<!-- Diagram -->
<div class="diagram-wrap">
  <svg class="diagram-svg" width="600" height="280" viewBox="0 0 600 280">
    <defs>
      <!-- Arrow markers -->
      <marker id="arr-orange" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
        <path d="M0,0.5 L0,6.5 L8,3.5 Z" fill="#d97706"/>
      </marker>
      <marker id="arr-purple" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
        <path d="M0,0.5 L0,6.5 L8,3.5 Z" fill="#7c3aed"/>
      </marker>
      <marker id="arr-purple-rev" markerWidth="9" markerHeight="9" refX="1" refY="3.5" orient="auto">
        <path d="M8,0.5 L8,6.5 L0,3.5 Z" fill="#7c3aed"/>
      </marker>

      <!-- drop shadow -->
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#00000014"/>
      </filter>
    </defs>

    <!-- ───────── Loop area label ───────── -->
    <text x="178" y="148" text-anchor="middle" font-size="11" font-weight="600"
          fill="#d97706" letter-spacing="2" opacity="0.55">AGENT LOOP</text>

    <!-- ───────── Node boxes ───────── -->
    <!-- Message (top-left): center 88, 60 -->
    <rect x="28" y="30" width="120" height="60" rx="12" fill="#fff7ed" stroke="#fbbf24" stroke-width="1.5" filter="url(#shadow)"/>
    <!-- Message icon: chat bubble -->
    <g transform="translate(55, 49)">
      <rect x="0" y="0" width="22" height="17" rx="4" fill="#d97706" opacity="0.85"/>
      <polygon points="4,17 4,22 10,17" fill="#d97706" opacity="0.85"/>
      <line x1="5" y1="6" x2="17" y2="6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="5" y1="10" x2="14" y2="10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </g>
    <text x="88" y="76" text-anchor="middle" font-size="12.5" font-weight="600" fill="#92400e">Message</text>

    <!-- Response (top-right): center 370, 60 -->
    <rect x="310" y="30" width="120" height="60" rx="12" fill="#fff1f5" stroke="#f9a8d4" stroke-width="1.5" filter="url(#shadow)"/>
    <!-- Response icon: reply bubble -->
    <g transform="translate(337, 49)">
      <rect x="0" y="0" width="22" height="17" rx="4" fill="#db2777" opacity="0.75"/>
      <polygon points="18,17 18,22 12,17" fill="#db2777" opacity="0.75"/>
      <circle cx="7" cy="8.5" r="1.8" fill="white"/>
      <circle cx="11" cy="8.5" r="1.8" fill="white"/>
      <circle cx="15" cy="8.5" r="1.8" fill="white"/>
    </g>
    <text x="370" y="76" text-anchor="middle" font-size="12.5" font-weight="600" fill="#9d174d">Response</text>

    <!-- LLM (bottom-left): center 88, 210 -->
    <rect x="28" y="180" width="120" height="70" rx="12" fill="#fff7ed" stroke="#fbbf24" stroke-width="1.5" filter="url(#shadow)"/>
    <!-- Robot icon -->
    <g transform="translate(58, 190)">
      <rect x="2" y="5" width="18" height="14" rx="3" fill="#d97706" opacity="0.85"/>
      <rect x="7" y="0" width="8" height="6" rx="2" fill="#d97706" opacity="0.85"/>
      <line x1="11" y1="5" x2="11" y2="6" stroke="#d97706" stroke-width="1.5"/>
      <circle cx="8" cy="11" r="2" fill="white"/>
      <circle cx="14" cy="11" r="2" fill="white"/>
      <line x1="8" y1="16" x2="14" y2="16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </g>
    <text x="88" y="228" text-anchor="middle" font-size="12.5" font-weight="600" fill="#92400e">LLM</text>
    <text x="88" y="243" text-anchor="middle" font-size="10" font-weight="500" fill="#b45309" opacity="0.7">(claude / gpt / ...)</text>

    <!-- Tools (bottom-right): center 370, 210 -->
    <rect x="310" y="180" width="120" height="70" rx="12" fill="#fff7ed" stroke="#fbbf24" stroke-width="1.5" filter="url(#shadow)"/>
    <!-- Terminal icon -->
    <g transform="translate(338, 191)">
      <rect x="0" y="0" width="24" height="18" rx="3" fill="#d97706" opacity="0.85"/>
      <polyline points="4,6 9,10 4,14" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="12" y1="14" x2="20" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </g>
    <text x="370" y="228" text-anchor="middle" font-size="12.5" font-weight="600" fill="#92400e">Tools</text>
    <text x="370" y="243" text-anchor="middle" font-size="10" font-weight="500" fill="#b45309" opacity="0.7">Bash / Shell</text>

    <!-- ───────── Arrows (clean rectangular loop) ───────── -->
    <!-- ↓ Message → LLM (left side, going down) -->
    <line x1="88" y1="91" x2="88" y2="178"
          stroke="#d97706" stroke-width="2" marker-end="url(#arr-orange)"/>

    <!-- → LLM → Tools (bottom, going right) -->
    <line x1="149" y1="218" x2="308" y2="218"
          stroke="#d97706" stroke-width="2" marker-end="url(#arr-orange)"/>

    <!-- ↑ Tools → Response (right side, going up) -->
    <line x1="370" y1="178" x2="370" y2="91"
          stroke="#d97706" stroke-width="2" marker-end="url(#arr-orange)"/>

    <!-- ← Response → Message (top, going left) -->
    <line x1="308" y1="60" x2="150" y2="60"
          stroke="#d97706" stroke-width="2" marker-end="url(#arr-orange)"/>

    <!-- ───────── Context box (right) ───────── -->
    <rect x="468" y="60" width="120" height="160" rx="16"
          fill="#f5f0ff" stroke="#a78bfa" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="528" y="84" text-anchor="middle" font-size="11.5" font-weight="700" fill="#6d28d9">Context</text>

    <!-- Memory sub-box -->
    <rect x="480" y="94" width="44" height="48" rx="10" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1.2"/>
    <!-- Brain icon (simplified) -->
    <g transform="translate(491, 101)">
      <ellipse cx="11" cy="9" rx="9" ry="8" fill="#7c3aed" opacity="0.7"/>
      <line x1="11" y1="1" x2="11" y2="17" stroke="white" stroke-width="1.2"/>
      <line x1="6" y1="5" x2="16" y2="5" stroke="white" stroke-width="1" opacity="0.6"/>
      <line x1="4" y1="9" x2="18" y2="9" stroke="white" stroke-width="1" opacity="0.6"/>
      <line x1="6" y1="13" x2="16" y2="13" stroke="white" stroke-width="1" opacity="0.6"/>
    </g>
    <text x="502" y="152" text-anchor="middle" font-size="9.5" font-weight="600" fill="#5b21b6">Memory</text>

    <!-- Skills sub-box -->
    <rect x="532" y="94" width="44" height="48" rx="10" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1.2"/>
    <!-- Gear icon -->
    <g transform="translate(543, 101)">
      <circle cx="11" cy="9" r="4" fill="none" stroke="#7c3aed" stroke-width="1.8" opacity="0.85"/>
      <circle cx="11" cy="9" r="1.5" fill="#7c3aed" opacity="0.85"/>
      <line x1="11" y1="1" x2="11" y2="4" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
      <line x1="11" y1="14" x2="11" y2="17" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
      <line x1="3" y1="9" x2="6" y2="9" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
      <line x1="16" y1="9" x2="19" y2="9" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
      <line x1="5.1" y1="4.1" x2="7.2" y2="6.2" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
      <line x1="14.8" y1="11.8" x2="16.9" y2="13.9" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
      <line x1="5.1" y1="13.9" x2="7.2" y2="11.8" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
      <line x1="14.8" y1="6.2" x2="16.9" y2="4.1" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
    </g>
    <text x="554" y="152" text-anchor="middle" font-size="9.5" font-weight="600" fill="#5b21b6">Skills</text>

    <!-- Context bonus label -->
    <rect x="488" y="158" width="80" height="20" rx="6" fill="#ddd6fe" stroke="none"/>
    <text x="528" y="171" text-anchor="middle" font-size="9" font-weight="600" fill="#5b21b6" letter-spacing="0.5">加分项</text>

    <!-- ── Double arrow: loop ↔ context ── -->
    <line x1="432" y1="148" x2="466" y2="148"
          stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3"
          marker-start="url(#arr-purple-rev)"
          marker-end="url(#arr-purple)"/>
  </svg>
</div>

<!-- Requirements -->
<div class="reqs">
  <div class="section-label">必须实现</div>

  <div class="req-row">
    <span class="req-icon">💬</span>
    <div class="req-text">
      <strong>消息输入 → LLM 推理</strong>
      <span>用户发一条消息，LLM 能接收并生成推理结果</span>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">🛠️</span>
    <div class="req-text">
      <strong>Tool Call 执行</strong>
      <span>至少支持一个工具（Bash / Shell，根据操作系统选择）</span>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">🔁</span>
    <div class="req-text">
      <strong>循环直到完成</strong>
      <span>LLM 调用工具 → 获取结果 → 继续推理，直到输出最终回复</span>
    </div>
  </div>

  <div class="req-row">
    <span class="req-icon">✅</span>
    <div class="req-text">
      <strong>可对话验收</strong>
      <span>最终需能在网页、CLI 或任何界面中与 agent loop 真实对话</span>
    </div>
  </div>

  <div class="section-label">加分项</div>

  <div class="req-row bonus">
    <span class="req-icon">🧠</span>
    <div class="req-text">
      <strong>Memory</strong>
      <span>跨轮次记忆对话历史或用户偏好</span>
    </div>
  </div>

  <div class="req-row bonus">
    <span class="req-icon">⚙️</span>
    <div class="req-text">
      <strong>Skills / Multi-tool</strong>
      <span>支持多个工具，或将常用能力封装为可复用的 skill</span>
    </div>
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
