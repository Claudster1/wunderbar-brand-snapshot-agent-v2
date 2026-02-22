/**
 * Wundy™ Chat Widget — Embeddable marketing chat for wunderbardigital.com
 *
 * Usage:
 *   <script
 *     src="https://YOUR_APP_DOMAIN/wundy-widget.js"
 *     data-api="https://YOUR_APP_DOMAIN/api/chat/marketing"
 *     data-key="YOUR_WIDGET_API_KEY"
 *     defer
 *   ></script>
 *
 * Optional attributes:
 *   data-position="right"  (or "left")
 *   data-greeting="Hi! I'm Wundy — your brand guide. What can I help you with?"
 *   data-accent="#07B0F2"
 */
(function () {
  "use strict";

  // ─── Configuration ────────────────────────────────────────────
  var script = document.currentScript || document.querySelector("script[data-api]");
  var API_URL = script && script.getAttribute("data-api");
  var API_KEY = (script && script.getAttribute("data-key")) || "";
  var POSITION = (script && script.getAttribute("data-position")) || "right";
  var GREETING =
    (script && script.getAttribute("data-greeting")) ||
    "Hi, I'm Wundy — your brand guide. Ask me anything about branding, our diagnostics, or how Wunderbar Digital can help.";
  var ACCENT = (script && script.getAttribute("data-accent")) || "#07B0F2";

  if (!API_URL) {
    console.warn("[Wundy Widget] Missing data-api attribute.");
    return;
  }

  // ─── Brand tokens ─────────────────────────────────────────────
  var NAVY = "#021859";
  var WHITE = "#FFFFFF";
  var LIGHT_BG = "#F4F7FB";
  var BORDER = "#D6DFE8";
  var SUB = "#5A6B7E";

  // ─── State ────────────────────────────────────────────────────
  var isOpen = false;
  var messages = [];
  var isLoading = false;

  // ─── Markdown-lite renderer ───────────────────────────────────
  function renderMarkdown(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:' + ACCENT + ';text-decoration:underline;">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br>");
  }

  // ─── Create DOM ───────────────────────────────────────────────
  var container = document.createElement("div");
  container.id = "wundy-widget-root";
  document.body.appendChild(container);

  // Shadow DOM for style isolation
  var shadow = container.attachShadow({ mode: "open" });

  var styles = document.createElement("style");
  styles.textContent = [
    "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",

    // Bubble button
    ".wundy-bubble {",
    "  position: fixed; bottom: 24px; " + POSITION + ": 24px; z-index: 99999;",
    "  width: 60px; height: 60px; border-radius: 50%;",
    "  background: " + NAVY + "; color: " + WHITE + ";",
    "  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;",
    "  box-shadow: 0 4px 20px rgba(2,24,89,0.3); transition: transform 0.2s, box-shadow 0.2s;",
    "  font-family: 'Lato', system-ui, -apple-system, sans-serif;",
    "}",
    ".wundy-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(2,24,89,0.4); }",
    ".wundy-bubble svg { width: 28px; height: 28px; fill: " + WHITE + "; }",
    ".wundy-bubble .close-icon { display: none; }",
    ".wundy-bubble.open .chat-icon { display: none; }",
    ".wundy-bubble.open .close-icon { display: block; }",

    // Notification dot
    ".wundy-dot {",
    "  position: absolute; top: -2px; right: -2px; width: 14px; height: 14px;",
    "  background: " + ACCENT + "; border-radius: 50%; border: 2px solid " + WHITE + ";",
    "  animation: wundy-pulse 2s infinite;",
    "}",
    ".wundy-bubble.open .wundy-dot { display: none; }",
    "@keyframes wundy-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }",

    // Chat panel
    ".wundy-panel {",
    "  position: fixed; bottom: 100px; " + POSITION + ": 24px; z-index: 99998;",
    "  width: 380px; max-width: calc(100vw - 32px); height: 520px; max-height: calc(100vh - 140px);",
    "  background: " + WHITE + "; border-radius: 16px;",
    "  box-shadow: 0 12px 48px rgba(2,24,89,0.18); border: 1px solid " + BORDER + ";",
    "  display: none; flex-direction: column; overflow: hidden;",
    "  font-family: 'Lato', system-ui, -apple-system, sans-serif;",
    "  animation: wundy-slide-up 0.25s ease-out;",
    "}",
    ".wundy-panel.open { display: flex; }",
    "@keyframes wundy-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }",

    // Header
    ".wundy-header {",
    "  background: " + NAVY + "; padding: 16px 20px; display: flex; align-items: center; gap: 12px;",
    "  flex-shrink: 0;",
    "}",
    ".wundy-avatar {",
    "  width: 36px; height: 36px; border-radius: 50%; background: " + ACCENT + ";",
    "  display: flex; align-items: center; justify-content: center; flex-shrink: 0;",
    "  font-weight: 800; font-size: 16px; color: " + WHITE + ";",
    "}",
    ".wundy-header-text h3 { color: " + WHITE + "; font-size: 15px; font-weight: 700; line-height: 1.2; }",
    ".wundy-header-text p { color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 1px; }",

    // Messages
    ".wundy-messages {",
    "  flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;",
    "  background: " + LIGHT_BG + ";",
    "}",
    ".wundy-messages::-webkit-scrollbar { width: 4px; }",
    ".wundy-messages::-webkit-scrollbar-thumb { background: " + BORDER + "; border-radius: 2px; }",
    ".wundy-msg {",
    "  max-width: 85%; padding: 10px 14px; border-radius: 12px;",
    "  font-size: 13.5px; line-height: 1.55; word-break: break-word;",
    "}",
    ".wundy-msg p { margin-bottom: 8px; }",
    ".wundy-msg p:last-child { margin-bottom: 0; }",
    ".wundy-msg a { color: " + ACCENT + "; text-decoration: underline; }",
    ".wundy-msg a:hover { opacity: 0.8; }",
    ".wundy-msg.assistant {",
    "  background: " + WHITE + "; color: " + NAVY + "; align-self: flex-start;",
    "  border: 1px solid " + BORDER + "; border-bottom-left-radius: 4px;",
    "}",
    ".wundy-msg.user {",
    "  background: " + NAVY + "; color: " + WHITE + "; align-self: flex-end;",
    "  border-bottom-right-radius: 4px;",
    "}",

    // Typing indicator
    ".wundy-typing { display: flex; gap: 4px; padding: 12px 14px; align-self: flex-start; }",
    ".wundy-typing span {",
    "  width: 7px; height: 7px; border-radius: 50%; background: " + SUB + ";",
    "  animation: wundy-bounce 1.4s infinite both;",
    "}",
    ".wundy-typing span:nth-child(2) { animation-delay: 0.16s; }",
    ".wundy-typing span:nth-child(3) { animation-delay: 0.32s; }",
    "@keyframes wundy-bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }",

    // Input area
    ".wundy-input-area {",
    "  padding: 12px 16px; border-top: 1px solid " + BORDER + "; background: " + WHITE + ";",
    "  display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;",
    "}",
    ".wundy-textarea {",
    "  flex: 1; border: 1px solid " + BORDER + "; border-radius: 10px; padding: 10px 14px;",
    "  font-size: 13.5px; font-family: inherit; resize: none; outline: none;",
    "  max-height: 100px; min-height: 40px; line-height: 1.4; color: " + NAVY + ";",
    "  background: " + LIGHT_BG + ";",
    "}",
    ".wundy-textarea:focus { border-color: " + ACCENT + "; background: " + WHITE + "; }",
    ".wundy-textarea::placeholder { color: " + SUB + "; }",
    ".wundy-send {",
    "  width: 38px; height: 38px; border-radius: 10px; border: none;",
    "  background: " + NAVY + "; color: " + WHITE + "; cursor: pointer;",
    "  display: flex; align-items: center; justify-content: center; flex-shrink: 0;",
    "  transition: background 0.15s;",
    "}",
    ".wundy-send:hover { background: " + ACCENT + "; }",
    ".wundy-send:disabled { opacity: 0.4; cursor: not-allowed; }",
    ".wundy-send svg { width: 18px; height: 18px; fill: " + WHITE + "; }",

    // Branding footer
    ".wundy-footer {",
    "  text-align: center; padding: 6px; font-size: 10px; color: " + SUB + ";",
    "  background: " + WHITE + "; border-top: 1px solid " + BORDER + "; flex-shrink: 0;",
    "}",
    ".wundy-footer a { color: " + SUB + "; text-decoration: none; }",
    ".wundy-footer a:hover { color: " + NAVY + "; }",

    // Mobile
    "@media (max-width: 480px) {",
    "  .wundy-panel { width: calc(100vw - 16px); " + POSITION + ": 8px; bottom: 92px; height: calc(100vh - 120px); border-radius: 12px; }",
    "  .wundy-bubble { bottom: 16px; " + POSITION + ": 16px; width: 54px; height: 54px; }",
    "}",
  ].join("\n");
  shadow.appendChild(styles);

  // Panel HTML
  var panel = document.createElement("div");
  panel.className = "wundy-panel";
  panel.innerHTML = [
    '<div class="wundy-header">',
    '  <div class="wundy-avatar">W</div>',
    "  <div class=\"wundy-header-text\">",
    "    <h3>Wundy\u2122</h3>",
    "    <p>Your brand guide</p>",
    "  </div>",
    "</div>",
    '<div class="wundy-messages" id="wundy-messages"></div>',
    '<div class="wundy-input-area">',
    '  <textarea class="wundy-textarea" id="wundy-input" placeholder="Ask me anything about branding..." rows="1"></textarea>',
    '  <button class="wundy-send" id="wundy-send" aria-label="Send">',
    '    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    "  </button>",
    "</div>",
    '<div class="wundy-footer">',
    '  Powered by <a href="https://wunderbardigital.com?utm_source=marketing_widget&utm_medium=chat_widget&utm_campaign=branding&utm_content=powered_by" target="_blank" rel="noopener">Wunderbar Digital</a>',
    "</div>",
  ].join("\n");
  shadow.appendChild(panel);

  // Bubble button
  var bubble = document.createElement("button");
  bubble.className = "wundy-bubble";
  bubble.setAttribute("aria-label", "Chat with Wundy");
  bubble.innerHTML = [
    '<span class="wundy-dot"></span>',
    '<svg class="chat-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',
    '<svg class="close-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  ].join("");
  shadow.appendChild(bubble);

  // ─── Element refs ─────────────────────────────────────────────
  var messagesEl = shadow.getElementById("wundy-messages");
  var inputEl = shadow.getElementById("wundy-input");
  var sendBtn = shadow.getElementById("wundy-send");

  // ─── Render messages ──────────────────────────────────────────
  function renderMessages() {
    var html = "";
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      html +=
        '<div class="wundy-msg ' +
        m.role +
        '"><p>' +
        renderMarkdown(m.content) +
        "</p></div>";
    }
    if (isLoading) {
      html += '<div class="wundy-typing"><span></span><span></span><span></span></div>';
    }
    messagesEl.innerHTML = html;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ─── Send message ─────────────────────────────────────────────
  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || isLoading) return;

    messages.push({ role: "user", content: text });
    inputEl.value = "";
    inputEl.style.height = "40px";
    isLoading = true;
    sendBtn.disabled = true;
    renderMessages();

    var headers = { "Content-Type": "application/json" };
    if (API_KEY) headers["X-Widget-Key"] = API_KEY;

    fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ messages: messages }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        isLoading = false;
        sendBtn.disabled = false;
        if (data.content) {
          messages.push({ role: "assistant", content: data.content });
        } else if (data.error) {
          messages.push({
            role: "assistant",
            content: "Sorry, something went wrong. Please try again in a moment.",
          });
        }
        renderMessages();
      })
      .catch(function () {
        isLoading = false;
        sendBtn.disabled = false;
        messages.push({
          role: "assistant",
          content: "Sorry, I couldn't connect. Please check your internet connection and try again.",
        });
        renderMessages();
      });
  }

  // ─── Toggle panel ─────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    bubble.classList.toggle("open", isOpen);
    if (isOpen) {
      if (messages.length === 0) {
        messages.push({ role: "assistant", content: GREETING });
        renderMessages();
      }
      setTimeout(function () {
        inputEl.focus();
      }, 100);
    }
  }

  // ─── Event listeners ──────────────────────────────────────────
  bubble.addEventListener("click", toggle);
  sendBtn.addEventListener("click", sendMessage);

  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener("input", function () {
    inputEl.style.height = "40px";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + "px";
  });
})();
