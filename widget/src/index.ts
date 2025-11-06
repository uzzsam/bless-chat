/*
  Bless chat widget: mounts into a container that has data-chat-container attribute.
  FIXED: Removed email capture from chat flow, simplified loading states, updated blessing messages
*/

type Role = 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
}

interface WidgetOptions {
  apiUrl?: string;
  placeholder?: string;
  sendAriaLabel?: string;
  loadingText?: string;
  requireBlessing?: boolean;
}

interface StreamMeta {
  state?: string;
  sidthieKey?: string | null;
  sidthieLabel?: string | null;
  userName?: string | null;
  marker?: string | null;
  done?: boolean;
  messageCount?: number;
}

const DEFAULTS: Required<WidgetOptions> = {
  apiUrl: 'https://bless-test-brown.vercel.app/api/chat',
  placeholder: 'Talk to Sidthah',
  sendAriaLabel: 'Send message',
  loadingText: 'Listening...',
  requireBlessing: true,
};

function sanitizeString(value?: string | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.toString().trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower === 'undefined' || lower === 'null') return undefined;
  return trimmed;
}

function parseBooleanDataset(value?: string | null): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  const normalized = value.toString().trim().toLowerCase();
  if (!normalized) return true;
  if (['false', '0', 'no', 'off', 'disabled'].includes(normalized)) return false;
  if (['true', '1', 'yes', 'on', 'enabled'].includes(normalized)) return true;
  return undefined;
}

