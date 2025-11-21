"use strict";var BlessChat=(()=>{var x=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var P=Object.prototype.hasOwnProperty;var F=(a,e)=>{for(var i in e)x(a,i,{get:e[i],enumerable:!0})},K=(a,e,i,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of U(e))!P.call(a,s)&&s!==i&&x(a,s,{get:()=>e[s],enumerable:!(t=D(e,s))||t.enumerable});return a};var $=a=>K(x({},"__esModule",{value:!0}),a);var te={};F(te,{mount:()=>v});var f={apiUrl:"https://bless-test-brown.vercel.app/api/chat",placeholder:"Talk to Sidthah",sendAriaLabel:"Send message",loadingText:"Listening...",requireBlessing:!0};function p(a){if(a==null)return;let e=a.toString().trim();if(!e)return;let i=e.toLowerCase();if(!(i==="undefined"||i==="null"))return e}function z(a){if(a==null)return;let e=a.toString().trim().toLowerCase();if(!e)return!0;if(["false","0","no","off","disabled"].includes(e))return!1;if(["true","1","yes","on","enabled"].includes(e))return!0}var Y=`
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
  max-height: min(70vh, 700px);
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

/* Streaming indicator - using dots only, no cursor square */
.bless-chat-bubble--streaming {
  position: relative;
}

.bless-chat-bubble--streaming::after {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 6px;
  border-radius: 50%;
  background: rgba(var(--bless-cream-100), 0.75);
  animation: bless-streaming-pulse 900ms ease-in-out infinite;
}

@keyframes bless-streaming-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
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

/* Email input bubble */
.bless-chat-email-bubble {
  padding: 1.2rem !important;
}

.bless-chat-email-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bless-chat-email-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.bless-chat-email-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.15);
  color: rgba(var(--bless-cream-100), 0.92);
  font-size: 1rem;
  font-family: inherit;
}

.bless-chat-email-input::placeholder {
  color: rgba(var(--bless-cream-100), 0.45);
}

.bless-chat-email-input:focus {
  outline: none;
  border-color: rgba(var(--bless-gold-400), 0.6);
  background: rgba(255,255,255,0.2);
}

.bless-chat-email-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: none;
  background: rgba(var(--bless-gold-400), 0.92);
  color: rgb(var(--bless-green-900));
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 180ms ease, background-color 180ms ease;
  white-space: nowrap;
}

.bless-chat-email-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(var(--bless-gold-400), 1);
}

.bless-chat-email-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.bless-chat-email-error {
  font-size: 0.9rem;
  color: rgba(255, 129, 100, 0.95);
  padding: 0.25rem 0;
}

/* Preview bubble */
.bless-chat-preview {
  position: relative;
}

.bless-chat-preview--truncated::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(var(--bless-cream-100), 0.1));
  pointer-events: none;
}

.bless-chat-error-bubble {
  background: rgba(255, 129, 100, 0.15);
  border-color: rgba(255, 129, 100, 0.3);
}

@media (max-width: 640px) {
  .bless-chat-email-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .bless-chat-email-submit {
    width: 100%;
  }
}
`,R=document.createElement("style");R.textContent=Y;document.head.appendChild(R);var O={NALAMERA:{key:"NALAMERA",label:"Inner Strength",short:"A steady courage that rises quietly from within.",description:"Nalamera steadies the breath and roots the heart; she carries the quiet strength that holds families together when storms arrive."},LUMASARA:{key:"LUMASARA",label:"Happiness",short:"A soft, luminous joy that brightens the ordinary.",description:"Lumasara brightens every ordinary moment with the glow of celebration, inviting laughter to linger like sunlight through leaves."},WELAMORA:{key:"WELAMORA",label:"Love",short:"A tender presence that listens and embraces.",description:"Welamora listens with the whole heart, weaving warmth and devotion so love can be felt in every touch and every word."},NIRALUMA:{key:"NIRALUMA",label:"Bliss",short:"A calm clarity that sees the path with kindness.",description:"Niraluma pours lantern-light across the path ahead, offering gentle bliss and serene grace to every decision you make."},OLANWELA:{key:"OLANWELA",label:"Health",short:"A quiet mending that restores balance and breath.",description:"Olanwela soothes weary hearts and tired bones, bathing the spirit in cool rivers of renewal and vital health."},RAKAWELA:{key:"RAKAWELA",label:"Peace",short:"A gentle guard that shelters what is precious.",description:"Rakawela stands as a quiet guardian, wrapping loved ones in peaceful kindness and turning away every shadow that approaches."},MORASARA:{key:"MORASARA",label:"Fortune",short:"A stillness that settles and softens the heart.",description:"Morasara settles like evening mist, inviting deep breaths, calm conversations, and the promise of good fortune wherever you stand."}},y=Object.values(O);function _(a){var i;if(!a)return null;let e=a.toUpperCase();return(i=O[e])!=null?i:null}function H(a){var i,t;if(!a)return null;let e=a.trim().toLowerCase();return(t=(i=y.find(s=>s.label.toLowerCase()===e))!=null?i:y.find(s=>e.includes(s.label.toLowerCase())))!=null?t:null}function j(){return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`}var S="bless-chat-blessing-created",G=[/Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,/How can I assist you with (them|it|the files?)\?.*$/gim,/Would you like me to search for specific information.*$/gim,/or summarize the content\?.*$/gim,/\【\d+:\d+†source\】/g,/To create a personalized blessing.*?providing the files?!?/gim,/and for providing the files?!?/gim];function L(a){let e=a!=null?a:"";return G.forEach(i=>{e=e.replace(i,"")}),e.trim()}function J(a){try{return typeof sessionStorage!="undefined"?sessionStorage.getItem(a):null}catch{return null}}function C(a,e){try{typeof sessionStorage!="undefined"&&sessionStorage.setItem(a,e)}catch{}}function V(a){let e=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(e).forEach(i=>{i.style.fontFamily="'Cormorant Upright', serif",i.style.whiteSpace="pre-line",i.style.textAlign="center",i.style.color="#fff",i.style.fontSize="clamp(18px, 2.4vw, 30px)",i.style.lineHeight="1.35",i.style.textShadow="0 2px 8px rgba(0,0,0,.55)",i.textContent=a})}function M(a){if(!a)return null;let e=a.replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g,`
$2. `).replace(/\s{2,}/g," ").trim(),i=e.split(/\r?\n/).map(o=>o.trim()).filter(Boolean);if(i.filter(o=>/^[1-7]\.\s*/.test(o)).length<7)return null;let n=i.filter(o=>!/^[1-7]\.\s*/.test(o)).join(" ").trim();if(!y.every(o=>e.toLowerCase().includes(o.label.toLowerCase())||e.includes(`(${o.key})`)))return null;let d=y.map(o=>`${o.label} (${o.key})`);return{intro:n,options:d,metas:y}}function X(a){if(!a)return null;let e=a.match(/\(([A-Za-z]+)\)\s*$/);if(e){let t=_(e[1]);if(t)return t}let i=a.replace(/\([^)]*\)/g,"").trim();return H(i)}var k=class{constructor(e,i){this.messages=[];this.isProcessing=!1;this.blessingDelivered=!1;this.currentStreamingNode=null;this.currentStreamingText="";this.activeSidthie=null;this.lastExplanation="";this.pendingBlessing=null;this.pendingBlessingMeta=null;this.collectedEmail=null;this.awaitingEmail=!1;this.currentMetaState=null;this.N8N_WEBHOOK_URL="https://n8n.theexperiencen8n.top/webhook/951bd832-961c-4f19-a263-96632039cd07";this.THANK_YOU_PAGE="/pages/blessing-thank-you";this.blessingCount=0;this.MAX_BLESSINGS=3;this.STORAGE_KEY="bless-chat-session-count";var s,n,r,d;this.container=e;let t={...f,...i||{}};this.options={apiUrl:(s=p(t.apiUrl))!=null?s:f.apiUrl,placeholder:(n=p(t.placeholder))!=null?n:f.placeholder,sendAriaLabel:(r=p(t.sendAriaLabel))!=null?r:f.sendAriaLabel,loadingText:(d=p(t.loadingText))!=null?d:f.loadingText,requireBlessing:t.requireBlessing},this.blessingDelivered=J(S)==="true",this.blessingCount=this.getBlessingCount(),!this.options.requireBlessing&&this.blessingDelivered&&(this.blessingDelivered=!1)}getBlessingCount(){try{let e=sessionStorage.getItem(this.STORAGE_KEY);return e?parseInt(e,10):0}catch{return 0}}incrementBlessingCount(){this.blessingCount+=1;try{sessionStorage.setItem(this.STORAGE_KEY,this.blessingCount.toString())}catch{}}hasReachedLimit(){return this.blessingCount>=this.MAX_BLESSINGS}showLimitReached(){this.pushAssistantMessage(`Three blessings daily allows each to settle deeply. You have received ${this.blessingCount} blessing${this.blessingCount>1?"s":""} this session. Close your browser to begin a new session, or return tomorrow for fresh blessings.`),this.inputEl.disabled=!0,this.sendBtn.disabled=!0}mount(){let e=p(this.container.dataset.chatWidth);e&&this.container.style.setProperty("--bless-chat-max-width",e);let i=p(this.container.dataset.chatRadius);i&&this.container.style.setProperty("--bless-chat-radius",i),this.container.innerHTML="",this.container.classList.add("bless-chat-shell");let t=document.createElement("div");t.className="bless-chat-window",this.messageList=document.createElement("div"),this.messageList.className="bless-chat-messages",this.statusEl=document.createElement("div"),this.statusEl.className="bless-chat-bubble bless-chat-bubble--status",this.statusEl.hidden=!0,this.errorEl=document.createElement("div"),this.errorEl.className="bless-chat-error",this.errorEl.hidden=!0;let s=document.createElement("form");s.className="bless-chat-input-row";let n=document.createElement("div");n.className="bless-chat-input-wrapper",this.inputEl=document.createElement("input"),this.inputEl.type="text",this.inputEl.className="bless-chat-input",this.inputEl.placeholder=this.options.placeholder,this.inputEl.autocomplete="off",this.inputEl.spellcheck=!1,this.inputEl.setAttribute("aria-label",this.options.placeholder),n.appendChild(this.inputEl),this.sendBtn=document.createElement("button"),this.sendBtn.type="submit",this.sendBtn.className="bless-chat-send",this.sendBtn.setAttribute("aria-label",this.options.sendAriaLabel),this.sendBtn.innerHTML=j(),s.append(n,this.sendBtn),s.addEventListener("submit",r=>{r.preventDefault(),this.handleSubmit()}),this.messageList.addEventListener("scroll",()=>{this.messageList.scrollTop===0?this.messageList.classList.add("scrolled-top"):this.messageList.classList.remove("scrolled-top")}),t.append(this.messageList,this.statusEl,s,this.errorEl),this.container.appendChild(t),this.inputEl.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),this.handleSubmit())}),this.blessingDelivered&&this.options.requireBlessing?this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below."):this.hasReachedLimit()?this.showLimitReached():(this.options.requireBlessing||C(S,"false"),this.startConversation())}async startConversation(){this.activeSidthie=null,this.lastExplanation="",await this.fetchAssistantReply()}async handleSubmit(){if(this.isProcessing)return;let e=this.inputEl.value.trim();if(!e){this.inputEl.reportValidity();return}if(this.blessingDelivered&&this.options.requireBlessing){this.pushAssistantMessage("Your blessing has been created. Scroll down to read it."),this.inputEl.value="";return}this.appendMessage({role:"user",content:e}),this.inputEl.value="",this.messages.push({role:"user",content:e}),await this.fetchAssistantReply()}appendMessage(e,i=!1){if(e.role==="assistant"&&!i){this.captureExplanation(e.content);let s=M(e.content);if(s){this.messages.push({role:"assistant",content:e.content}),this.createOptionsBubble(s.options,s.intro,s.metas);return}}let t=document.createElement("div");t.className="bless-chat-bubble",e.role==="user"&&t.classList.add("bless-chat-bubble--user"),t.textContent=e.content,this.messageList.appendChild(t),this.scrollToBottom(),e.role==="assistant"&&i&&(t.classList.add("bless-chat-bubble--streaming"),this.currentStreamingNode=t,this.currentStreamingText=e.content)}captureExplanation(e){if(!e||this.currentMetaState&&!["ask_intent","ask_context"].includes(this.currentMetaState))return;let i=e.split(`

`);if(i.length>0){let t=i[0].trim();t.length>30&&t.length<300&&(this.lastExplanation=t)}}createOptionsBubble(e,i,t){if(this.activeSidthie=null,i){let r=document.createElement("div");r.className="bless-chat-bubble",r.textContent=i,this.messageList.appendChild(r),this.scrollToBottom()}let s=document.createElement("div");s.className="bless-chat-bubble";let n=document.createElement("div");n.className="bless-chat-options",e.forEach((r,d)=>{let o=document.createElement("button");o.type="button",o.className="bless-chat-option",o.textContent=r,o.addEventListener("click",()=>{var h;let c=(h=t==null?void 0:t[d])!=null?h:X(r);if(c){this.activeSidthie=c;try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:c.key,sidthieLabel:c.label}}))}catch{}}this.appendMessage({role:"user",content:r}),this.messages.push({role:"user",content:r}),n.querySelectorAll("button").forEach(u=>{u.disabled=!0}),this.fetchAssistantReply()}),n.appendChild(o)}),s.appendChild(n),this.messageList.appendChild(s),this.scrollToBottom()}updateStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingText+=e,this.currentStreamingNode.textContent=this.currentStreamingText,this.scrollToBottom())}finalizeStreamingBubble(e){if(this.currentStreamingNode){this.currentStreamingNode.classList.remove("bless-chat-bubble--streaming");let i=M(e);if(i){this.messageList.removeChild(this.currentStreamingNode),this.currentStreamingNode=null,this.currentStreamingText="",this.createOptionsBubble(i.options,i.intro);return}this.currentStreamingNode.textContent=e.trim()}this.currentStreamingNode=null,this.currentStreamingText="",this.scrollToBottom()}pushAssistantMessage(e){let i={role:"assistant",content:e};this.appendMessage(i),this.messages.push(i)}setStatus(e,i=!1){e?(i?(this.statusEl.innerHTML='<span class="bless-typing" aria-hidden="true"><span></span><span></span><span></span></span>',this.statusEl.classList.add("is-typing"),this.statusEl.setAttribute("aria-label",e)):(this.statusEl.textContent=e,this.statusEl.classList.remove("is-typing"),this.statusEl.removeAttribute("aria-label")),this.statusEl.hidden=!1):(this.statusEl.hidden=!0,this.statusEl.classList.remove("is-typing"),this.statusEl.innerHTML="",this.statusEl.removeAttribute("aria-label"))}setError(e){e?(this.errorEl.textContent=e,this.errorEl.hidden=!1):(this.errorEl.hidden=!0,this.errorEl.textContent="")}scrollToBottom(){requestAnimationFrame(()=>{this.messageList.scrollTop=this.messageList.scrollHeight})}showRetryButton(){let e=document.createElement("button");e.type="button",e.className="bless-chat-retry",e.textContent="Try again",e.addEventListener("click",()=>{e.remove(),this.fetchAssistantReply()}),this.messageList.appendChild(e),this.scrollToBottom()}async fetchAssistantReply(){this.isProcessing=!0,this.sendBtn.disabled=!0,this.setError(),this.setStatus(this.options.loadingText,!0);let e=new AbortController,i=setTimeout(()=>e.abort(),3e4);try{let t=await fetch(this.options.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:this.messages}),signal:e.signal});if(clearTimeout(i),!t.ok){let s=await Z(t);throw new Error((s==null?void 0:s.error)||`Request failed with status ${t.status}`)}if(Q(t))await this.handleStream(t);else{let s=await t.json(),n=(s==null?void 0:s.message)||"",r=!!(s!=null&&s.done);if(n){let o=L(n)||n;this.appendMessage({role:"assistant",content:o}),this.messages.push({role:"assistant",content:o}),this.onAssistantComplete(o,r),this.setStatus()}}}catch(t){clearTimeout(i),console.error("Bless chat error",t);let s="Something went wrong. Please try again.";t.name==="AbortError"?s="The response took too long. Let us try once more.":t!=null&&t.message&&(s=t.message),this.setError(s),this.showRetryButton()}finally{this.setStatus(),this.isProcessing=!1,this.sendBtn.disabled=!1}}recordStateMarker(e){if(!(e!=null&&e.marker))return;let i=e.marker.trim();i&&this.messages.push({role:"assistant",content:i})}async handleStream(e){var u,b,g,B,N,A;let i=(u=e.body)==null?void 0:u.getReader();if(!i){let w=await e.text();this.pushAssistantMessage(w);return}let t=!1,s="",n=null;this.appendMessage({role:"assistant",content:""},!0);let r=new TextDecoder,d="";for(;;){let{value:w,done:I}=await i.read();if(I)break;d+=r.decode(w,{stream:!0});let T=d.split(`

`);d=T.pop()||"";for(let W of T){let q=W.split(`
`),m="";for(let E of q)E.startsWith("data:")&&(m+=E.slice(5).trim());if(!m||m==="[DONE]")continue;let l;try{l=JSON.parse(m)}catch{console.warn("Unable to parse stream chunk",m);continue}if(l.type==="delta"&&typeof l.textDelta=="string")s+=l.textDelta,this.updateStreamingBubble(l.textDelta);else if(l.type==="done")n=l.meta||null,n&&typeof n.done=="boolean"?t=n.done:(n==null?void 0:n.state)==="compose_blessing"&&(t=!0),!s&&typeof l.text=="string"&&(s=l.text);else if(l.type==="meta")typeof l.done=="boolean"&&(t=l.done),l.state&&(this.currentMetaState=l.state),l.marker&&(n=n!=null?n:{},n.marker||(n.marker=l.marker)),n?(l.sidthieKey&&!n.sidthieKey&&(n.sidthieKey=l.sidthieKey),l.sidthieLabel&&!n.sidthieLabel&&(n.sidthieLabel=l.sidthieLabel),l.userName&&!n.userName&&(n.userName=l.userName),l.blessingFor&&!n.blessingFor&&(n.blessingFor=l.blessingFor),l.state&&!n.state&&(n.state=l.state)):n={state:l.state,sidthieKey:(b=l.sidthieKey)!=null?b:null,sidthieLabel:(g=l.sidthieLabel)!=null?g:null,userName:(B=l.userName)!=null?B:null,blessingFor:(N=l.blessingFor)!=null?N:null,marker:(A=l.marker)!=null?A:null,done:l.done};else if(l.type==="error")throw new Error(l.message||"Unexpected error")}}let o=s.trim(),h=L(o)||o;this.finalizeStreamingBubble(h),this.messages.push({role:"assistant",content:h}),this.recordStateMarker(n||void 0),this.onAssistantComplete(h,t,n||void 0)}onAssistantComplete(e,i,t){if(!e)return;let n=((t==null?void 0:t.state)||this.currentMetaState)==="compose_blessing";if(!(i&&!n)){if(i&&n){this.incrementBlessingCount();let r=this.prepareBlessing(e),d=r.blessing||r.raw||e.trim();this.pendingBlessing=d,this.pendingBlessingMeta=t||null;let o=this.messageList.lastElementChild;o&&o.classList.contains("bless-chat-bubble")&&this.messageList.removeChild(o),this.showBlessingPreviewAndAskEmail(d,t);return}/image|upload|photo|picture/i.test(e)&&this.pushAssistantMessage("No image is needed. Let us continue in words.")}}extractBlessingPreview(e){let i=e.split(/[.!?]+/).filter(s=>s.trim().length>0);if(!i.length)return e.slice(0,150);let t=i[0].trim();return t.length<80&&i.length>1&&(t+=". "+i[1].trim()),t.length>150&&(t=t.slice(0,147)+"..."),t}showBlessingPreviewAndAskEmail(e,i){let t=this.extractBlessingPreview(e),s=document.createElement("div");s.className="bless-chat-bubble bless-chat-preview bless-chat-preview--truncated",s.textContent=t+"...",this.messageList.appendChild(s),this.scrollToBottom(),this.awaitingEmail=!0,this.inputEl.disabled=!0,this.sendBtn.disabled=!0,this.pushAssistantMessage("What's your email so I can send you the complete blessing?"),this.createEmailInputBubble()}createEmailInputBubble(){let e=document.createElement("div");e.className="bless-chat-bubble bless-chat-email-bubble";let i=document.createElement("form");i.className="bless-chat-email-form";let t=document.createElement("div");t.className="bless-chat-email-wrapper";let s=document.createElement("input");s.type="email",s.className="bless-chat-email-input",s.placeholder="Enter your email",s.required=!0,s.autocomplete="email";let n=document.createElement("button");n.type="submit",n.className="bless-chat-email-submit",n.textContent="Receive blessing";let r=document.createElement("div");r.className="bless-chat-email-error",r.hidden=!0,t.appendChild(s),t.appendChild(n),i.appendChild(t),i.appendChild(r),e.appendChild(i),i.addEventListener("submit",async d=>{d.preventDefault();let o=s.value.trim();if(!this.validateEmail(o)){r.textContent="Please enter a valid email address",r.hidden=!1,s.focus();return}r.hidden=!0,s.disabled=!0,n.disabled=!0,n.textContent="Saving...",await this.handleEmailSubmission(o,n)}),this.messageList.appendChild(e),this.scrollToBottom(),s.focus()}validateEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}async handleEmailSubmission(e,i){console.log("[BlessChatWidget] Email submission started",{email:e,timestamp:new Date().toISOString()});let t=this.pendingBlessing,s=this.pendingBlessingMeta||void 0;try{if(!t)throw new Error("No pending blessing found");if(console.log("[BlessChatWidget] Sending to N8N webhook"),!await this.sendToN8N(e,t,s))throw console.error("[BlessChatWidget] N8N webhook returned false"),new Error("Webhook failed");console.log("[BlessChatWidget] N8N webhook success, storing email and displaying blessing"),this.collectedEmail=e,this.blessingDelivered=!0,C(S,"true");try{t&&sessionStorage.setItem("blessed_text",t),s!=null&&s.sidthieKey&&sessionStorage.setItem("blessed_sidthie_key",s.sidthieKey),s!=null&&s.sidthieLabel&&sessionStorage.setItem("blessed_sidthie_label",s.sidthieLabel)}catch(o){console.warn("[BlessChatWidget] Unable to persist blessing data before redirect",o)}let r=new URLSearchParams;s!=null&&s.userName&&r.append("name",s.userName),s!=null&&s.sidthieKey&&r.append("sidthie",s.sidthieKey);let d=`/pages/thank-you${r.toString()?"?"+r.toString():""}`;window.location.href=d}catch(n){console.error("[BlessChatWidget] Email submission error:",n),console.error("[BlessChatWidget] Error details:",{message:n instanceof Error?n.message:String(n),stack:n instanceof Error?n.stack:"No stack trace"});try{t&&sessionStorage.setItem("blessed_text",t),s!=null&&s.sidthieKey&&sessionStorage.setItem("blessed_sidthie_key",s.sidthieKey),s!=null&&s.sidthieLabel&&sessionStorage.setItem("blessed_sidthie_label",s.sidthieLabel)}catch(o){console.warn("[BlessChatWidget] Unable to persist blessing data after error",o)}let r=new URLSearchParams;s!=null&&s.userName&&r.append("name",s.userName),s!=null&&s.sidthieKey&&r.append("sidthie",s.sidthieKey);let d=`/pages/thank-you${r.toString()?"?"+r.toString():""}`;window.location.href=d}finally{this.awaitingEmail=!1,i&&(i.disabled=!1,i.textContent="Sent!")}}async sendToN8N(e,i,t){let s={email:e,userName:(t==null?void 0:t.userName)||null,blessedPersonName:(t==null?void 0:t.blessingFor)||null,chosenSidthie:(t==null?void 0:t.sidthieKey)||null,sidthieLabel:(t==null?void 0:t.sidthieLabel)||null,blessingText:i,explanation:this.lastExplanation||null,timestamp:new Date().toISOString()};console.log("[N8N Webhook] Starting POST request"),console.log("[N8N Webhook] URL:",this.N8N_WEBHOOK_URL),console.log("[N8N Webhook] Payload:",{email:s.email,userName:s.userName,blessedPersonName:s.blessedPersonName,chosenSidthie:s.chosenSidthie,sidthieLabel:s.sidthieLabel,explanationLength:s.explanation?s.explanation.length:0,blessingTextLength:s.blessingText?s.blessingText.length:0,timestamp:s.timestamp});try{let n=new AbortController,r=setTimeout(()=>n.abort(),3e4),d=performance.now();console.log("[N8N Webhook] Sending request...");let o=await fetch(this.N8N_WEBHOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s),signal:n.signal});clearTimeout(r);let h=(performance.now()-d).toFixed(0);if(console.log("[N8N Webhook] Response received",{status:o.status,statusText:o.statusText,duration:`${h}ms`,contentType:o.headers.get("Content-Type")}),!o.ok){console.error("[N8N Webhook] FAILED - HTTP error",{status:o.status,statusText:o.statusText,duration:`${h}ms`});try{let u=await o.text();console.error("[N8N Webhook] Error response body:",u)}catch{console.warn("[N8N Webhook] Could not read error response body")}return!1}return console.log("[N8N Webhook] SUCCESS - Email saved to N8N",{email:s.email,duration:`${h}ms`}),!0}catch(n){return n.name==="AbortError"?console.error("[N8N Webhook] TIMEOUT - Request took longer than 30 seconds"):console.error("[N8N Webhook] ERROR - Network or parsing error:",{name:n.name,message:n.message,stack:n.stack}),!1}}redirectToThankYou(e,i){if(this.pendingBlessing)try{sessionStorage.setItem("bless-blessing-text",this.pendingBlessing),i&&sessionStorage.setItem("bless-sidthie-key",i)}catch{}let t=new URLSearchParams;e&&t.append("name",e),i&&t.append("sidthie",i);let s=`${this.THANK_YOU_PAGE}${t.toString()?"?"+t.toString():""}`;window.location.href=s}prepareBlessing(e){let i=L(e),t=i.split(/\r?\n/).map(r=>r.trim()).filter(Boolean),s=[],n=[];for(let r of t)s.length<5&&!/^is the blessing/i.test(r)?s.push(r):/^is the blessing/i.test(r)||n.push(r);return{blessing:s.join(`
`),extra:n,raw:i}}displayBlessing(e,i){var r,d,o,c;console.log("[BlessingDisplay] Starting blessing display");let t=this.activeSidthie;!t&&(i!=null&&i.sidthieKey)&&(t=_(i.sidthieKey),t&&(this.activeSidthie=t)),!t&&(i!=null&&i.sidthieLabel)&&(t=H(i.sidthieLabel),t&&(this.activeSidthie=t));let s=(t==null?void 0:t.description)||(t==null?void 0:t.short)||this.lastExplanation||"";try{V(e)}catch{}let n={text:e,blessing:e,sidthie:(t==null?void 0:t.key)||null,sidthieLabel:(t==null?void 0:t.label)||null,explanation:s,emailCollected:!!this.collectedEmail,email:this.collectedEmail||null,userName:((r=this.pendingBlessingMeta)==null?void 0:r.userName)||null,blessingFor:((d=this.pendingBlessingMeta)==null?void 0:d.blessingFor)||null,blessedPersonName:((o=this.pendingBlessingMeta)==null?void 0:o.blessingFor)||null};if(console.log("[BlessingDisplay] Blessing event detail:",{emailCollected:n.emailCollected,email:n.email,userName:n.userName,sidthie:n.sidthie,sidthieLabel:n.sidthieLabel,blessingLength:n.blessing.length}),this.renderBlessingPanel({blessing:e,explanation:s,sidthieLabel:(c=n.sidthieLabel)!=null?c:void 0}),t)try{console.log("[BlessingDisplay] Dispatching sidthie:selected event"),window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:t.key,sidthieLabel:t.label}}))}catch{}console.log("[BlessingDisplay] Dispatching blessing:ready event"),window.dispatchEvent(new CustomEvent("blessing:ready",{detail:n})),console.log("[BlessingDisplay] Dispatching blessing:update event (this triggers Shopify section)"),window.dispatchEvent(new CustomEvent("blessing:update",{detail:n})),setTimeout(()=>{console.log("[BlessingDisplay] Scrolling to blessing panel"),this.scrollToBottom();let h=document.querySelector("[data-bless-panel], .bless-blessing__panel, #bless-blessing__panel");h?(console.log("[BlessingDisplay] Found blessing panel, scrolling into view"),h.scrollIntoView({behavior:"smooth",block:"start"})):console.warn("[BlessingDisplay] Blessing panel not found in DOM")},300)}renderBlessingPanel(e){let i=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(i).forEach(t=>{t.style.fontFamily="'Cormorant Upright', serif",t.style.whiteSpace="pre-line",t.style.textAlign="center",t.style.color="#fff",t.style.fontSize="clamp(18px, 2.4vw, 30px)",t.style.lineHeight="1.35",t.style.textShadow="0 2px 8px rgba(0,0,0,.55)";let s=t.querySelector("[data-blessing-output]")||t;s.textContent=e.blessing,s.removeAttribute("hidden");let n=t.querySelector("[data-blessing-meta]"),r=t.querySelector("[data-sidthie-title]"),d=t.querySelector("[data-sidthie-excerpt]");if(n){let b=!!e.sidthieLabel,g=!!e.explanation;r&&(b?(r.textContent=e.sidthieLabel,r.removeAttribute("hidden")):r.setAttribute("hidden","hidden")),d&&(g?(d.textContent=e.explanation,d.removeAttribute("hidden")):d.setAttribute("hidden","hidden")),b||g?n.removeAttribute("hidden"):n.setAttribute("hidden","hidden")}let o=t.querySelector("[data-blessing-signup]"),c=t.querySelector("[data-signup-prompt]"),h=t.querySelector("[data-signup-sidthie]"),u=(c==null?void 0:c.getAttribute("data-default-prompt"))||(c==null?void 0:c.textContent)||"";o&&(c&&(u.includes("{sidthie}")?c.textContent=u.replace("{sidthie}",e.sidthieLabel||"your Sidthie"):e.sidthieLabel&&(c.textContent=`${u} (${e.sidthieLabel})`)),h&&(h.value=e.sidthieLabel||""),o.removeAttribute("hidden"),o.style.display=""),setTimeout(()=>{window.dispatchEvent(new CustomEvent("blessing:sync",{detail:{blessing:e.blessing,sidthieLabel:e.sidthieLabel,explanation:e.explanation}}))},100)})}};function Z(a){return a.clone().json().catch(()=>({}))}function Q(a){let e=a.headers.get("Content-Type")||a.headers.get("content-type");return e?/ndjson|stream/.test(e):!1}function ee(a){let e={},i=p(a.dataset.apiUrl);i&&(e.apiUrl=i);let t=p(a.dataset.placeholder);t&&(e.placeholder=t);let s=p(a.dataset.loadingText);s&&(e.loadingText=s);let n=z(a.dataset.requireBlessing);return typeof n=="boolean"&&(e.requireBlessing=n),e}function v(a,e){let i=a?document.querySelector(a):document.querySelector("[data-chat-container]");if(!i){console.warn("BlessChat: target container not found.");return}console.info("BlessChat: mounting widget",{selector:a,target:i});let t={...ee(i),...e||{}};new k(i,t).mount()}typeof window!="undefined"&&(window.BlessChat={mount:v},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>v()):setTimeout(()=>v(),0));return $(te);})();
//# sourceMappingURL=bless-chat-widget.js.map
