"use strict";var BlessChat=(()=>{var x=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var D=Object.prototype.hasOwnProperty;var W=(a,e)=>{for(var s in e)x(a,s,{get:e[s],enumerable:!0})},K=(a,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of U(e))!D.call(a,i)&&i!==s&&x(a,i,{get:()=>e[i],enumerable:!(t=P(e,i))||t.enumerable});return a};var Y=a=>K(x({},"__esModule",{value:!0}),a);var ee={};W(ee,{mount:()=>y});var f={apiUrl:"https://bless-test-brown.vercel.app/api/chat",placeholder:"Talk to Sidthah",sendAriaLabel:"Send message",loadingText:"Listening...",requireBlessing:!0};function u(a){if(a==null)return;let e=a.toString().trim();if(!e)return;let s=e.toLowerCase();if(!(s==="undefined"||s==="null"))return e}function z(a){if(a==null)return;let e=a.toString().trim().toLowerCase();if(!e)return!0;if(["false","0","no","off","disabled"].includes(e))return!1;if(["true","1","yes","on","enabled"].includes(e))return!0}var $=`
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
`,M=document.createElement("style");M.textContent=$;document.head.appendChild(M);var R={NALAMERA:{key:"NALAMERA",label:"Inner Strength",short:"A steady courage that rises quietly from within.",description:"Nalamera steadies the breath and roots the heart; she carries the quiet strength that holds families together when storms arrive."},LUMASARA:{key:"LUMASARA",label:"Happiness",short:"A soft, luminous joy that brightens the ordinary.",description:"Lumasara brightens every ordinary moment with the glow of celebration, inviting laughter to linger like sunlight through leaves."},WELAMORA:{key:"WELAMORA",label:"Love",short:"A tender presence that listens and embraces.",description:"Welamora listens with the whole heart, weaving warmth and devotion so love can be felt in every touch and every word."},NIRALUMA:{key:"NIRALUMA",label:"Bliss",short:"A calm clarity that sees the path with kindness.",description:"Niraluma pours lantern-light across the path ahead, offering gentle bliss and serene grace to every decision you make."},OLANWELA:{key:"OLANWELA",label:"Health",short:"A quiet mending that restores balance and breath.",description:"Olanwela soothes weary hearts and tired bones, bathing the spirit in cool rivers of renewal and vital health."},RAKAWELA:{key:"RAKAWELA",label:"Peace",short:"A gentle guard that shelters what is precious.",description:"Rakawela stands as a quiet guardian, wrapping loved ones in peaceful kindness and turning away every shadow that approaches."},MORASARA:{key:"MORASARA",label:"Fortune",short:"A stillness that settles and softens the heart.",description:"Morasara settles like evening mist, inviting deep breaths, calm conversations, and the promise of good fortune wherever you stand."}},v=Object.values(R);function O(a){var s;if(!a)return null;let e=a.toUpperCase();return(s=R[e])!=null?s:null}function H(a){var s,t;if(!a)return null;let e=a.trim().toLowerCase();return(t=(s=v.find(i=>i.label.toLowerCase()===e))!=null?s:v.find(i=>e.includes(i.label.toLowerCase())))!=null?t:null}function F(){return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`}var S="bless-chat-blessing-created",j=[/Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,/How can I assist you with (them|it|the files?)\?.*$/gim,/Would you like me to search for specific information.*$/gim,/or summarize the content\?.*$/gim,/\【\d+:\d+†source\】/g,/To create a personalized blessing.*?providing the files?!?/gim,/and for providing the files?!?/gim];function L(a){let e=a!=null?a:"";return j.forEach(s=>{e=e.replace(s,"")}),e.trim()}function G(a){try{return typeof sessionStorage!="undefined"?sessionStorage.getItem(a):null}catch{return null}}function C(a,e){try{typeof sessionStorage!="undefined"&&sessionStorage.setItem(a,e)}catch{}}function J(a){let e=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(e).forEach(s=>{s.style.fontFamily="'Cormorant Upright', serif",s.style.whiteSpace="pre-line",s.style.textAlign="center",s.style.color="#fff",s.style.fontSize="clamp(18px, 2.4vw, 30px)",s.style.lineHeight="1.35",s.style.textShadow="0 2px 8px rgba(0,0,0,.55)",s.textContent=a})}function N(a){if(!a)return null;let e=a.replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g,`
$2. `).replace(/\s{2,}/g," ").trim(),s=e.split(/\r?\n/).map(o=>o.trim()).filter(Boolean);if(s.filter(o=>/^[1-7]\.\s*/.test(o)).length<7)return null;let n=s.filter(o=>!/^[1-7]\.\s*/.test(o)).join(" ").trim();if(!v.every(o=>e.toLowerCase().includes(o.label.toLowerCase())||e.includes(`(${o.key})`)))return null;let l=v.map(o=>`${o.label} (${o.key})`);return{intro:n,options:l,metas:v}}function V(a){if(!a)return null;let e=a.match(/\(([A-Za-z]+)\)\s*$/);if(e){let t=O(e[1]);if(t)return t}let s=a.replace(/\([^)]*\)/g,"").trim();return H(s)}var A=class{constructor(e,s){this.messages=[];this.isProcessing=!1;this.blessingDelivered=!1;this.currentStreamingNode=null;this.currentStreamingText="";this.activeSidthie=null;this.lastExplanation="";this.pendingBlessing=null;this.pendingBlessingMeta=null;this.collectedEmail=null;this.awaitingEmail=!1;this.N8N_WEBHOOK_URL="https://n8n.theexperiencen8n.top/webhook-test/951bd832-961c-4f19-a263-96632039cd07";this.THANK_YOU_PAGE="/pages/thank-you";this.blessingCount=0;this.MAX_BLESSINGS=3;this.STORAGE_KEY="bless-chat-session-count";var i,n,r,l;this.container=e;let t={...f,...s||{}};this.options={apiUrl:(i=u(t.apiUrl))!=null?i:f.apiUrl,placeholder:(n=u(t.placeholder))!=null?n:f.placeholder,sendAriaLabel:(r=u(t.sendAriaLabel))!=null?r:f.sendAriaLabel,loadingText:(l=u(t.loadingText))!=null?l:f.loadingText,requireBlessing:t.requireBlessing},this.blessingDelivered=G(S)==="true",this.blessingCount=this.getBlessingCount(),!this.options.requireBlessing&&this.blessingDelivered&&(this.blessingDelivered=!1)}getBlessingCount(){try{let e=sessionStorage.getItem(this.STORAGE_KEY);return e?parseInt(e,10):0}catch{return 0}}incrementBlessingCount(){this.blessingCount+=1;try{sessionStorage.setItem(this.STORAGE_KEY,this.blessingCount.toString())}catch{}}hasReachedLimit(){return this.blessingCount>=this.MAX_BLESSINGS}showLimitReached(){this.pushAssistantMessage(`Three blessings daily allows each to settle deeply. You have received ${this.blessingCount} blessing${this.blessingCount>1?"s":""} this session. Close your browser to begin a new session, or return tomorrow for fresh blessings.`),this.inputEl.disabled=!0,this.sendBtn.disabled=!0}mount(){let e=u(this.container.dataset.chatWidth);e&&this.container.style.setProperty("--bless-chat-max-width",e);let s=u(this.container.dataset.chatRadius);s&&this.container.style.setProperty("--bless-chat-radius",s),this.container.innerHTML="",this.container.classList.add("bless-chat-shell");let t=document.createElement("div");t.className="bless-chat-window",this.messageList=document.createElement("div"),this.messageList.className="bless-chat-messages",this.statusEl=document.createElement("div"),this.statusEl.className="bless-chat-bubble bless-chat-bubble--status",this.statusEl.hidden=!0,this.errorEl=document.createElement("div"),this.errorEl.className="bless-chat-error",this.errorEl.hidden=!0;let i=document.createElement("form");i.className="bless-chat-input-row";let n=document.createElement("div");n.className="bless-chat-input-wrapper",this.inputEl=document.createElement("input"),this.inputEl.type="text",this.inputEl.className="bless-chat-input",this.inputEl.placeholder=this.options.placeholder,this.inputEl.autocomplete="off",this.inputEl.spellcheck=!1,this.inputEl.setAttribute("aria-label",this.options.placeholder),n.appendChild(this.inputEl),this.sendBtn=document.createElement("button"),this.sendBtn.type="submit",this.sendBtn.className="bless-chat-send",this.sendBtn.setAttribute("aria-label",this.options.sendAriaLabel),this.sendBtn.innerHTML=F(),i.append(n,this.sendBtn),i.addEventListener("submit",r=>{r.preventDefault(),this.handleSubmit()}),this.messageList.addEventListener("scroll",()=>{this.messageList.scrollTop===0?this.messageList.classList.add("scrolled-top"):this.messageList.classList.remove("scrolled-top")}),t.append(this.messageList,this.statusEl,i,this.errorEl),this.container.appendChild(t),this.inputEl.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),this.handleSubmit())}),this.blessingDelivered&&this.options.requireBlessing?this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below."):this.hasReachedLimit()?this.showLimitReached():(this.options.requireBlessing||C(S,"false"),this.startConversation())}async startConversation(){this.activeSidthie=null,this.lastExplanation="",await this.fetchAssistantReply()}async handleSubmit(){if(this.isProcessing)return;let e=this.inputEl.value.trim();if(!e){this.inputEl.reportValidity();return}if(this.blessingDelivered&&this.options.requireBlessing){this.pushAssistantMessage("Your blessing has been created. Scroll down to read it."),this.inputEl.value="";return}this.appendMessage({role:"user",content:e}),this.inputEl.value="",this.messages.push({role:"user",content:e}),await this.fetchAssistantReply()}appendMessage(e,s=!1){if(e.role==="assistant"&&!s){this.captureExplanation(e.content);let i=N(e.content);if(i){this.messages.push({role:"assistant",content:e.content}),this.createOptionsBubble(i.options,i.intro,i.metas);return}}let t=document.createElement("div");t.className="bless-chat-bubble",e.role==="user"&&t.classList.add("bless-chat-bubble--user"),t.textContent=e.content,this.messageList.appendChild(t),this.scrollToBottom(),e.role==="assistant"&&s&&(t.classList.add("bless-chat-bubble--streaming"),this.currentStreamingNode=t,this.currentStreamingText=e.content)}captureExplanation(e){if(!e)return;let s=e.split(`

`);if(s.length>0){let t=s[0].trim();t.length>30&&t.length<300&&(this.lastExplanation=t)}}createOptionsBubble(e,s,t){if(this.activeSidthie=null,s){let r=document.createElement("div");r.className="bless-chat-bubble",r.textContent=s,this.messageList.appendChild(r),this.scrollToBottom()}let i=document.createElement("div");i.className="bless-chat-bubble";let n=document.createElement("div");n.className="bless-chat-options",e.forEach((r,l)=>{let o=document.createElement("button");o.type="button",o.className="bless-chat-option",o.textContent=r,o.addEventListener("click",()=>{var h;let c=(h=t==null?void 0:t[l])!=null?h:V(r);if(c){this.activeSidthie=c;try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:c.key,sidthieLabel:c.label}}))}catch{}}this.appendMessage({role:"user",content:r}),this.messages.push({role:"user",content:r}),n.querySelectorAll("button").forEach(p=>{p.disabled=!0}),this.fetchAssistantReply()}),n.appendChild(o)}),i.appendChild(n),this.messageList.appendChild(i),this.scrollToBottom()}updateStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingText+=e,this.currentStreamingNode.textContent=this.currentStreamingText,this.scrollToBottom())}finalizeStreamingBubble(e){if(this.currentStreamingNode){this.currentStreamingNode.classList.remove("bless-chat-bubble--streaming");let s=N(e);if(s){this.messageList.removeChild(this.currentStreamingNode),this.currentStreamingNode=null,this.currentStreamingText="",this.createOptionsBubble(s.options,s.intro);return}this.currentStreamingNode.textContent=e.trim()}this.currentStreamingNode=null,this.currentStreamingText="",this.scrollToBottom()}pushAssistantMessage(e){let s={role:"assistant",content:e};this.appendMessage(s),this.messages.push(s)}setStatus(e,s=!1){e?(s?(this.statusEl.innerHTML='<span class="bless-typing" aria-hidden="true"><span></span><span></span><span></span></span>',this.statusEl.classList.add("is-typing"),this.statusEl.setAttribute("aria-label",e)):(this.statusEl.textContent=e,this.statusEl.classList.remove("is-typing"),this.statusEl.removeAttribute("aria-label")),this.statusEl.hidden=!1):(this.statusEl.hidden=!0,this.statusEl.classList.remove("is-typing"),this.statusEl.innerHTML="",this.statusEl.removeAttribute("aria-label"))}setError(e){e?(this.errorEl.textContent=e,this.errorEl.hidden=!1):(this.errorEl.hidden=!0,this.errorEl.textContent="")}scrollToBottom(){requestAnimationFrame(()=>{this.messageList.scrollTop=this.messageList.scrollHeight})}showRetryButton(){let e=document.createElement("button");e.type="button",e.className="bless-chat-retry",e.textContent="Try again",e.addEventListener("click",()=>{e.remove(),this.fetchAssistantReply()}),this.messageList.appendChild(e),this.scrollToBottom()}async fetchAssistantReply(){this.isProcessing=!0,this.sendBtn.disabled=!0,this.setError(),this.setStatus(this.options.loadingText,!0);let e=new AbortController,s=setTimeout(()=>e.abort(),3e4);try{let t=await fetch(this.options.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:this.messages}),signal:e.signal});if(clearTimeout(s),!t.ok){let i=await X(t);throw new Error((i==null?void 0:i.error)||`Request failed with status ${t.status}`)}if(Z(t))await this.handleStream(t);else{let i=await t.json(),n=(i==null?void 0:i.message)||"",r=!!(i!=null&&i.done);if(n){let o=L(n)||n;this.appendMessage({role:"assistant",content:o}),this.messages.push({role:"assistant",content:o}),this.onAssistantComplete(o,r),this.setStatus()}}}catch(t){clearTimeout(s),console.error("Bless chat error",t);let i="Something went wrong. Please try again.";t.name==="AbortError"?i="The response took too long. Let us try once more.":t!=null&&t.message&&(i=t.message),this.setError(i),this.showRetryButton()}finally{this.setStatus(),this.isProcessing=!1,this.sendBtn.disabled=!1}}recordStateMarker(e){if(!(e!=null&&e.marker))return;let s=e.marker.trim();s&&this.messages.push({role:"assistant",content:s})}async handleStream(e){var p,b,m,B,k;let s=(p=e.body)==null?void 0:p.getReader();if(!s){let w=await e.text();this.pushAssistantMessage(w);return}let t=!1,i="",n=null;this.appendMessage({role:"assistant",content:""},!0);let r=new TextDecoder,l="";for(;;){let{value:w,done:q}=await s.read();if(q)break;l+=r.decode(w,{stream:!0});let T=l.split(`

`);l=T.pop()||"";for(let I of T){let _=I.split(`
`),g="";for(let E of _)E.startsWith("data:")&&(g+=E.slice(5).trim());if(!g||g==="[DONE]")continue;let d;try{d=JSON.parse(g)}catch{console.warn("Unable to parse stream chunk",g);continue}if(d.type==="delta"&&typeof d.textDelta=="string")i+=d.textDelta,this.updateStreamingBubble(d.textDelta);else if(d.type==="done")n=d.meta||null,n&&typeof n.done=="boolean"?t=n.done:(n==null?void 0:n.state)==="compose_blessing"&&(t=!0),!i&&typeof d.text=="string"&&(i=d.text);else if(d.type==="meta")typeof d.done=="boolean"&&(t=d.done),d.marker&&(n=n!=null?n:{},n.marker||(n.marker=d.marker)),n||(n={state:d.state,sidthieKey:(b=d.sidthieKey)!=null?b:null,sidthieLabel:(m=d.sidthieLabel)!=null?m:null,userName:(B=d.userName)!=null?B:null,marker:(k=d.marker)!=null?k:null,done:d.done});else if(d.type==="error")throw new Error(d.message||"Unexpected error")}}let o=i.trim(),h=L(o)||o;this.finalizeStreamingBubble(h),this.messages.push({role:"assistant",content:h}),this.recordStateMarker(n||void 0),this.onAssistantComplete(h,t,n||void 0)}onAssistantComplete(e,s,t){if(e){if(s){this.incrementBlessingCount();let i=this.prepareBlessing(e),n=i.blessing||i.raw||e.trim();this.pendingBlessing=n,this.pendingBlessingMeta=t||null;let r=this.messageList.lastElementChild;r&&r.classList.contains("bless-chat-bubble")&&this.messageList.removeChild(r),this.showBlessingPreviewAndAskEmail(n,t);return}/image|upload|photo|picture/i.test(e)&&this.pushAssistantMessage("No image is needed. Let us continue in words.")}}extractBlessingPreview(e){let s=e.split(/[.!?]+/).filter(i=>i.trim().length>0);if(!s.length)return e.slice(0,150);let t=s[0].trim();return t.length<80&&s.length>1&&(t+=". "+s[1].trim()),t.length>150&&(t=t.slice(0,147)+"..."),t}showBlessingPreviewAndAskEmail(e,s){let t=this.extractBlessingPreview(e),i=document.createElement("div");i.className="bless-chat-bubble bless-chat-preview bless-chat-preview--truncated",i.textContent=t+"...",this.messageList.appendChild(i),this.scrollToBottom(),this.awaitingEmail=!0,this.inputEl.disabled=!0,this.sendBtn.disabled=!0,setTimeout(()=>{this.pushAssistantMessage("What's your email so I can send you the complete blessing?"),this.createEmailInputBubble()},800)}createEmailInputBubble(){let e=document.createElement("div");e.className="bless-chat-bubble bless-chat-email-bubble";let s=document.createElement("form");s.className="bless-chat-email-form";let t=document.createElement("div");t.className="bless-chat-email-wrapper";let i=document.createElement("input");i.type="email",i.className="bless-chat-email-input",i.placeholder="Enter your email",i.required=!0,i.autocomplete="email";let n=document.createElement("button");n.type="submit",n.className="bless-chat-email-submit",n.textContent="Receive blessing";let r=document.createElement("div");r.className="bless-chat-email-error",r.hidden=!0,t.appendChild(i),t.appendChild(n),s.appendChild(t),s.appendChild(r),e.appendChild(s),s.addEventListener("submit",async l=>{l.preventDefault();let o=i.value.trim();if(!this.validateEmail(o)){r.textContent="Please enter a valid email address",r.hidden=!1,i.focus();return}r.hidden=!0,i.disabled=!0,n.disabled=!0,n.textContent="Saving...",await this.handleEmailSubmission(o)}),this.messageList.appendChild(e),this.scrollToBottom(),i.focus()}validateEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}async handleEmailSubmission(e){var s,t;if(!this.pendingBlessing){this.pushAssistantMessage("Something went wrong. Please refresh and try again.");return}try{if(!await this.sendToN8N(e,this.pendingBlessing,this.pendingBlessingMeta||void 0))throw new Error("Webhook failed");this.collectedEmail=e,this.blessingDelivered=!0,C(S,"true"),this.displayBlessing(this.pendingBlessing,this.pendingBlessingMeta||void 0),this.pushAssistantMessage("Perfect! Your blessing has been sent to "+e);let n=((s=this.pendingBlessingMeta)==null?void 0:s.userName)||null,r=((t=this.pendingBlessingMeta)==null?void 0:t.sidthieKey)||null;this.redirectToThankYou(n||void 0,r||void 0)}catch(i){console.error("Email submission error:",i);let n=document.createElement("div");n.className="bless-chat-bubble bless-chat-error-bubble",n.textContent="We couldn't save your blessing right now. ";let r=document.createElement("button");r.type="button",r.className="bless-chat-retry",r.textContent="Try again",r.addEventListener("click",()=>{n.remove(),this.createEmailInputBubble()}),n.appendChild(r),this.messageList.appendChild(n),this.scrollToBottom()}}async sendToN8N(e,s,t){let i={email:e,userName:(t==null?void 0:t.userName)||null,blessedPersonName:(t==null?void 0:t.userName)||null,chosenSidthie:(t==null?void 0:t.sidthieKey)||null,sidthieLabel:(t==null?void 0:t.sidthieLabel)||null,blessingText:s,explanation:this.lastExplanation||null,timestamp:new Date().toISOString()};try{let n=new AbortController,r=setTimeout(()=>n.abort(),3e4),l=await fetch(this.N8N_WEBHOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i),signal:n.signal});return clearTimeout(r),l.ok?!0:(console.error("N8N webhook failed:",l.status,l.statusText),!1)}catch(n){return n.name==="AbortError"?console.error("N8N webhook timeout"):console.error("N8N webhook error:",n),!1}}redirectToThankYou(e,s){if(this.pendingBlessing)try{sessionStorage.setItem("bless-blessing-text",this.pendingBlessing),s&&sessionStorage.setItem("bless-sidthie-key",s)}catch{}let t=new URLSearchParams;e&&t.append("name",e),s&&t.append("sidthie",s);let i=`${this.THANK_YOU_PAGE}${t.toString()?"?"+t.toString():""}`;setTimeout(()=>{window.location.href=i},2e3)}prepareBlessing(e){let s=L(e),t=s.split(/\r?\n/).map(r=>r.trim()).filter(Boolean),i=[],n=[];for(let r of t)i.length<5&&!/^is the blessing/i.test(r)?i.push(r):/^is the blessing/i.test(r)||n.push(r);return{blessing:i.join(`
`),extra:n,raw:s}}displayBlessing(e,s){var r;let t=this.activeSidthie;!t&&(s!=null&&s.sidthieKey)&&(t=O(s.sidthieKey),t&&(this.activeSidthie=t)),!t&&(s!=null&&s.sidthieLabel)&&(t=H(s.sidthieLabel),t&&(this.activeSidthie=t));let i=this.lastExplanation||(t==null?void 0:t.description)||(t==null?void 0:t.short)||"";try{J(e)}catch{}let n={text:e,blessing:e,sidthie:(t==null?void 0:t.key)||null,sidthieLabel:(t==null?void 0:t.label)||null,explanation:i};if(this.renderBlessingPanel({blessing:e,explanation:i,sidthieLabel:(r=n.sidthieLabel)!=null?r:void 0}),t)try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:t.key,sidthieLabel:t.label}}))}catch{}window.dispatchEvent(new CustomEvent("blessing:ready",{detail:n})),window.dispatchEvent(new CustomEvent("blessing:update",{detail:n})),setTimeout(()=>{this.scrollToBottom();let l=document.querySelector("[data-bless-panel], .bless-blessing__panel, #bless-blessing__panel");l&&l.scrollIntoView({behavior:"smooth",block:"start"})},300)}renderBlessingPanel(e){let s=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(s).forEach(t=>{t.style.fontFamily="'Cormorant Upright', serif",t.style.whiteSpace="pre-line",t.style.textAlign="center",t.style.color="#fff",t.style.fontSize="clamp(18px, 2.4vw, 30px)",t.style.lineHeight="1.35",t.style.textShadow="0 2px 8px rgba(0,0,0,.55)";let i=t.querySelector("[data-blessing-output]")||t;i.textContent=e.blessing,i.removeAttribute("hidden");let n=t.querySelector("[data-blessing-meta]"),r=t.querySelector("[data-sidthie-title]"),l=t.querySelector("[data-sidthie-excerpt]");if(n){let b=!!e.sidthieLabel,m=!!e.explanation;r&&(b?(r.textContent=e.sidthieLabel,r.removeAttribute("hidden")):r.setAttribute("hidden","hidden")),l&&(m?(l.textContent=e.explanation,l.removeAttribute("hidden")):l.setAttribute("hidden","hidden")),b||m?n.removeAttribute("hidden"):n.setAttribute("hidden","hidden")}let o=t.querySelector("[data-blessing-signup]"),c=t.querySelector("[data-signup-prompt]"),h=t.querySelector("[data-signup-sidthie]"),p=(c==null?void 0:c.getAttribute("data-default-prompt"))||(c==null?void 0:c.textContent)||"";o&&(c&&(p.includes("{sidthie}")?c.textContent=p.replace("{sidthie}",e.sidthieLabel||"your Sidthie"):e.sidthieLabel&&(c.textContent=`${p} (${e.sidthieLabel})`)),h&&(h.value=e.sidthieLabel||""),o.removeAttribute("hidden"),o.style.display=""),setTimeout(()=>{window.dispatchEvent(new CustomEvent("blessing:sync",{detail:{blessing:e.blessing,sidthieLabel:e.sidthieLabel,explanation:e.explanation}}))},100)})}};function X(a){return a.clone().json().catch(()=>({}))}function Z(a){let e=a.headers.get("Content-Type")||a.headers.get("content-type");return e?/ndjson|stream/.test(e):!1}function Q(a){let e={},s=u(a.dataset.apiUrl);s&&(e.apiUrl=s);let t=u(a.dataset.placeholder);t&&(e.placeholder=t);let i=u(a.dataset.loadingText);i&&(e.loadingText=i);let n=z(a.dataset.requireBlessing);return typeof n=="boolean"&&(e.requireBlessing=n),e}function y(a,e){let s=a?document.querySelector(a):document.querySelector("[data-chat-container]");if(!s){console.warn("BlessChat: target container not found.");return}console.info("BlessChat: mounting widget",{selector:a,target:s});let t={...Q(s),...e||{}};new A(s,t).mount()}typeof window!="undefined"&&(window.BlessChat={mount:y},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>y()):setTimeout(()=>y(),0));return Y(ee);})();
//# sourceMappingURL=bless-chat-widget.js.map
