"use strict";
/**
 * BlessChat widget (compiled JS)
 * - Left-aligned bubbles
 * - Transparent input on hover/focus
 * - Robust streaming (works even if server lacks ndjson header)
 * - Sidthie options rendered as buttons (shown immediately after first user input)
 * - Dispatches `blessing:update` and also writes the reveal panel as fallback
 */
var BlessChat = (() => {
  /** Defaults */
  const DEFAULTS = {
    apiUrl: "https://bless-test-brown.vercel.app/api/chat",
    placeholder: "Talk to Sidthah",
    sendAriaLabel: "Send message",
    loadingText: "Listening...",
    requireBlessing: true
  };

  /** Sidthies canonical list */
  const SIDTHIES = [
    "Inner Strength (NALAMERA)",
    "Happiness (LUMASARA)",
    "Love (WELAMORA)",
    "Wisdom (NIRALUMA)",
    "Protection (RAKAWELA)",
    "Healing (OLANWELA)",
    "Peace (MORASARA)"
  ];

  /** Sanitize */
  function sanitizeString(value) {
    if (value === undefined || value === null) return undefined;
    const trimmed = value.toString().trim();
    if (!trimmed) return undefined;
    const lower = trimmed.toLowerCase();
    if (lower === "undefined" || lower === "null") return undefined;
    return trimmed;
  }

  /** CSS */
  const STYLE_BLOCK = `
:root{
  --bless-green-900: 23, 95, 75;
  --bless-green-500: 70, 136, 111;
  --bless-gold-400: 227, 216, 154;
  --bless-cream-100: 236, 227, 214;
}

.bless-chat-shell{
  width:min(820px,92vw);
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:1.75rem;
  font-family:'Albert Sans','Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:rgba(var(--bless-cream-100),0.92);
}

.bless-chat-window{
  position:relative;
  display:flex;
  flex-direction:column;
  gap:1.1rem;
  padding:clamp(1.75rem,3vw,2.4rem) clamp(1.5rem,3vw,2.8rem);
  border-radius:48px;
  background:linear-gradient(135deg, rgba(20,62,48,0.78), rgba(27,73,58,0.6));
  box-shadow:0 26px 70px rgba(0,0,0,0.45);
  backdrop-filter:blur(18px);
  border:1px solid rgba(var(--bless-gold-400),0.38);
  overflow:hidden;
}
.bless-chat-window::after{
  content:'';
  position:absolute;
  inset:12px;
  border-radius:36px;
  border:1px solid rgba(255,255,255,0.08); /* softened inner outline */
  pointer-events:none;
  opacity:0.6;
}

.bless-chat-messages{
  display:flex;
  flex-direction:column;
  gap:1.1rem;
  max-height:min(55vh,500px);
  overflow-y:auto;
  padding-right:0.5rem;
}
.bless-chat-messages::-webkit-scrollbar{ width:6px; }
.bless-chat-messages::-webkit-scrollbar-thumb{
  background:rgba(var(--bless-cream-100),0.35);
  border-radius:999px;
}

.bless-chat-bubble{
  position:relative;
  padding:1.65rem clamp(1.6rem,3.8vw,2.6rem);
  border-radius:42px;
  background:rgba(19,63,52,0.72);
  border:1px solid rgba(var(--bless-gold-400),0.4);
  box-shadow:0 18px 45px rgba(0,0,0,0.35);
  backdrop-filter:blur(14px);
  color:rgba(var(--bless-cream-100),0.96);
  font-size:clamp(1.02rem,1vw + 0.9rem,1.2rem);
  line-height:1.6;
  text-align:left; /* left align for readability */
}
.bless-chat-bubble--user{
  align-self:flex-end;
  background:linear-gradient(120deg, rgba(28,88,70,0.6), rgba(22,65,52,0.7));
  border:1px solid rgba(var(--bless-green-500),0.6);
  color:rgba(var(--bless-cream-100),0.9);
}
.bless-chat-bubble--status{
  text-align:center;
  font-size:0.95rem;
  color:rgba(var(--bless-cream-100),0.65);
  background:rgba(15,48,39,0.4);
  border:1px solid rgba(var(--bless-green-500),0.35);
}

.bless-chat-input-row{
  display:flex;
  gap:1rem;
  align-items:center;
}
.bless-chat-input-wrapper{
  flex:1;
  display:flex;
  align-items:center;
  border-radius:999px;
  border:1px solid rgba(var(--bless-green-500),0.55);
  background:linear-gradient(120deg, rgba(21,65,53,0.78), rgba(15,52,41,0.74));
  padding:0.4rem 0.4rem 0.4rem 1.4rem;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04);
}
.bless-chat-input{
  flex:1;
  border:none;
  background:transparent;
  color:rgba(var(--bless-cream-100),0.92);
  font-size:clamp(1.05rem,2vw,1.2rem);
  line-height:1.4;
  padding:0.75rem 0;
}
.bless-chat-input::placeholder{
  color:rgba(var(--bless-cream-100),0.45);
  opacity:1;
}
.bless-chat-input:hover,
.bless-chat-input:focus{
  outline:none !important;
  background:transparent !important;
  box-shadow:none !important;
}

.bless-chat-send{
  flex-shrink:0;
  width:64px;
  height:64px;
  border-radius:999px;
  border:none;
  background:radial-gradient(circle at 30% 30%, rgba(var(--bless-gold-400),0.95), rgba(var(--bless-gold-400),0.82));
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:transform 180ms ease, box-shadow 180ms ease;
  box-shadow:0 12px 32px rgba(0,0,0,0.32);
}
.bless-chat-send[disabled]{ cursor:not-allowed; opacity:0.7; transform:none; box-shadow:none; }
.bless-chat-send:hover:not([disabled]), .bless-chat-send:focus-visible:not([disabled]){
  transform:translateY(-2px);
  box-shadow:0 18px 40px rgba(0,0,0,0.4);
}
.bless-chat-send svg{ width:36px;height:20px; }

.bless-chat-error{
  margin-top:0.5rem;
  font-size:0.95rem;
  color:rgba(255,129,100,0.88);
  text-align:center;
}

@media (max-width:640px){
  .bless-chat-shell{ gap:1.25rem; }
  .bless-chat-window{ border-radius:32px; padding:1.4rem 1.3rem; }
  .bless-chat-window::after{ inset:8px; border-radius:26px; }
  .bless-chat-bubble{ border-radius:30px; padding:1.3rem 1.2rem; }
  .bless-chat-input-wrapper{ padding-left:1.1rem; }
  .bless-chat-send{ width:56px;height:56px; }
}





/* Options (Sidthies) */
.bless-chat-options{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:.5rem;
}
@media (max-width:640px){
  .bless-chat-options{ grid-template-columns:1fr; }
}

.bless-chat-option{
  display:block;
  padding:.8rem 1.2rem;            /* smaller buttons */
  border-radius:28px;
  background:rgba(19,63,52,.72);
  border:1px solid rgba(var(--bless-gold-400),.35);
  color:rgba(var(--bless-cream-100),.96);
  font-size:clamp(.95rem, .5vw + .9rem, 1.05rem);  /* smaller text */
  line-height:1.45;
  cursor:pointer;
  text-align:center;
}
.bless-chat-option:hover,.bless-chat-option:focus{
  background:rgba(19,63,52,.85);
}

 
  
  
  // Inject styles
  const styleEl = document.createElement("style");
  styleEl.textContent = STYLE_BLOCK;
  document.head.appendChild(styleEl);

  const SESSION_KEY = "bless-chat-blessing-created";

  /** Clean boilerplate fragments from LLM */
  const CLEAN_PATTERNS = [
    /Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,
    /How can I assist you with (them|it|the files?)\?.*$/gim,
    /Would you like me to search for specific information.*$/gim,
    /or summarize the content\?.*$/gim,
    /\【\d+:\d+†source\】/g,
    /To create a personalized blessing.*?providing the files?!?/gim,
    /and for providing the files?!?/gim,
    /you(?:'| )ve uploaded some files.*$/gim,
    /i (?:see|noticed) (?:you )?uploaded.*$/gim,
    /no image is needed.*$/gim
  ];
  function cleanAssistantText(message) {
    let cleaned = message ?? "";
    CLEAN_PATTERNS.forEach((p) => (cleaned = cleaned.replace(p, "")));
    return cleaned.trim();
  }

  /** Reveal helper (event + DOM fallback) */
  function revealBlessing(blessing) {
    try {
      window.dispatchEvent(new CustomEvent("blessing:update", {
        detail: { blessing, done: true }
      }));
    } catch {}
    const sel = [
      "[data-bless-panel]",
      ".bless-blessing__panel",
      "#bless-blessing__panel"
    ].join(",");
    document.querySelectorAll(sel).forEach((el) => {
      el.style.fontFamily = "'Cormorant Upright', serif";
      el.style.whiteSpace = "pre-line";
      el.style.textAlign = "center";
      el.style.color = "#fff";                      // white text
      el.style.fontSize = "clamp(18px, 2.4vw, 30px)"; // size of blessing font
      el.style.lineHeight = "1.35";
      el.style.textShadow = "0 2px 8px rgba(0,0,0,.55)";
      el.textContent = blessing;
    });
  }

  /** Heuristic extractor: five-line poem or explicit marker */
  function maybeExtractBlessing(text) {
    if (!text) return null;
    const marker = /\[\[BLESSING\]\]\s*([\s\S]+)/i.exec(text);
    if (marker && marker[1]) return marker[1].trim();
    // Try 4–6 short poetic lines (no colons) as blessing body
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const body = lines.filter(l => !/^(?:note:|explanation:|choose|select|option)/i.test(l));
    const poem = body.filter(l => !/:/.test(l));
    if (poem.length >= 4 && poem.length <= 6) return poem.slice(0,5).join("\n");
    return null;
  }

  /** Streaming detection: be permissive */
  function isProbablyStream(response) {
    const ct = (response.headers.get("Content-Type") || response.headers.get("content-type") || "").toLowerCase();
    if (/ndjson|stream|event-stream|octet-stream|text\/plain/.test(ct)) return true;
    return !!response.body; // readable body implies we can try streaming
  }

  /** Safe JSON clone */
  function safeJson(response) {
    return response.clone().json().catch(() => ({}));
  }

  /** Resolve config */
  function resolveContainerConfig(element) {
    const api = sanitizeString(element.dataset.apiUrl);
    const placeholder = sanitizeString(element.dataset.placeholder);
    const loading = sanitizeString(element.dataset.loadingText);
    return { apiUrl: api, placeholder, loadingText: loading };
  }

  /** UI icon */
  function svgArrow() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`;
  }

  /** Present Sidthies immediately (helper) */
  function presentIntents(widget, introText) {
    if (widget.state.showedIntents || widget.state.intentChosen) return;
    widget.state.showedIntents = true;
    if (introText) widget.appendMessage({ role: "assistant", content: introText });
    widget.createOptionsBubble(SIDTHIES, "");
  }

  /** Widget */
  class BlessChatWidget {
    constructor(container, options) {
      this.container = container;
      this.messages = [];
      this.isProcessing = false;
      this.blessingDelivered = getSessionFlag(SESSION_KEY) === "true";
      this.currentStreamingNode = null;
      this.currentStreamingText = "";
      this.state = {
        askedName:false, showedIntents:false, intentChosen:false,
        recipientAsked:false, storyAsked:false, creating:false, done:false
      };

      const merged = Object.assign({}, DEFAULTS, options || {});
      this.options = {
        apiUrl: sanitizeString(merged.apiUrl) ?? DEFAULTS.apiUrl,
        placeholder: sanitizeString(merged.placeholder) ?? DEFAULTS.placeholder,
        sendAriaLabel: sanitizeString(merged.sendAriaLabel) ?? DEFAULTS.sendAriaLabel,
        loadingText: sanitizeString(merged.loadingText) ?? DEFAULTS.loadingText,
        requireBlessing: merged.requireBlessing
      };
    }

    mount() {
      this.container.innerHTML = "";
      this.container.classList.add("bless-chat-shell");

      const windowEl = document.createElement("div");
      windowEl.className = "bless-chat-window";

      this.messageList = document.createElement("div");
      this.messageList.className = "bless-chat-messages";

      this.statusEl = document.createElement("div");
      this.statusEl.className = "bless-chat-bubble bless-chat-bubble--status";
      this.statusEl.hidden = true;

      this.errorEl = document.createElement("div");
      this.errorEl.className = "bless-chat-error";
      this.errorEl.hidden = true;

      const form = document.createElement("form");
      form.className = "bless-chat-input-row";

      const wrapper = document.createElement("div");
      wrapper.className = "bless-chat-input-wrapper";

      this.inputEl = document.createElement("input");
      this.inputEl.type = "text";
      this.inputEl.className = "bless-chat-input";
      this.inputEl.placeholder = this.options.placeholder;
      this.inputEl.autocomplete = "off";
      this.inputEl.spellcheck = false;
      this.inputEl.setAttribute("aria-label", this.options.placeholder);
      wrapper.appendChild(this.inputEl);

      this.sendBtn = document.createElement("button");
      this.sendBtn.type = "submit";
      this.sendBtn.className = "bless-chat-send";
      this.sendBtn.setAttribute("aria-label", this.options.sendAriaLabel);
      this.sendBtn.innerHTML = svgArrow();

      form.append(wrapper, this.sendBtn);

      form.addEventListener("submit", (e) => { e.preventDefault(); this.handleSubmit(); });

      windowEl.append(this.messageList, this.statusEl, form, this.errorEl);
      this.container.appendChild(windowEl);

      this.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.handleSubmit(); }
      });

      if (this.blessingDelivered) {
        this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below.");
      } else {
        this.startConversation();
      }
    }

    startConversation() { this.fetchAssistantReply(); }

    handleSubmit() {
      if (this.isProcessing) return;
      const value = (this.inputEl.value || "").trim();
      if (!value) { this.inputEl.reportValidity(); return; }
      if (this.blessingDelivered && this.options.requireBlessing) {
        this.pushAssistantMessage("Your blessing has been created. Scroll down to read it.");
        this.inputEl.value = "";
        return;
      }

      this.appendMessage({ role: "user", content: value });
      this.inputEl.value = "";
      this.messages.push({ role: "user", content: value });

      // Show buttons immediately after FIRST user input (don’t wait for LLM phrasing)
      const userCount = this.messages.filter(m => m.role === "user").length;
      if (userCount === 1 && !this.state.showedIntents && !this.state.intentChosen) {
        presentIntents(this, "Please choose one of the seven intentions:");
        return; // wait for button click
      }

      this.fetchAssistantReply();
    }

    appendMessage(message, isStreaming = false) {
      // Assistant: attempt to render intents as buttons whenever detected
      if (message.role === "assistant" && !isStreaming) {
        const payload = (message.content || "");
        const processed = payload
          .replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g, "\n$2. ") // normalize numbering
          .replace(/\s{2,}/g, " ")
          .trim();
        const lines = processed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        const hasAllNames = ["Inner Strength","Happiness","Love","Wisdom","Protection","Healing","Peace"]
          .every(n => payload.toLowerCase().includes(n.toLowerCase()));
        const optionLines = lines.filter(l => /^[1-7]\.\s+/.test(l) || /^(Inner Strength|Happiness|Love|Wisdom|Protection|Healing|Peace)/i.test(l));

        if ((hasAllNames || optionLines.length >= 7) && !this.state.showedIntents && !this.state.intentChosen) {
          const options = hasAllNames
            ? SIDTHIES
            : optionLines.slice(0,7).map(l => l.replace(/^[1-7]\.\s+/, "").trim());
          const introLines = lines.filter(l => !/^[1-7]\.\s+/.test(l));
          const intro = introLines.join(" ").trim();
          this.messages.push({ role: "assistant", content: payload });
          this.createOptionsBubble(options, intro);
          this.state.showedIntents = true;
          return;
        }
      }

      const bubble = document.createElement("div");
      bubble.className = "bless-chat-bubble";
      if (message.role === "user") bubble.classList.add("bless-chat-bubble--user");
      bubble.textContent = message.content || "";
      this.messageList.appendChild(bubble);
      this.scrollToBottom();

      if (message.role === "assistant" && isStreaming) {
        this.currentStreamingNode = bubble;
        this.currentStreamingText = message.content || "";
      }
    }

    createOptionsBubble(options, intro) {
      if (intro) {
        const introBubble = document.createElement("div");
        introBubble.className = "bless-chat-bubble";
        introBubble.textContent = intro;
        this.messageList.appendChild(introBubble);
      }
      const bubble = document.createElement("div");
      bubble.className = "bless-chat-bubble";
      const container = document.createElement("div");
      container.className = "bless-chat-options";
      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bless-chat-option";
        btn.textContent = opt;
        btn.addEventListener("click", () => {
          if (this.state.intentChosen) return;
          this.appendMessage({ role: "user", content: opt });
          this.messages.push({ role: "user", content: opt });
          this.state.intentChosen = true;
          container.querySelectorAll("button").forEach((b) => (b.disabled = true));
          this.fetchAssistantReply();
        });
        container.appendChild(btn);
      });
      bubble.appendChild(container);
      this.messageList.appendChild(bubble);
      this.scrollToBottom();
    }

    updateStreamingBubble(delta) {
      if (!this.currentStreamingNode) return;
      this.currentStreamingText += delta;
      this.currentStreamingNode.textContent = this.currentStreamingText;
      this.scrollToBottom();
    }

    finalizeStreamingBubble(finalText) {
      if (this.currentStreamingNode) {
        this.currentStreamingNode.textContent = (finalText || "").trim();
      }
      this.currentStreamingNode = null;
      this.currentStreamingText = "";
      this.scrollToBottom();
    }

    pushAssistantMessage(text) {
      const message = { role: "assistant", content: text };
      this.appendMessage(message);
      this.messages.push(message);
    }

    setStatus(text) {
      if (text) { this.statusEl.textContent = text; this.statusEl.hidden = false; }
      else { this.statusEl.hidden = true; }
    }

    setError(message) {
      if (message) { this.errorEl.textContent = message; this.errorEl.hidden = false; }
      else { this.errorEl.hidden = true; this.errorEl.textContent = ""; }
    }

    scrollToBottom() {
      requestAnimationFrame(() => { this.messageList.scrollTop = this.messageList.scrollHeight; });
    }

    fetchAssistantReply() {
      this.isProcessing = true;
      this.sendBtn.disabled = true;
      this.setError();
      this.setStatus(this.options.loadingText);

      const controller = new AbortController();

      fetch(this.options.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: this.messages }),
        signal: controller.signal
      })
      .then(async (response) => {
        this.setStatus();
        if (!response.ok) {
          const data = await safeJson(response);
          throw new Error(data?.error || `Request failed with status ${response.status}`);
        }

        // Try streaming first if possible (even without header)
        if (isProbablyStream(response)) {
          const used = await this.tryStream(response);
          if (used) return;
        }

        // Non-stream (or stream fallback)
        const data = await response.json().catch(() => ({}));
        const text = data?.message || "";
        const done = Boolean(data?.done);
        if (text) {
          const cleaned = cleanAssistantText(text);
          const payload = cleaned || text;
          this.appendMessage({ role: "assistant", content: payload });
          this.messages.push({ role: "assistant", content: payload });
          this.onAssistantComplete(payload, done);
        }
      })
      .catch((error) => {
        console.error("Bless chat error", error);
        this.setError(error?.message || "Something went wrong. Please try again.");
        this.pushAssistantMessage("I could not continue the conversation. Let us try once more when you are ready.");
      })
      .finally(() => {
        this.isProcessing = false;
        this.sendBtn.disabled = false;
      });
    }

    /** Streaming using permissive NDJSON reader; returns true if any tokens were received */
    async tryStream(response) {
      const reader = response.body?.getReader?.();
      if (!reader) return false;

      let gotAny = false;
      let doneFlag = false;
      let finalText = "";
      let aggregated = "";

      // Start streaming bubble
      this.appendMessage({ role: "assistant", content: "" }, true);

      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        gotAny = true;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const line = part.trim();
          if (!line) continue;
          let payload;
          try { payload = JSON.parse(line); } catch { continue; }

          if (payload.type === "response.delta" && typeof payload.delta === "string") {
            aggregated += payload.delta;
            this.updateStreamingBubble(payload.delta);
          } else if (payload.type === "response.output_text.delta" && typeof payload.textDelta === "string") {
            aggregated += payload.textDelta;
            this.updateStreamingBubble(payload.textDelta);
          } else if (payload.type === "response.message.delta" && typeof payload.delta === "string") {
            aggregated += payload.delta;
            this.updateStreamingBubble(payload.delta);
          } else if (payload.type === "meta" && typeof payload.done === "boolean") {
            doneFlag = payload.done;
          } else if (payload.type === "final" && typeof payload.text === "string") {
            finalText = payload.text;
            if (typeof payload.done === "boolean") doneFlag = payload.done;
          } else if (payload.type === "error") {
            throw new Error(payload.message || "Unexpected error");
          }
        }
      }

      const resolved = (finalText || aggregated).trim();
      if (!gotAny && !resolved) return false;

      const cleaned = cleanAssistantText(resolved);
      const output = cleaned || resolved;
      this.finalizeStreamingBubble(output);
      this.messages.push({ role: "assistant", content: output });
      this.onAssistantComplete(output, doneFlag);
      return true;
    }

    /** Completion handler: try to detect blessing even if backend didn't set done=true */
    onAssistantComplete(text, done) {
      if (!text) return;

      // Heuristic extraction if server didn't mark done
      let blessing = maybeExtractBlessing(text);

      if (done || blessing) {
        if (!blessing) blessing = maybeExtractBlessing(text);
        if (blessing) {
          this.blessingDelivered = true;
          try { sessionStorage.setItem(SESSION_KEY, "true"); } catch {}
          revealBlessing(blessing);

          // Replace last assistant bubble with a short notice
          const bubbles = Array.from(this.messageList.querySelectorAll(".bless-chat-bubble"));
          for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            if (!b.classList.contains("bless-chat-bubble--user")) {
              b.textContent = "Your blessing is ready. Scroll down to the Blessing Reveal to read it.";
              break;
            }
          }
          return;
        }
      }

      // Guard rails against weird detours (images, uploads, etc.)
      if (/image|upload|photo|picture/i.test(text)) {
        this.pushAssistantMessage("No image is needed. Let us continue in words.");
      }
    }
  }

  /** Helpers */
  function getSessionFlag(key) {
    try { return typeof sessionStorage !== "undefined" ? sessionStorage.getItem(key) : null; } catch { return null; }
  }

  /** Public mount */
  function mount(selector, options) {
    const target = selector
      ? document.querySelector(selector)
      : document.querySelector("[data-chat-container]");
    if (!target) { console.warn("BlessChat: target container not found."); return; }
    const config = Object.assign({}, resolveContainerConfig(target), options || {});
    const widget = new BlessChatWidget(target, config);
    widget.mount();
  }

  if (typeof window !== "undefined") {
    window.BlessChat = { mount };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => mount());
    } else {
      setTimeout(() => mount(), 0);
    }
  }

  return { mount };
})();