// Base styles for the chat widget
const STYLE_BLOCK = `
:root {
  --bless-green-900: 23, 95, 75;
  --bless-green-500: 70, 136, 111;
  --bless-gold-400: 227, 216, 154;
  --bless-cream-100: 236, 227, 214;
  --bless-chat-max-width: 820px;
  --bless-chat-radius: 48px;
}

.bless-chat-shell {
  width: 100%;
  max-width: min(var(--bless-chat-max-width), 92vw);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  font-family: 'Albert Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: rgba(var(--bless-cream-100), 0.92);
}

.bless-chat-window {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: clamp(1.75rem, 3vw, 2.4rem) clamp(1.5rem, 3vw, 2.8rem);
  border-radius: var(--bless-chat-radius);
  background: transparent;
  box-shadow: none;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.18);
  overflow: hidden;
}

.bless-chat-window::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: calc(var(--bless-chat-radius) - 12px);
  border: 1px solid rgba(255,255,255,0.12);
  pointer-events: none;
  opacity: 0.6;
}

.bless-chat-messages {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  max-height: min(55vh, 500px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.bless-chat-messages::-webkit-scrollbar {
  width: 6px;
}

.bless-chat-messages::-webkit-scrollbar-thumb {
  background: rgba(var(--bless-cream-100),0.35);
  border-radius: 999px;
}

.bless-chat-bubble {
  position: relative;
  padding: 1.65rem clamp(1.6rem, 3.8vw, 2.6rem);
  border-radius: 42px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.24);
  box-shadow: none;
  backdrop-filter: blur(4px);
  color: rgba(var(--bless-cream-100), 0.96);
  font-size: clamp(1.02rem, 1vw + 0.9rem, 1.2rem);
  line-height: 1.6;
  text-align: left;
  white-space: pre-line;
}

.bless-chat-bubble--user {
  align-self: flex-end;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.28);
  color: rgba(var(--bless-cream-100), 0.92);
}

.bless-chat-bubble--status {
  text-align: center;
  font-size: 0.95rem;
  color: rgba(var(--bless-cream-100), 0.65);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.16);
}

/* Streaming cursor effect */
.bless-chat-bubble--streaming::after {
  content: '▊';
  animation: bless-cursor-blink 1s infinite;
  color: rgba(var(--bless-cream-100), 0.5);
  margin-left: 2px;
}

@keyframes bless-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.bless-chat-input-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.bless-chat-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.22);
  background: transparent;
  padding: 0.4rem 0.4rem 0.4rem 1.4rem;
  box-shadow: none;
}

.bless-chat-input {
  flex: 1;
  border: none;
  background: transparent;
  color: rgba(var(--bless-cream-100), 0.92);
  font-size: clamp(1.05rem, 2vw, 1.2rem);
  line-height: 1.4;
  padding: 0.75rem 0;
  background-color: transparent !important;
  box-shadow: none !important;
}

.bless-chat-input::placeholder {
  color: rgba(var(--bless-cream-100), 0.45);
  opacity: 1;
}

.bless-chat-input:focus {
  outline: none;
  background-color: transparent !important;
  box-shadow: none !important;
}

.bless-chat-input:hover,
.bless-chat-input:focus {
  background-color: transparent !important;
  box-shadow: none !important;
}

.bless-chat-send {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: none;
  background: radial-gradient(circle at 30% 30%, rgba(var(--bless-gold-400),0.95), rgba(var(--bless-gold-400),0.82));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease;
  box-shadow: 0 12px 32px rgba(0,0,0,0.32);
}

.bless-chat-send[disabled] {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.bless-chat-send:hover:not([disabled]),
.bless-chat-send:focus-visible:not([disabled]) {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(0,0,0,0.4);
}

.bless-chat-send svg {
  width: 36px;
  height: 20px;
}

.bless-chat-error {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: rgba(255, 129, 100, 0.88);
  text-align: center;
}

/* Retry button */
.bless-chat-retry {
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  border: none;
  background: rgba(var(--bless-gold-400), 0.92);
  color: rgb(var(--bless-green-900));
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  margin: 1rem auto;
  display: block;
  transition: transform 180ms ease;
}

.bless-chat-retry:hover {
  transform: translateY(-2px);
}

/* Sidthie option buttons */
.bless-chat-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem 0.75rem;
}

.bless-chat-option {
  display: block;
  padding: 0.85rem clamp(1.2rem, 2.6vw, 1.9rem);
  border-radius: 32px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.24);
  color: rgba(var(--bless-cream-100), 0.96);
  font-size: clamp(0.92rem, 0.7vw + 0.82rem, 1.05rem);
  line-height: 1.45;
  cursor: pointer;
  text-align: center;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
}

.bless-chat-option:hover,
.bless-chat-option:focus {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.35);
}

.bless-chat-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* FIXED: Simplified loading indicator - only one style */
.bless-chat-bubble--status.is-typing {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bless-typing {
  display: inline-flex;
  gap: 0.35rem;
}

.bless-typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(var(--bless-cream-100), 0.75);
  animation: bless-dot 900ms ease-in-out infinite alternate;
}

.bless-typing span:nth-child(2) {
  animation-delay: 120ms;
}

.bless-typing span:nth-child(3) {
  animation-delay: 240ms;
}

@keyframes bless-dot {
  from {
    opacity: 0.35;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (max-width: 640px) {
  .bless-chat-shell {
    gap: 1.25rem;
  }

  .bless-chat-window {
    border-radius: 32px;
    padding: 1.4rem 1.3rem;
  }

  .bless-chat-window::after {
    inset: 8px;
    border-radius: 26px;
  }

  .bless-chat-bubble {
    border-radius: 30px;
    padding: 1.3rem 1.2rem;
  }

  .bless-chat-input-wrapper {
    padding-left: 1.1rem;
  }

  .bless-chat-send {
    width: 56px;
    height: 56px;
  }

  .bless-chat-options {
    grid-template-columns: 1fr;
  }
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = STYLE_BLOCK;
document.head.appendChild(styleEl);

interface SidthieMeta {
  key: string;
  label: string;
  short: string;
  description: string;
}

// Updated Sidthie metadata with new names
const SIDTHIE_META: Record<string, SidthieMeta> = {
  NALAMERA: {
    key: 'NALAMERA',
    label: 'Inner Strength',
    short: 'A steady courage that rises quietly from within.',
    description:
      'Nalamera steadies the breath and roots the heart; she carries the quiet strength that holds families together when storms arrive.',
  },
  LUMASARA: {
    key: 'LUMASARA',
    label: 'Happiness',
    short: 'A soft, luminous joy that brightens the ordinary.',
    description:
      'Lumasara brightens every ordinary moment with the glow of celebration, inviting laughter to linger like sunlight through leaves.',
  },
  WELAMORA: {
    key: 'WELAMORA',
    label: 'Love',
    short: 'A tender presence that listens and embraces.',
    description:
      'Welamora listens with the whole heart, weaving warmth and devotion so love can be felt in every touch and every word.',
  },
  NIRALUMA: {
    key: 'NIRALUMA',
    label: 'Bliss',
    short: 'A calm clarity that sees the path with kindness.',
    description:
      'Niraluma pours lantern-light across the path ahead, offering gentle bliss and serene grace to every decision you make.',
  },
  OLANWELA: {
    key: 'OLANWELA',
    label: 'Health',
    short: 'A quiet mending that restores balance and breath.',
    description:
      'Olanwela soothes weary hearts and tired bones, bathing the spirit in cool rivers of renewal and vital health.',
  },
  RAKAWELA: {
    key: 'RAKAWELA',
    label: 'Peace',
    short: 'A gentle guard that shelters what is precious.',
    description:
      'Rakawela stands as a quiet guardian, wrapping loved ones in peaceful kindness and turning away every shadow that approaches.',
  },
  MORASARA: {
    key: 'MORASARA',
    label: 'Fortune',
    short: 'A stillness that settles and softens the heart.',
    description:
      'Morasara settles like evening mist, inviting deep breaths, calm conversations, and the promise of good fortune wherever you stand.',
  },
};

const SIDTHIE_VALUES = Object.values(SIDTHIE_META);

function findSidthieByKey(key?: string | null): SidthieMeta | null {
  if (!key) return null;
  const upper = key.toUpperCase();
  return SIDTHIE_META[upper] ?? null;
}

function findSidthieByLabel(text?: string | null): SidthieMeta | null {
  if (!text) return null;
  const trimmed = text.trim().toLowerCase();
  return (
    SIDTHIE_VALUES.find((meta) => meta.label.toLowerCase() === trimmed) ??
    SIDTHIE_VALUES.find((meta) => trimmed.includes(meta.label.toLowerCase())) ??
    null
  );
}

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

const SESSION_KEY = 'bless-chat-blessing-created';

const CLEAN_PATTERNS: RegExp[] = [
  /Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,
  /How can I assist you with (them|it|the files?)\?.*$/gim,
  /Would you like me to search for specific information.*$/gim,
  /or summarize the content\?.*$/gim,
  /\【\d+:\d+†source\】/g,
  /To create a personalized blessing.*?providing the files?!?/gim,
  /and for providing the files?!?/gim
];

function cleanAssistantText(message: string) {
  let cleaned = message ?? '';
  CLEAN_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });
  return cleaned.trim();
}

function getSessionFlag(key: string) {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function setSessionFlag(key: string, value: string) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  } catch {
    /* ignore storage errors */
  }
}

function revealBlessing(blessing: string) {
  const sel = [
    '[data-bless-panel]',
    '.bless-blessing__panel',
    '#bless-blessing__panel'
  ].join(',');

  document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    el.style.fontFamily = "'Cormorant Upright', serif";
    el.style.whiteSpace = 'pre-line';
    el.style.textAlign = 'center';
    el.style.color = '#fff';
    el.style.fontSize = 'clamp(18px, 2.4vw, 30px)';
    el.style.lineHeight = '1.35';
    el.style.textShadow = '0 2px 8px rgba(0,0,0,.55)';
    el.textContent = blessing;
  });
}

function parseSidthieOptions(payload: string | undefined | null) {
  if (!payload) return null;
  const processed = payload
    .replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g, '\n$2. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const lines = processed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const optionLines = lines.filter((line) => /^[1-7]\.\s*/.test(line));
  if (optionLines.length < 7) return null;
  const introLines = lines.filter((line) => !/^[1-7]\.\s*/.test(line));
  const intro = introLines.join(' ').trim();
  const hasAll = SIDTHIE_VALUES.every((meta) => {
    const lower = processed.toLowerCase();
    return lower.includes(meta.label.toLowerCase()) || processed.includes(`(${meta.key})`);
  });
  if (!hasAll) return null;
  const options = SIDTHIE_VALUES.map((meta) => `${meta.label} (${meta.key})`);
  return { intro, options, metas: SIDTHIE_VALUES };
}

function resolveSidthieFromOption(option: string): SidthieMeta | null {
  if (!option) return null;
  const keyMatch = option.match(/\(([A-Za-z]+)\)\s*$/);
  if (keyMatch) {
    const meta = findSidthieByKey(keyMatch[1]);
    if (meta) return meta;
  }
  const label = option.replace(/\([^)]*\)/g, '').trim();
  return findSidthieByLabel(label);
}

class BlessChatWidget {
  private container: HTMLElement;
  private options: Required<WidgetOptions>;
  private messages: Message[] = [];
  private isProcessing = false;
  private blessingDelivered = false;

  private messageList!: HTMLElement;
  private inputEl!: HTMLInputElement;
  private sendBtn!: HTMLButtonElement;
  private statusEl!: HTMLElement;
  private errorEl!: HTMLElement;
  private currentStreamingNode: HTMLDivElement | null = null;
  private currentStreamingText = '';
  private activeSidthie: SidthieMeta | null = null;
  private lastExplanation = '';
  
  // Daily limits
  private blessingCount: number = 0;
  private readonly MAX_BLESSINGS = 3;
  private readonly STORAGE_KEY = 'bless-chat-session-count';

  constructor(container: HTMLElement, options?: WidgetOptions) {
    this.container = container;
    const merged = { ...DEFAULTS, ...(options || {}) };
    this.options = {
      apiUrl: sanitizeString(merged.apiUrl) ?? DEFAULTS.apiUrl,
      placeholder: sanitizeString(merged.placeholder) ?? DEFAULTS.placeholder,
      sendAriaLabel: sanitizeString(merged.sendAriaLabel) ?? DEFAULTS.sendAriaLabel,
      loadingText: sanitizeString(merged.loadingText) ?? DEFAULTS.loadingText,
      requireBlessing: merged.requireBlessing
    };
    this.blessingDelivered = getSessionFlag(SESSION_KEY) === 'true';
    this.blessingCount = this.getBlessingCount();
    
    if (!this.options.requireBlessing && this.blessingDelivered) {
      this.blessingDelivered = false;
    }
  }
  
  // Blessing count helpers
  private getBlessingCount(): number {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  private incrementBlessingCount(): void {
    this.blessingCount += 1;
    try {
      sessionStorage.setItem(this.STORAGE_KEY, this.blessingCount.toString());
    } catch {
      // Ignore storage errors
    }
  }

  private hasReachedLimit(): boolean {
    return this.blessingCount >= this.MAX_BLESSINGS;
  }
  
  private showLimitReached() {
    this.pushAssistantMessage(
      `Three blessings daily allows each to settle deeply. You have received ${this.blessingCount} blessing${this.blessingCount > 1 ? 's' : ''} this session. Close your browser to begin a new session, or return tomorrow for fresh blessings.`
    );
    this.inputEl.disabled = true;
    this.sendBtn.disabled = true;
  }

  mount() {
    const widthAttr = sanitizeString(this.container.dataset.chatWidth);
    if (widthAttr) {
      this.container.style.setProperty('--bless-chat-max-width', widthAttr);
    }
    const radiusAttr = sanitizeString(this.container.dataset.chatRadius);
    if (radiusAttr) {
      this.container.style.setProperty('--bless-chat-radius', radiusAttr);
    }

    this.container.innerHTML = '';
    this.container.classList.add('bless-chat-shell');

    const windowEl = document.createElement('div');
    windowEl.className = 'bless-chat-window';

    this.messageList = document.createElement('div');
    this.messageList.className = 'bless-chat-messages';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'bless-chat-bubble bless-chat-bubble--status';
    this.statusEl.hidden = true;

    this.errorEl = document.createElement('div');
    this.errorEl.className = 'bless-chat-error';
    this.errorEl.hidden = true;

    const form = document.createElement('form');
    form.className = 'bless-chat-input-row';

    const wrapper = document.createElement('div');
    wrapper.className = 'bless-chat-input-wrapper';

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.className = 'bless-chat-input';
    this.inputEl.placeholder = this.options.placeholder;
    this.inputEl.autocomplete = 'off';
    this.inputEl.spellcheck = false;
    this.inputEl.setAttribute('aria-label', this.options.placeholder);

    wrapper.appendChild(this.inputEl);

    this.sendBtn = document.createElement('button');
    this.sendBtn.type = 'submit';
    this.sendBtn.className = 'bless-chat-send';
    this.sendBtn.setAttribute('aria-label', this.options.sendAriaLabel);
    this.sendBtn.innerHTML = svgArrow();

    form.append(wrapper, this.sendBtn);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit();
    });

    this.messageList.addEventListener('scroll', () => {
      if (this.messageList.scrollTop === 0) {
        this.messageList.classList.add('scrolled-top');
      } else {
        this.messageList.classList.remove('scrolled-top');
      }
    });

    windowEl.append(this.messageList, this.statusEl, form, this.errorEl);
    this.container.appendChild(windowEl);

    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.handleSubmit();
      }
    });

    // Check conditions before starting
    if (this.blessingDelivered && this.options.requireBlessing) {
      this.pushAssistantMessage('Your blessing has already been crafted. Scroll to revisit it below.');
    } else if (this.hasReachedLimit()) {
      this.showLimitReached();
    } else {
      if (!this.options.requireBlessing) {
        setSessionFlag(SESSION_KEY, 'false');
      }
      this.startConversation();
    }
  }

  private async startConversation() {
    this.activeSidthie = null;
    this.lastExplanation = '';
    await this.fetchAssistantReply();
  }

  private async handleSubmit() {
    if (this.isProcessing) return;

    const value = this.inputEl.value.trim();
    if (!value) {
      this.inputEl.reportValidity();
      return;
    }

    if (this.blessingDelivered && this.options.requireBlessing) {
      this.pushAssistantMessage('Your blessing has been created. Scroll down to read it.');
      this.inputEl.value = '';
      return;
    }

    this.appendMessage({ role: 'user', content: value });
    this.inputEl.value = '';
    this.messages.push({ role: 'user', content: value });
    await this.fetchAssistantReply();
  }

  private appendMessage(message: Message, isStreaming = false) {
    if (message.role === 'assistant' && !isStreaming) {
      this.captureExplanation(message.content);
      const parsed = parseSidthieOptions(message.content);
      if (parsed) {
        this.messages.push({ role: 'assistant', content: message.content });
        this.createOptionsBubble(parsed.options, parsed.intro, parsed.metas);
        return;
      }
    }

    const bubble = document.createElement('div');
    bubble.className = 'bless-chat-bubble';
    if (message.role === 'user') {
      bubble.classList.add('bless-chat-bubble--user');
    }

    bubble.textContent = message.content;
    this.messageList.appendChild(bubble);
    this.scrollToBottom();

    if (message.role === 'assistant' && isStreaming) {
      bubble.classList.add('bless-chat-bubble--streaming');
      this.currentStreamingNode = bubble;
      this.currentStreamingText = message.content;
    }
  }

  private captureExplanation(text?: string) {
    if (!text) return;
    const lines = text.split('\n\n');
    if (lines.length > 0) {
      const firstParagraph = lines[0].trim();
      if (firstParagraph.length > 30 && firstParagraph.length < 300) {
        this.lastExplanation = firstParagraph;
      }
    }
  }

  private createOptionsBubble(options: string[], intro: string, metas?: SidthieMeta[]) {
    this.activeSidthie = null;

    if (intro) {
      const introBubble = document.createElement('div');
      introBubble.className = 'bless-chat-bubble';
      introBubble.textContent = intro;
      this.messageList.appendChild(introBubble);
      this.scrollToBottom();
    }

    const bubble = document.createElement('div');
    bubble.className = 'bless-chat-bubble';
    const container = document.createElement('div');
    container.className = 'bless-chat-options';
    
    options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bless-chat-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        const meta = metas?.[index] ?? resolveSidthieFromOption(opt);
        if (meta) {
          this.activeSidthie = meta;
          try {
            window.dispatchEvent(
              new CustomEvent('sidthie:selected', {
                detail: { sidthie: meta.key, sidthieLabel: meta.label },
              })
            );
          } catch {
            /* ignore dispatch errors */
          }
        }
        this.appendMessage({ role: 'user', content: opt });
        this.messages.push({ role: 'user', content: opt });
        container.querySelectorAll('button').forEach((b) => {
          (b as HTMLButtonElement).disabled = true;
        });
        this.fetchAssistantReply();
      });
      container.appendChild(btn);
    });
    
    bubble.appendChild(container);
    this.messageList.appendChild(bubble);
    this.scrollToBottom();
  }

  private updateStreamingBubble(delta: string) {
    if (!this.currentStreamingNode) return;
    this.currentStreamingText += delta;
    // True token streaming - display immediately as received
    this.currentStreamingNode.textContent = this.currentStreamingText;
    this.scrollToBottom();
  }

  private finalizeStreamingBubble(finalText: string) {
    if (this.currentStreamingNode) {
      this.currentStreamingNode.classList.remove('bless-chat-bubble--streaming');
      
      const parsed = parseSidthieOptions(finalText);
      if (parsed) {
        this.messageList.removeChild(this.currentStreamingNode);
        this.currentStreamingNode = null;
        this.currentStreamingText = '';
        this.createOptionsBubble(parsed.options, parsed.intro);
        return;
      }
      
      this.currentStreamingNode.textContent = finalText.trim();
    }
    this.currentStreamingNode = null;
    this.currentStreamingText = '';
    this.scrollToBottom();
  }

  private pushAssistantMessage(text: string) {
    const message = { role: 'assistant', content: text } as Message;
    this.appendMessage(message);
    this.messages.push(message);
  }

  private setStatus(text?: string, typing = false) {
    if (text) {
      if (typing) {
        this.statusEl.innerHTML =
          '<span class="bless-typing" aria-hidden="true"><span></span><span></span><span></span></span>';
        this.statusEl.classList.add('is-typing');
        this.statusEl.setAttribute('aria-label', text);
      } else {
        this.statusEl.textContent = text;
        this.statusEl.classList.remove('is-typing');
        this.statusEl.removeAttribute('aria-label');
      }
      this.statusEl.hidden = false;
    } else {
      this.statusEl.hidden = true;
      this.statusEl.classList.remove('is-typing');
      this.statusEl.innerHTML = '';
      this.statusEl.removeAttribute('aria-label');
    }
  }

  private setError(message?: string) {
    if (message) {
      this.errorEl.textContent = message;
      this.errorEl.hidden = false;
    } else {
      this.errorEl.hidden = true;
      this.errorEl.textContent = '';
    }
  }

  private scrollToBottom() {
    requestAnimationFrame(() => {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    });
  }
  
  // Retry button helper
  private showRetryButton() {
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'bless-chat-retry';
    retryBtn.textContent = 'Try again';
    retryBtn.addEventListener('click', () => {
      retryBtn.remove();
      this.fetchAssistantReply();
    });
    this.messageList.appendChild(retryBtn);
    this.scrollToBottom();
  }

  private async fetchAssistantReply() {
    this.isProcessing = true;
    this.sendBtn.disabled = true;
    this.setError();
    this.setStatus(this.options.loadingText, true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(this.options.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.messages }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await safeJson(response);
        throw new Error(data?.error || `Request failed with status ${response.status}`);
      }

      if (isStreamResponse(response)) {
        await this.handleStream(response);
      } else {
        const data = await response.json();
        const text = (data?.message as string) || '';
        const done = Boolean(data?.done);
        if (text) {
          const cleaned = cleanAssistantText(text);
          const payload = cleaned || text;
          this.appendMessage({ role: 'assistant', content: payload });
          this.messages.push({ role: 'assistant', content: payload });
          this.onAssistantComplete(payload, done);
          this.setStatus();
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      console.error('Bless chat error', error);
      
      // User-friendly error messages
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.name === 'AbortError') {
        errorMessage = 'The response took too long. Let us try once more.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      this.setError(errorMessage);
      this.showRetryButton();
    } finally {
      this.setStatus();
      this.isProcessing = false;
      this.sendBtn.disabled = false;
    }
  }

  private recordStateMarker(meta?: StreamMeta | null) {
    if (!meta?.marker) return;
    const marker = meta.marker.trim();
    if (!marker) return;
    this.messages.push({ role: 'assistant', content: marker });
  }

  private async handleStream(response: Response) {
    const reader = response.body?.getReader();
    if (!reader) {
      const fallback = await response.text();
      this.pushAssistantMessage(fallback);
      return;
    }

    let doneFlag = false;
    let aggregated = '';
    let finalMeta: StreamMeta | null = null;

    this.appendMessage({ role: 'assistant', content: '' }, true);

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';

      for (const frame of frames) {
        const lines = frame.split('\n');
        let data = '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            data += line.slice(5).trim();
          }
        }

        if (!data) continue;
        if (data === '[DONE]') continue;

        let payload: any;
        try {
          payload = JSON.parse(data);
        } catch (error) {
          console.warn('Unable to parse stream chunk', data);
          continue;
        }

        if (payload.type === 'delta' && typeof payload.textDelta === 'string') {
          aggregated += payload.textDelta;
          this.updateStreamingBubble(payload.textDelta);
        } else if (payload.type === 'done') {
          finalMeta = payload.meta || null;
          if (finalMeta && typeof finalMeta.done === 'boolean') {
            doneFlag = finalMeta.done;
          } else if (finalMeta?.state === 'compose_blessing') {
            doneFlag = true;
          }
          if (!aggregated && typeof payload.text === 'string') {
            aggregated = payload.text;
          }
        } else if (payload.type === 'meta') {
          if (typeof payload.done === 'boolean') {
            doneFlag = payload.done;
          }
          if (payload.marker) {
            finalMeta = finalMeta ?? {};
            if (!finalMeta.marker) {
              finalMeta.marker = payload.marker;
            }
          }
          if (!finalMeta) {
            finalMeta = {
              state: payload.state,
              sidthieKey: payload.sidthieKey ?? null,
              sidthieLabel: payload.sidthieLabel ?? null,
              userName: payload.userName ?? null,
              marker: payload.marker ?? null,
              done: payload.done,
            };
          }
        } else if (payload.type === 'error') {
          throw new Error(payload.message || 'Unexpected error');
        }
      }
    }

    const resolved = aggregated.trim();
    const cleaned = cleanAssistantText(resolved);
    const output = cleaned || resolved;
    this.finalizeStreamingBubble(output);
    this.messages.push({ role: 'assistant', content: output });
    this.recordStateMarker(finalMeta || undefined);
    
    this.onAssistantComplete(output, doneFlag, finalMeta || undefined);
  }

  private onAssistantComplete(
    text: string, 
    done: boolean, 
    finalMeta?: StreamMeta
  ) {
    if (!text) return;

    if (done) {
      this.incrementBlessingCount();
      
      const prepared = this.prepareBlessing(text);
      const blessing = prepared.blessing || prepared.raw || text.trim();
      this.blessingDelivered = true;
      setSessionFlag(SESSION_KEY, 'true');

      const last = this.messageList.lastElementChild;
      if (last && last.classList.contains('bless-chat-bubble')) {
        this.messageList.removeChild(last);
      }

      this.displayBlessing(blessing, finalMeta);
      
      // FIXED: Changed blessing message
      this.pushAssistantMessage('Your blessing has been created. Scroll down to read it.');
      
      return;
    }

    if (/image|upload|photo|picture/i.test(text)) {
      this.pushAssistantMessage('No image is needed. Let us continue in words.');
    }
  }

  private prepareBlessing(raw: string) {
    const cleaned = cleanAssistantText(raw);
    const lines = cleaned
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const poem: string[] = [];
    const extra: string[] = [];
    for (const line of lines) {
      if (poem.length < 5 && !/^is the blessing/i.test(line)) {
        poem.push(line);
      } else if (!/^is the blessing/i.test(line)) {
        extra.push(line);
      }
    }

    return {
      blessing: poem.join('\n'),
      extra,
      raw: cleaned,
    };
  }

  private displayBlessing(
    blessing: string, 
    finalMeta?: StreamMeta
  ) {
    let meta = this.activeSidthie;
    if (!meta && finalMeta?.sidthieKey) {
      meta = findSidthieByKey(finalMeta.sidthieKey);
      if (meta) this.activeSidthie = meta;
    }
    if (!meta && finalMeta?.sidthieLabel) {
      meta = findSidthieByLabel(finalMeta.sidthieLabel);
      if (meta) this.activeSidthie = meta;
    }

    const explanation = this.lastExplanation || meta?.description || meta?.short || '';

    try {
      revealBlessing(blessing);
    } catch {
      /* ignore reveal errors */
    }

    const detail = {
      text: blessing,
      blessing,
      sidthie: meta?.key || null,
      sidthieLabel: meta?.label || null,
      explanation,
    };

    this.renderBlessingPanel({ blessing, explanation, sidthieLabel: detail.sidthieLabel ?? undefined });
    
    if (meta) {
      try {
        window.dispatchEvent(
          new CustomEvent('sidthie:selected', {
            detail: { sidthie: meta.key, sidthieLabel: meta.label },
          })
        );
      } catch {
        /* ignore dispatch errors */
      }
    }
    
    window.dispatchEvent(new CustomEvent('blessing:ready', { detail }));
    window.dispatchEvent(new CustomEvent('blessing:update', { detail }));
  }

  private renderBlessingPanel(detail: {
    blessing: string;
    explanation?: string;
    sidthieLabel?: string;
  }) {
    const sel = [
      '[data-bless-panel]',
      '.bless-blessing__panel',
      '#bless-blessing__panel'
    ].join(',');

    document.querySelectorAll<HTMLElement>(sel).forEach((panel) => {
      panel.style.fontFamily = "'Cormorant Upright', serif";
      panel.style.whiteSpace = 'pre-line';
      panel.style.textAlign = 'center';
      panel.style.color = '#fff';
      panel.style.fontSize = 'clamp(18px, 2.4vw, 30px)';
      panel.style.lineHeight = '1.35';
      panel.style.textShadow = '0 2px 8px rgba(0,0,0,.55)';

      const content = panel.querySelector<HTMLElement>('[data-blessing-output]') || panel;
      content.textContent = detail.blessing;
      content.removeAttribute('hidden');

      const meta = panel.querySelector<HTMLElement>('[data-blessing-meta]');
      const metaTitle = panel.querySelector<HTMLElement>('[data-sidthie-title]');
      const metaText = panel.querySelector<HTMLElement>('[data-sidthie-excerpt]');

      if (meta) {
        const hasLabel = Boolean(detail.sidthieLabel);
        const hasExplanation = Boolean(detail.explanation);

        if (metaTitle) {
          if (hasLabel) {
            metaTitle.textContent = detail.sidthieLabel!;
            metaTitle.removeAttribute('hidden');
          } else {
            metaTitle.setAttribute('hidden', 'hidden');
          }
        }

        if (metaText) {
          if (hasExplanation) {
            metaText.textContent = detail.explanation!;
            metaText.removeAttribute('hidden');
          } else {
            metaText.setAttribute('hidden', 'hidden');
          }
        }

        if (hasLabel || hasExplanation) {
          meta.removeAttribute('hidden');
        } else {
          meta.setAttribute('hidden', 'hidden');
        }
      }

      const signup = panel.querySelector<HTMLElement>('[data-blessing-signup]');
      const signupPrompt = panel.querySelector<HTMLElement>('[data-signup-prompt]');
      const signupInput = panel.querySelector<HTMLInputElement>('[data-signup-sidthie]');
      const defaultPrompt = signupPrompt?.getAttribute('data-default-prompt') || signupPrompt?.textContent || '';

      if (signup) {
        if (signupPrompt) {
          if (defaultPrompt.includes('{sidthie}')) {
            signupPrompt.textContent = defaultPrompt.replace('{sidthie}', detail.sidthieLabel || 'your Sidthie');
          } else if (detail.sidthieLabel) {
            signupPrompt.textContent = `${defaultPrompt} (${detail.sidthieLabel})`;
          }
        }
        if (signupInput) {
          signupInput.value = detail.sidthieLabel || '';
        }
        signup.removeAttribute('hidden');
      }
    });
  }
}

function safeJson(response: Response) {
  return response
    .clone()
    .json()
    .catch(() => ({}));
}

function isStreamResponse(response: Response) {
  const contentType = response.headers.get('Content-Type') || response.headers.get('content-type');
  return contentType ? /ndjson|stream/.test(contentType) : false;
}

function resolveContainerConfig(element: HTMLElement): WidgetOptions {
  const config: WidgetOptions = {};
  const api = sanitizeString(element.dataset.apiUrl);
  if (api) config.apiUrl = api;
  const placeholder = sanitizeString(element.dataset.placeholder);
  if (placeholder) config.placeholder = placeholder;
  const loading = sanitizeString(element.dataset.loadingText);
  if (loading) config.loadingText = loading;
  const requireBlessing = parseBooleanDataset(element.dataset.requireBlessing);
  if (typeof requireBlessing === 'boolean') config.requireBlessing = requireBlessing;
  return config;
}

function mount(selector?: string, options?: WidgetOptions) {
  const target = selector
    ? document.querySelector<HTMLElement>(selector)
    : document.querySelector<HTMLElement>('[data-chat-container]');

  if (!target) {
    console.warn('BlessChat: target container not found.');
    return;
  }

  console.info('BlessChat: mounting widget', { selector, target });

  const config = { ...resolveContainerConfig(target), ...(options || {}) };
  const widget = new BlessChatWidget(target, config);
  widget.mount();
}

if (typeof window !== 'undefined') {
  (window as any).BlessChat = {
    mount
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mount());
  } else {
    setTimeout(() => mount(), 0);
  }
}

export { mount };
