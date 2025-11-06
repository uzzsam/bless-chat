"use strict";var BlessChat=(()=>{var x=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var $=Object.getOwnPropertyNames;var F=Object.prototype.hasOwnProperty;var W=(r,e)=>{for(var s in e)x(r,s,{get:e[s],enumerable:!0})},z=(r,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of $(e))!F.call(r,i)&&i!==s&&x(r,i,{get:()=>e[i],enumerable:!(t=D(e,i))||t.enumerable});return r};var K=r=>z(x({},"__esModule",{value:!0}),r);var te={};W(te,{mount:()=>v});var f={apiUrl:"https://bless-test-brown.vercel.app/api/chat",placeholder:"Talk to Sidthah",sendAriaLabel:"Send message",loadingText:"Listening...",requireBlessing:!0};function b(r){if(r==null)return;let e=r.toString().trim();if(!e)return;let s=e.toLowerCase();if(!(s==="undefined"||s==="null"))return e}function j(r){if(r==null)return;let e=r.toString().trim().toLowerCase();if(!e)return!0;if(["false","0","no","off","disabled"].includes(e))return!1;if(["true","1","yes","on","enabled"].includes(e))return!0}var P=`
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
  content: '\u258A';
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

/* Email capture styles */
.bless-chat-email-capture {
  display: grid;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 32px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.24);
}

.bless-chat-email-label {
  font-size: 1rem;
  color: rgba(var(--bless-cream-100), 0.92);
  text-align: center;
}

.bless-chat-email-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.bless-chat-email-input {
  flex: 1 1 200px;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.24);
  background: transparent;
  color: rgba(var(--bless-cream-100), 0.92);
  font-size: 1rem;
}

.bless-chat-email-input::placeholder {
  color: rgba(var(--bless-cream-100), 0.45);
}

.bless-chat-email-input:focus {
  outline: none;
  border-color: rgba(255,255,255,0.35);
}

.bless-chat-email-button {
  padding: 0.8rem 2rem;
  border-radius: 999px;
  border: none;
  background: radial-gradient(circle at 30% 30%, rgba(var(--bless-gold-400),0.95), rgba(var(--bless-gold-400),0.82));
  color: rgb(var(--bless-green-900));
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform 180ms ease;
}

.bless-chat-email-button:hover {
  transform: translateY(-2px);
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
  
  .bless-chat-email-row {
    flex-direction: column;
  }
  
  .bless-chat-email-button {
    width: 100%;
  }
}
`,R=document.createElement("style");R.textContent=P;document.head.appendChild(R);var H={NALAMERA:{key:"NALAMERA",label:"Inner Strength",short:"A steady courage that rises quietly from within.",description:"Nalamera steadies the breath and roots the heart; she carries the quiet strength that holds families together when storms arrive."},LUMASARA:{key:"LUMASARA",label:"Happiness",short:"A soft, luminous joy that brightens the ordinary.",description:"Lumasara brightens every ordinary moment with the glow of celebration, inviting laughter to linger like sunlight through leaves."},WELAMORA:{key:"WELAMORA",label:"Love",short:"A tender presence that listens and embraces.",description:"Welamora listens with the whole heart, weaving warmth and devotion so love can be felt in every touch and every word."},NIRALUMA:{key:"NIRALUMA",label:"Bliss",short:"A calm clarity that sees the path with kindness.",description:"Niraluma pours lantern-light across the path ahead, offering gentle bliss and serene grace to every decision you make."},OLANWELA:{key:"OLANWELA",label:"Health",short:"A quiet mending that restores balance and breath.",description:"Olanwela soothes weary hearts and tired bones, bathing the spirit in cool rivers of renewal and vital health."},RAKAWELA:{key:"RAKAWELA",label:"Peace",short:"A gentle guard that shelters what is precious.",description:"Rakawela stands as a quiet guardian, wrapping loved ones in peaceful kindness and turning away every shadow that approaches."},MORASARA:{key:"MORASARA",label:"Fortune",short:"A stillness that settles and softens the heart.",description:"Morasara settles like evening mist, inviting deep breaths, calm conversations, and the promise of good fortune wherever you stand."}},y=Object.values(H);function q(r){var s;if(!r)return null;let e=r.toUpperCase();return(s=H[e])!=null?s:null}function O(r){var s,t;if(!r)return null;let e=r.trim().toLowerCase();return(t=(s=y.find(i=>i.label.toLowerCase()===e))!=null?s:y.find(i=>e.includes(i.label.toLowerCase())))!=null?t:null}function Y(){return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`}var L="bless-chat-blessing-created",G=[/Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,/How can I assist you with (them|it|the files?)\?.*$/gim,/Would you like me to search for specific information.*$/gim,/or summarize the content\?.*$/gim,/\【\d+:\d+†source\】/g,/To create a personalized blessing.*?providing the files?!?/gim,/and for providing the files?!?/gim];function S(r){let e=r!=null?r:"";return G.forEach(s=>{e=e.replace(s,"")}),e.trim()}function J(r){try{return typeof sessionStorage!="undefined"?sessionStorage.getItem(r):null}catch{return null}}function M(r,e){try{typeof sessionStorage!="undefined"&&sessionStorage.setItem(r,e)}catch{}}function V(r){let e=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(e).forEach(s=>{s.style.fontFamily="'Cormorant Upright', serif",s.style.whiteSpace="pre-line",s.style.textAlign="center",s.style.color="#fff",s.style.fontSize="clamp(18px, 2.4vw, 30px)",s.style.lineHeight="1.35",s.style.textShadow="0 2px 8px rgba(0,0,0,.55)",s.textContent=r})}function N(r){if(!r)return null;let e=r.replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g,`
$2. `).replace(/\s{2,}/g," ").trim(),s=e.split(/\r?\n/).map(o=>o.trim()).filter(Boolean);if(s.filter(o=>/^[1-7]\.\s*/.test(o)).length<7)return null;let n=s.filter(o=>!/^[1-7]\.\s*/.test(o)).join(" ").trim();if(!y.every(o=>e.toLowerCase().includes(o.label.toLowerCase())||e.includes(`(${o.key})`)))return null;let d=y.map(o=>`${o.label} (${o.key})`);return{intro:n,options:d,metas:y}}function X(r){if(!r)return null;let e=r.match(/\(([A-Za-z]+)\)\s*$/);if(e){let t=q(e[1]);if(t)return t}let s=r.replace(/\([^)]*\)/g,"").trim();return O(s)}var A=class{constructor(e,s){this.messages=[];this.isProcessing=!1;this.blessingDelivered=!1;this.currentStreamingNode=null;this.currentStreamingText="";this.activeSidthie=null;this.lastExplanation="";this.awaitingEmail=!1;this.userEmail=null;this.blessingCount=0;this.MAX_BLESSINGS=3;this.STORAGE_KEY="bless-chat-session-count";var i,n,a,d;this.container=e;let t={...f,...s||{}};this.options={apiUrl:(i=b(t.apiUrl))!=null?i:f.apiUrl,placeholder:(n=b(t.placeholder))!=null?n:f.placeholder,sendAriaLabel:(a=b(t.sendAriaLabel))!=null?a:f.sendAriaLabel,loadingText:(d=b(t.loadingText))!=null?d:f.loadingText,requireBlessing:t.requireBlessing},this.blessingDelivered=J(L)==="true",this.blessingCount=this.getBlessingCount(),!this.options.requireBlessing&&this.blessingDelivered&&(this.blessingDelivered=!1)}getBlessingCount(){try{let e=sessionStorage.getItem(this.STORAGE_KEY);return e?parseInt(e,10):0}catch{return 0}}incrementBlessingCount(){this.blessingCount+=1;try{sessionStorage.setItem(this.STORAGE_KEY,this.blessingCount.toString())}catch{}}hasReachedLimit(){return this.blessingCount>=this.MAX_BLESSINGS}showLimitReached(){this.pushAssistantMessage(`Three blessings daily allows each to settle deeply. You have received ${this.blessingCount} blessing${this.blessingCount>1?"s":""} this session. Close your browser to begin a new session, or return tomorrow for fresh blessings.`),this.inputEl.disabled=!0,this.sendBtn.disabled=!0}mount(){let e=b(this.container.dataset.chatWidth);e&&this.container.style.setProperty("--bless-chat-max-width",e);let s=b(this.container.dataset.chatRadius);s&&this.container.style.setProperty("--bless-chat-radius",s),this.container.innerHTML="",this.container.classList.add("bless-chat-shell");let t=document.createElement("div");t.className="bless-chat-window",this.messageList=document.createElement("div"),this.messageList.className="bless-chat-messages",this.statusEl=document.createElement("div"),this.statusEl.className="bless-chat-bubble bless-chat-bubble--status",this.statusEl.hidden=!0,this.errorEl=document.createElement("div"),this.errorEl.className="bless-chat-error",this.errorEl.hidden=!0;let i=document.createElement("form");i.className="bless-chat-input-row";let n=document.createElement("div");n.className="bless-chat-input-wrapper",this.inputEl=document.createElement("input"),this.inputEl.type="text",this.inputEl.className="bless-chat-input",this.inputEl.placeholder=this.options.placeholder,this.inputEl.autocomplete="off",this.inputEl.spellcheck=!1,this.inputEl.setAttribute("aria-label",this.options.placeholder),n.appendChild(this.inputEl),this.sendBtn=document.createElement("button"),this.sendBtn.type="submit",this.sendBtn.className="bless-chat-send",this.sendBtn.setAttribute("aria-label",this.options.sendAriaLabel),this.sendBtn.innerHTML=Y(),i.append(n,this.sendBtn),i.addEventListener("submit",a=>{a.preventDefault(),this.handleSubmit()}),this.messageList.addEventListener("scroll",()=>{this.messageList.scrollTop===0?this.messageList.classList.add("scrolled-top"):this.messageList.classList.remove("scrolled-top")}),t.append(this.messageList,this.statusEl,i,this.errorEl),this.container.appendChild(t),this.inputEl.addEventListener("keydown",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),this.handleSubmit())}),this.blessingDelivered&&this.options.requireBlessing?this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below."):this.hasReachedLimit()?this.showLimitReached():(this.options.requireBlessing||M(L,"false"),this.startConversation())}async startConversation(){this.activeSidthie=null,this.lastExplanation="",await this.fetchAssistantReply()}async handleSubmit(){if(this.isProcessing)return;let e=this.inputEl.value.trim();if(!e){this.inputEl.reportValidity();return}if(this.blessingDelivered&&this.options.requireBlessing){this.pushAssistantMessage("Your blessing has been created. Scroll down to read it."),this.inputEl.value="";return}this.appendMessage({role:"user",content:e}),this.inputEl.value="",this.messages.push({role:"user",content:e}),await this.fetchAssistantReply()}appendMessage(e,s=!1){if(e.role==="assistant"&&!s){this.captureExplanation(e.content);let i=N(e.content);if(i){this.messages.push({role:"assistant",content:e.content}),this.createOptionsBubble(i.options,i.intro,i.metas);return}}let t=document.createElement("div");t.className="bless-chat-bubble",e.role==="user"&&t.classList.add("bless-chat-bubble--user"),t.textContent=e.content,this.messageList.appendChild(t),this.scrollToBottom(),e.role==="assistant"&&s&&(t.classList.add("bless-chat-bubble--streaming"),this.currentStreamingNode=t,this.currentStreamingText=e.content)}captureExplanation(e){if(!e)return;let s=e.split(`

`);if(s.length>0){let t=s[0].trim();t.length>30&&t.length<300&&(this.lastExplanation=t)}}createOptionsBubble(e,s,t){if(this.activeSidthie=null,s){let a=document.createElement("div");a.className="bless-chat-bubble",a.textContent=s,this.messageList.appendChild(a),this.scrollToBottom()}let i=document.createElement("div");i.className="bless-chat-bubble";let n=document.createElement("div");n.className="bless-chat-options",e.forEach((a,d)=>{let o=document.createElement("button");o.type="button",o.className="bless-chat-option",o.textContent=a,o.addEventListener("click",()=>{var h;let c=(h=t==null?void 0:t[d])!=null?h:X(a);if(c){this.activeSidthie=c;try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:c.key,sidthieLabel:c.label}}))}catch{}}this.appendMessage({role:"user",content:a}),this.messages.push({role:"user",content:a}),n.querySelectorAll("button").forEach(u=>{u.disabled=!0}),this.fetchAssistantReply()}),n.appendChild(o)}),i.appendChild(n),this.messageList.appendChild(i),this.scrollToBottom()}updateStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingText+=e,this.currentStreamingNode.textContent=this.currentStreamingText,this.scrollToBottom())}finalizeStreamingBubble(e){if(this.currentStreamingNode){this.currentStreamingNode.classList.remove("bless-chat-bubble--streaming");let s=N(e);if(s){this.messageList.removeChild(this.currentStreamingNode),this.currentStreamingNode=null,this.currentStreamingText="",this.createOptionsBubble(s.options,s.intro);return}this.currentStreamingNode.textContent=e.trim()}this.currentStreamingNode=null,this.currentStreamingText="",this.scrollToBottom()}pushAssistantMessage(e){let s={role:"assistant",content:e};this.appendMessage(s),this.messages.push(s)}setStatus(e,s=!1){e?(s?(this.statusEl.innerHTML='<span class="bless-typing" aria-hidden="true"><span></span><span></span><span></span></span>',this.statusEl.classList.add("is-typing"),this.statusEl.setAttribute("aria-label",e)):(this.statusEl.textContent=e,this.statusEl.classList.remove("is-typing"),this.statusEl.removeAttribute("aria-label")),this.statusEl.hidden=!1):(this.statusEl.hidden=!0,this.statusEl.classList.remove("is-typing"),this.statusEl.innerHTML="",this.statusEl.removeAttribute("aria-label"))}setError(e){e?(this.errorEl.textContent=e,this.errorEl.hidden=!1):(this.errorEl.hidden=!0,this.errorEl.textContent="")}scrollToBottom(){requestAnimationFrame(()=>{this.messageList.scrollTop=this.messageList.scrollHeight})}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}showEmailInput(){if(this.messageList.querySelector(".bless-chat-email-capture")){this.awaitingEmail=!1;return}this.awaitingEmail=!1;let e=document.createElement("div");e.className="bless-chat-email-capture";let s=document.createElement("label");s.className="bless-chat-email-label",s.textContent="Enter your email to receive your blessing:";let t=document.createElement("div");t.className="bless-chat-email-row";let i=document.createElement("input");i.type="email",i.className="bless-chat-email-input",i.placeholder="your@email.com",i.required=!0;let n=document.createElement("button");n.type="button",n.className="bless-chat-email-button",n.textContent="Continue",n.addEventListener("click",()=>{let a=i.value.trim();this.isValidEmail(a)?(this.userEmail=a,this.awaitingEmail=!1,e.remove(),this.appendMessage({role:"user",content:a}),this.messages.push({role:"user",content:a}),this.fetchAssistantReply()):this.setError("Please enter a valid email address.")}),t.append(i,n),e.append(s,t),this.messageList.appendChild(e),this.scrollToBottom(),i.focus()}showRetryButton(){let e=document.createElement("button");e.type="button",e.className="bless-chat-retry",e.textContent="Try again",e.addEventListener("click",()=>{e.remove(),this.fetchAssistantReply()}),this.messageList.appendChild(e),this.scrollToBottom()}async fetchAssistantReply(){this.isProcessing=!0,this.sendBtn.disabled=!0,this.setError(),this.setStatus(this.options.loadingText,!0);let e=new AbortController,s=setTimeout(()=>e.abort(),3e4);try{let t=await fetch(this.options.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:this.messages}),signal:e.signal});if(clearTimeout(s),!t.ok){let i=await Z(t);throw new Error((i==null?void 0:i.error)||`Request failed with status ${t.status}`)}if(Q(t))await this.handleStream(t);else{let i=await t.json(),n=(i==null?void 0:i.message)||"",a=!!(i!=null&&i.done);if(n){let o=S(n)||n;this.appendMessage({role:"assistant",content:o}),this.messages.push({role:"assistant",content:o}),this.onAssistantComplete(o,a),this.setStatus()}}}catch(t){clearTimeout(s),console.error("Bless chat error",t);let i="Something went wrong. Please try again.";t.name==="AbortError"?i="The response took too long. Let us try once more.":t!=null&&t.message&&(i=t.message),this.setError(i),this.showRetryButton()}finally{this.setStatus(),this.isProcessing=!1,this.sendBtn.disabled=!1}}recordStateMarker(e){if(!(e!=null&&e.marker))return;let s=e.marker.trim();s&&this.messages.push({role:"assistant",content:s})}async handleStream(e){var u,p,m,k,T,B;let s=(u=e.body)==null?void 0:u.getReader();if(!s){let w=await e.text();this.pushAssistantMessage(w);return}let t=!1,i="",n=null;this.appendMessage({role:"assistant",content:""},!0);let a=new TextDecoder,d="";for(;;){let{value:w,done:I}=await s.read();if(I)break;d+=a.decode(w,{stream:!0});let C=d.split(`

`);d=C.pop()||"";for(let U of C){let _=U.split(`
`),g="";for(let E of _)E.startsWith("data:")&&(g+=E.slice(5).trim());if(!g||g==="[DONE]")continue;let l;try{l=JSON.parse(g)}catch{console.warn("Unable to parse stream chunk",g);continue}if(l.type==="delta"&&typeof l.textDelta=="string")i+=l.textDelta,this.updateStreamingBubble(l.textDelta);else if(l.type==="done")n=l.meta||null,n&&typeof n.done=="boolean"?t=n.done:(n==null?void 0:n.state)==="compose_blessing"&&(t=!0),!i&&typeof l.text=="string"&&(i=l.text);else if(l.type==="meta")typeof l.state=="string"&&l.state==="ask_email"&&(this.awaitingEmail=!0),typeof l.done=="boolean"&&(t=l.done),l.marker&&(n=n!=null?n:{},n.marker||(n.marker=l.marker)),n||(n={state:l.state,sidthieKey:(p=l.sidthieKey)!=null?p:null,sidthieLabel:(m=l.sidthieLabel)!=null?m:null,userEmail:(k=l.userEmail)!=null?k:null,userName:(T=l.userName)!=null?T:null,marker:(B=l.marker)!=null?B:null,done:l.done});else if(l.type==="error")throw new Error(l.message||"Unexpected error")}}let o=i.trim(),h=S(o)||o;this.finalizeStreamingBubble(h),this.messages.push({role:"assistant",content:h}),this.recordStateMarker(n||void 0),this.awaitingEmail?this.showEmailInput():this.onAssistantComplete(h,t,n||void 0)}onAssistantComplete(e,s,t){if(e){if(s){this.incrementBlessingCount();let i=this.prepareBlessing(e),n=i.blessing||i.raw||e.trim();this.blessingDelivered=!0,M(L,"true");let a=this.messageList.lastElementChild;a&&a.classList.contains("bless-chat-bubble")&&this.messageList.removeChild(a),this.displayBlessing(n,t);let d=this.activeSidthie,c=(this.lastExplanation||"").replace(/\s+$/,"").split(/[.!?]/).map(p=>p.trim()).filter(Boolean)[0]||"",h=[];if(d?h.push(`The blessing of ${d.label} is woven around you now.`):h.push("Your blessing is woven around you now."),c){let p=c.charAt(0).toLowerCase()+c.slice(1);h.push(`Hold close this sense of ${p} as you receive it below.`)}else h.push("Follow the glow below to receive it.");this.pushAssistantMessage(h.join(" "));let u=this.MAX_BLESSINGS-this.blessingCount;u>0?this.pushAssistantMessage(`This blessing is now with you. You may receive ${u} more blessing${u>1?"s":""} this session.`):(this.pushAssistantMessage("This completes your three blessings for this session. Each blessing needs time to settle. Close your browser to begin a new session, or return tomorrow."),this.inputEl.disabled=!0,this.sendBtn.disabled=!0),this.userEmail&&n&&this.sendBlessingEmail(n,t);return}/image|upload|photo|picture/i.test(e)&&this.pushAssistantMessage("No image is needed. Let us continue in words.")}}async sendBlessingEmail(e,s){var t,i,n;try{(await fetch("/api/send-blessing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:this.userEmail,blessing:e,sidthieKey:((t=this.activeSidthie)==null?void 0:t.key)||(s==null?void 0:s.sidthieKey)||null,sidthieLabel:((i=this.activeSidthie)==null?void 0:i.label)||null,explanation:this.lastExplanation||((n=this.activeSidthie)==null?void 0:n.description)||null,userName:null})})).ok||console.error("Failed to send blessing email")}catch(a){console.error("Error sending blessing email:",a)}}prepareBlessing(e){let s=S(e),t=s.split(/\r?\n/).map(a=>a.trim()).filter(Boolean),i=[],n=[];for(let a of t)i.length<5&&!/^is the blessing/i.test(a)?i.push(a):/^is the blessing/i.test(a)||n.push(a);return{blessing:i.join(`
`),extra:n,raw:s}}displayBlessing(e,s){var a;let t=this.activeSidthie;!t&&(s!=null&&s.sidthieKey)&&(t=q(s.sidthieKey),t&&(this.activeSidthie=t)),!t&&(s!=null&&s.sidthieLabel)&&(t=O(s.sidthieLabel),t&&(this.activeSidthie=t));let i=this.lastExplanation||(t==null?void 0:t.description)||(t==null?void 0:t.short)||"";try{V(e)}catch{}let n={text:e,blessing:e,sidthie:(t==null?void 0:t.key)||null,sidthieLabel:(t==null?void 0:t.label)||null,explanation:i};if(this.renderBlessingPanel({blessing:e,explanation:i,sidthieLabel:(a=n.sidthieLabel)!=null?a:void 0}),t)try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:t.key,sidthieLabel:t.label}}))}catch{}window.dispatchEvent(new CustomEvent("blessing:ready",{detail:n})),window.dispatchEvent(new CustomEvent("blessing:update",{detail:n}))}renderBlessingPanel(e){let s=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(s).forEach(t=>{t.style.fontFamily="'Cormorant Upright', serif",t.style.whiteSpace="pre-line",t.style.textAlign="center",t.style.color="#fff",t.style.fontSize="clamp(18px, 2.4vw, 30px)",t.style.lineHeight="1.35",t.style.textShadow="0 2px 8px rgba(0,0,0,.55)";let i=t.querySelector("[data-blessing-output]")||t;i.textContent=e.blessing,i.removeAttribute("hidden");let n=t.querySelector("[data-blessing-meta]"),a=t.querySelector("[data-sidthie-title]"),d=t.querySelector("[data-sidthie-excerpt]");if(n){let p=!!e.sidthieLabel,m=!!e.explanation;a&&(p?(a.textContent=e.sidthieLabel,a.removeAttribute("hidden")):a.setAttribute("hidden","hidden")),d&&(m?(d.textContent=e.explanation,d.removeAttribute("hidden")):d.setAttribute("hidden","hidden")),p||m?n.removeAttribute("hidden"):n.setAttribute("hidden","hidden")}let o=t.querySelector("[data-blessing-signup]"),c=t.querySelector("[data-signup-prompt]"),h=t.querySelector("[data-signup-sidthie]"),u=(c==null?void 0:c.getAttribute("data-default-prompt"))||(c==null?void 0:c.textContent)||"";o&&(c&&(u.includes("{sidthie}")?c.textContent=u.replace("{sidthie}",e.sidthieLabel||"your Sidthie"):e.sidthieLabel&&(c.textContent=`${u} (${e.sidthieLabel})`)),h&&(h.value=e.sidthieLabel||""),o.removeAttribute("hidden"))})}};function Z(r){return r.clone().json().catch(()=>({}))}function Q(r){let e=r.headers.get("Content-Type")||r.headers.get("content-type");return e?/ndjson|stream/.test(e):!1}function ee(r){let e={},s=b(r.dataset.apiUrl);s&&(e.apiUrl=s);let t=b(r.dataset.placeholder);t&&(e.placeholder=t);let i=b(r.dataset.loadingText);i&&(e.loadingText=i);let n=j(r.dataset.requireBlessing);return typeof n=="boolean"&&(e.requireBlessing=n),e}function v(r,e){let s=r?document.querySelector(r):document.querySelector("[data-chat-container]");if(!s){console.warn("BlessChat: target container not found.");return}console.info("BlessChat: mounting widget",{selector:r,target:s});let t={...ee(s),...e||{}};new A(s,t).mount()}typeof window!="undefined"&&(window.BlessChat={mount:v},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>v()):setTimeout(()=>v(),0));return K(te);})();
//# sourceMappingURL=bless-chat-widget.js.map
