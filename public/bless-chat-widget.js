"use strict";var BlessChat=(()=>{var x=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var q=Object.getOwnPropertyNames;var O=Object.prototype.hasOwnProperty;var U=(n,e)=>{for(var s in e)x(n,s,{get:e[s],enumerable:!0})},D=(n,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of q(e))!O.call(n,i)&&i!==s&&x(n,i,{get:()=>e[i],enumerable:!(t=R(e,i))||t.enumerable});return n};var I=n=>D(x({},"__esModule",{value:!0}),n);var V={};U(V,{mount:()=>v});var m={apiUrl:"https://bless-test-brown.vercel.app/api/chat",placeholder:"Talk to Sidthah",sendAriaLabel:"Send message",loadingText:"Listening...",requireBlessing:!0};function p(n){if(n==null)return;let e=n.toString().trim();if(!e)return;let s=e.toLowerCase();if(!(s==="undefined"||s==="null"))return e}function W(n){if(n==null)return;let e=n.toString().trim().toLowerCase();if(!e)return!0;if(["false","0","no","off","disabled"].includes(e))return!1;if(["true","1","yes","on","enabled"].includes(e))return!0}var F=`
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
  /* Align all message text to the left for improved readability */
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
  /* Remove default background or hover effects that could turn the input white */
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

/* Ensure input remains transparent on hover and focus */
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

/* Additional styles for Sidthie option buttons */
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
`,B=document.createElement("style");B.textContent=F;document.head.appendChild(B);var M={NALAMERA:{key:"NALAMERA",label:"Inner Strength",short:"A steady courage that rises quietly from within.",description:"Nalamera steadies the breath and roots the heart; she carries the quiet strength that holds families together when storms arrive."},LUMASARA:{key:"LUMASARA",label:"Happiness",short:"A soft, luminous joy that brightens the ordinary.",description:"Lumasara brightens every ordinary moment with the glow of celebration, inviting laughter to linger like sunlight through leaves."},WELAMORA:{key:"WELAMORA",label:"Love",short:"A tender presence that listens and embraces.",description:"Welamora listens with the whole heart, weaving warmth and devotion so love can be felt in every touch and every word."},NIRALUMA:{key:"NIRALUMA",label:"Wisdom",short:"A calm clarity that sees the path with kindness.",description:"Niraluma pours lantern-light across the path ahead, offering gentle insight and elder grace to every decision you make."},RAKAWELA:{key:"RAKAWELA",label:"Protection",short:"A gentle guard that shelters what is precious.",description:"Rakawela stands as a quiet guardian, wrapping loved ones in vigilant kindness and turning away every shadow that approaches."},OLANWELA:{key:"OLANWELA",label:"Healing",short:"A quiet mending that restores balance and breath.",description:"Olanwela soothes weary hearts and tired bones, bathing the spirit in cool rivers of renewal and compassionate rest."},MORASARA:{key:"MORASARA",label:"Peace",short:"A stillness that settles and softens the heart.",description:"Morasara settles like evening mist, inviting deep breaths, calm conversations, and the promise of belonging wherever you stand."}},f=Object.values(M);function C(n){var s;if(!n)return null;let e=n.toUpperCase();return(s=M[e])!=null?s:null}function $(n){var s,t;if(!n)return null;let e=n.trim().toLowerCase();return(t=(s=f.find(i=>i.label.toLowerCase()===e))!=null?s:f.find(i=>e.includes(i.label.toLowerCase())))!=null?t:null}function j(){return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`}var E="bless-chat-blessing-created",z=[/Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,/How can I assist you with (them|it|the files?)\?.*$/gim,/Would you like me to search for specific information.*$/gim,/or summarize the content\?.*$/gim,/\【\d+:\d+†source\】/g,/To create a personalized blessing.*?providing the files?!?/gim,/and for providing the files?!?/gim];function L(n){let e=n!=null?n:"";return z.forEach(s=>{e=e.replace(s,"")}),e.trim()}function _(n){try{return typeof sessionStorage!="undefined"?sessionStorage.getItem(n):null}catch{return null}}function T(n,e){try{typeof sessionStorage!="undefined"&&sessionStorage.setItem(n,e)}catch{}}function P(n){let e=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(e).forEach(s=>{s.style.fontFamily="'Cormorant Upright', serif",s.style.whiteSpace="pre-line",s.style.textAlign="center",s.style.color="#fff",s.style.fontSize="clamp(18px, 2.4vw, 30px)",s.style.lineHeight="1.35",s.style.textShadow="0 2px 8px rgba(0,0,0,.55)",s.textContent=n})}function k(n){if(!n)return null;let e=n.replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g,`
$2. `).replace(/\s{2,}/g," ").trim(),s=e.split(/\r?\n/).map(o=>o.trim()).filter(Boolean);if(s.filter(o=>/^[1-7]\.\s*/.test(o)).length<7)return null;let a=s.filter(o=>!/^[1-7]\.\s*/.test(o)).join(" ").trim();if(!f.every(o=>e.toLowerCase().includes(o.label.toLowerCase())||e.includes(`(${o.key})`)))return null;let l=f.map(o=>`${o.label} (${o.key})`);return{intro:a,options:l,metas:f}}function K(n){if(!n)return null;let e=n.match(/\(([A-Za-z]+)\)\s*$/);if(e){let t=C(e[1]);if(t)return t}let s=n.replace(/\([^)]*\)/g,"").trim();return $(s)}var S=class{constructor(e,s){this.messages=[];this.isProcessing=!1;this.blessingDelivered=!1;this.currentStreamingNode=null;this.currentStreamingText="";this.activeSidthie=null;this.lastExplanation="";var i,a,r,l;this.container=e;let t={...m,...s||{}};this.options={apiUrl:(i=p(t.apiUrl))!=null?i:m.apiUrl,placeholder:(a=p(t.placeholder))!=null?a:m.placeholder,sendAriaLabel:(r=p(t.sendAriaLabel))!=null?r:m.sendAriaLabel,loadingText:(l=p(t.loadingText))!=null?l:m.loadingText,requireBlessing:t.requireBlessing},this.blessingDelivered=_(E)==="true",!this.options.requireBlessing&&this.blessingDelivered&&(this.blessingDelivered=!1)}mount(){let e=p(this.container.dataset.chatWidth);e&&this.container.style.setProperty("--bless-chat-max-width",e);let s=p(this.container.dataset.chatRadius);s&&this.container.style.setProperty("--bless-chat-radius",s),this.container.innerHTML="",this.container.classList.add("bless-chat-shell");let t=document.createElement("div");t.className="bless-chat-window",this.messageList=document.createElement("div"),this.messageList.className="bless-chat-messages",this.statusEl=document.createElement("div"),this.statusEl.className="bless-chat-bubble bless-chat-bubble--status",this.statusEl.hidden=!0,this.errorEl=document.createElement("div"),this.errorEl.className="bless-chat-error",this.errorEl.hidden=!0;let i=document.createElement("form");i.className="bless-chat-input-row";let a=document.createElement("div");a.className="bless-chat-input-wrapper",this.inputEl=document.createElement("input"),this.inputEl.type="text",this.inputEl.className="bless-chat-input",this.inputEl.placeholder=this.options.placeholder,this.inputEl.autocomplete="off",this.inputEl.spellcheck=!1,this.inputEl.setAttribute("aria-label",this.options.placeholder),a.appendChild(this.inputEl),this.sendBtn=document.createElement("button"),this.sendBtn.type="submit",this.sendBtn.className="bless-chat-send",this.sendBtn.setAttribute("aria-label",this.options.sendAriaLabel),this.sendBtn.innerHTML=j(),i.append(a,this.sendBtn),i.addEventListener("submit",r=>{r.preventDefault(),this.handleSubmit()}),this.messageList.addEventListener("scroll",()=>{this.messageList.scrollTop===0?this.messageList.classList.add("scrolled-top"):this.messageList.classList.remove("scrolled-top")}),t.append(this.messageList,this.statusEl,i,this.errorEl),this.container.appendChild(t),this.inputEl.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),this.handleSubmit())}),this.blessingDelivered&&this.options.requireBlessing?this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below."):(this.options.requireBlessing||T(E,"false"),this.startConversation())}async startConversation(){this.activeSidthie=null,this.lastExplanation="",await this.fetchAssistantReply()}async handleSubmit(){if(this.isProcessing)return;let e=this.inputEl.value.trim();if(!e){this.inputEl.reportValidity();return}if(this.blessingDelivered&&this.options.requireBlessing){this.pushAssistantMessage("Your blessing has been created. Scroll down to read it."),this.inputEl.value="";return}this.appendMessage({role:"user",content:e}),this.inputEl.value="",this.messages.push({role:"user",content:e}),await this.fetchAssistantReply()}appendMessage(e,s=!1){if(e.role==="assistant"&&!s){this.captureExplanation(e.content);let i=k(e.content);if(i){this.messages.push({role:"assistant",content:e.content}),this.createOptionsBubble(i.options,i.intro,i.metas);return}}let t=document.createElement("div");t.className="bless-chat-bubble",e.role==="user"&&t.classList.add("bless-chat-bubble--user"),t.textContent=e.content,this.messageList.appendChild(t),this.scrollToBottom(),e.role==="assistant"&&s&&(this.currentStreamingNode=t,this.currentStreamingText=e.content)}captureExplanation(e){var r;if(!e)return;let t=e.indexOf("Is the blessing for yourself or someone else? When you think of your Sidthie and the blessing, what feels most present at this moment?");if(t===-1)return;let i=e.slice(0,t).trim();if(!i)return;let a=(r=i.split(/\n\s*\n/)[0])==null?void 0:r.trim();a&&(this.lastExplanation=a)}createOptionsBubble(e,s,t){if(this.activeSidthie=null,s){let r=document.createElement("div");r.className="bless-chat-bubble",r.textContent=s,this.messageList.appendChild(r),this.scrollToBottom()}let i=document.createElement("div");i.className="bless-chat-bubble";let a=document.createElement("div");a.className="bless-chat-options",e.forEach((r,l)=>{let o=document.createElement("button");o.type="button",o.className="bless-chat-option",o.textContent=r,o.addEventListener("click",()=>{var c;let d=(c=t==null?void 0:t[l])!=null?c:K(r);if(d){this.activeSidthie=d;try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:d.key,sidthieLabel:d.label}}))}catch{}}this.appendMessage({role:"user",content:r}),this.messages.push({role:"user",content:r}),a.querySelectorAll("button").forEach(h=>{h.disabled=!0}),this.fetchAssistantReply()}),a.appendChild(o)}),i.appendChild(a),this.messageList.appendChild(i),this.scrollToBottom()}updateStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingText+=e,this.currentStreamingNode.textContent=this.currentStreamingText,this.scrollToBottom())}finalizeStreamingBubble(e){if(this.currentStreamingNode){let s=k(e);if(s){this.messageList.removeChild(this.currentStreamingNode),this.currentStreamingNode=null,this.currentStreamingText="",this.createOptionsBubble(s.options,s.intro);return}this.currentStreamingNode.textContent=e.trim()}this.currentStreamingNode=null,this.currentStreamingText="",this.scrollToBottom()}pushAssistantMessage(e){let s={role:"assistant",content:e};this.appendMessage(s),this.messages.push(s)}setStatus(e,s=!1){e?(s?(this.statusEl.innerHTML='<span class="bless-typing" aria-hidden="true"><span></span><span></span><span></span></span>',this.statusEl.classList.add("is-typing"),this.statusEl.setAttribute("aria-label",e)):(this.statusEl.textContent=e,this.statusEl.classList.remove("is-typing"),this.statusEl.removeAttribute("aria-label")),this.statusEl.hidden=!1):(this.statusEl.hidden=!0,this.statusEl.classList.remove("is-typing"),this.statusEl.innerHTML="",this.statusEl.removeAttribute("aria-label"))}setError(e){e?(this.errorEl.textContent=e,this.errorEl.hidden=!1):(this.errorEl.hidden=!0,this.errorEl.textContent="")}scrollToBottom(){requestAnimationFrame(()=>{this.messageList.scrollTop=this.messageList.scrollHeight})}async fetchAssistantReply(){this.isProcessing=!0,this.sendBtn.disabled=!0,this.setError(),this.setStatus(this.options.loadingText,!0);let e=new AbortController;try{let s=await fetch(this.options.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:this.messages}),signal:e.signal});if(!s.ok){let t=await Y(s);throw new Error((t==null?void 0:t.error)||`Request failed with status ${s.status}`)}if(J(s))await this.handleStream(s);else{let t=await s.json(),i=(t==null?void 0:t.message)||"",a=!!(t!=null&&t.done);if(i){let l=L(i)||i;this.appendMessage({role:"assistant",content:l}),this.messages.push({role:"assistant",content:l}),this.onAssistantComplete(l,a),this.setStatus()}}}catch(s){console.error("Bless chat error",s),this.setError((s==null?void 0:s.message)||"Something went wrong. Please try again."),this.pushAssistantMessage("I could not continue the conversation. Let us try once more when you are ready.")}finally{this.setStatus(),this.isProcessing=!1,this.sendBtn.disabled=!1}}async handleStream(e){var h;let s=(h=e.body)==null?void 0:h.getReader();if(!s){let g=await e.text();this.pushAssistantMessage(g);return}let t=!1,i="",a=null;this.appendMessage({role:"assistant",content:""},!0);let r=new TextDecoder,l="";for(;;){let{value:g,done:y}=await s.read();if(y)break;l+=r.decode(g,{stream:!0});let A=l.split(`

`);l=A.pop()||"";for(let N of A){let H=N.split(`
`),b="";for(let w of H)w.startsWith("data:")&&(b+=w.slice(5).trim());if(!b||b==="[DONE]")continue;let u;try{u=JSON.parse(b)}catch{console.warn("Unable to parse stream chunk",b);continue}if(u.type==="delta"&&typeof u.textDelta=="string")i+=u.textDelta,this.updateStreamingBubble(u.textDelta);else if(u.type==="done")a=u.meta||null,t=(a==null?void 0:a.state)==="compose_blessing";else if(u.type==="meta"&&typeof u.done=="boolean")t=u.done;else if(u.type==="error")throw new Error(u.message||"Unexpected error")}}let o=i.trim(),c=L(o)||o;this.finalizeStreamingBubble(c),this.messages.push({role:"assistant",content:c}),this.onAssistantComplete(c,t,a||void 0)}onAssistantComplete(e,s,t){if(e){if(s){let i=this.prepareBlessing(e),a=i.blessing||i.raw||e.trim();this.blessingDelivered=!0,T(E,"true");let r=this.messageList.lastElementChild;r&&r.classList.contains("bless-chat-bubble")&&this.messageList.removeChild(r),this.displayBlessing(a,t);let l=this.activeSidthie,d=(this.lastExplanation||"").replace(/\s+$/,"").split(/[.!?]/).map(h=>h.trim()).filter(Boolean)[0]||"",c=[];if(l?c.push(`The blessing of ${l.label} is woven around you now.`):c.push("Your blessing is woven around you now."),d){let h=d.charAt(0).toLowerCase()+d.slice(1);c.push(`Hold close this sense of ${h} as you receive it below.`)}else c.push("Follow the glow below to receive it.");this.pushAssistantMessage(c.join(" "));return}/image|upload|photo|picture/i.test(e)&&this.pushAssistantMessage("No image is needed. Let us continue in words.")}}prepareBlessing(e){let s=L(e),t=s.split(/\r?\n/).map(r=>r.trim()).filter(Boolean),i=[],a=[];for(let r of t)i.length<5&&!/^is the blessing/i.test(r)?i.push(r):/^is the blessing/i.test(r)||a.push(r);return{blessing:i.join(`
`),extra:a,raw:s}}displayBlessing(e,s){var r;let t=this.activeSidthie;!t&&(s!=null&&s.sidthieKey)&&(t=C(s.sidthieKey),t&&(this.activeSidthie=t));let i=this.lastExplanation||(t==null?void 0:t.description)||(t==null?void 0:t.short)||"";try{P(e)}catch{}let a={text:e,blessing:e,sidthie:(t==null?void 0:t.key)||null,sidthieLabel:(t==null?void 0:t.label)||null,explanation:i};if(this.renderBlessingPanel({blessing:e,explanation:i,sidthieLabel:(r=a.sidthieLabel)!=null?r:void 0}),t)try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:t.key,sidthieLabel:t.label}}))}catch{}window.dispatchEvent(new CustomEvent("blessing:ready",{detail:a})),window.dispatchEvent(new CustomEvent("blessing:update",{detail:a}))}renderBlessingPanel(e){let s=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(s).forEach(t=>{t.style.fontFamily="'Cormorant Upright', serif",t.style.whiteSpace="pre-line",t.style.textAlign="center",t.style.color="#fff",t.style.fontSize="clamp(18px, 2.4vw, 30px)",t.style.lineHeight="1.35",t.style.textShadow="0 2px 8px rgba(0,0,0,.55)";let i=t.querySelector("[data-blessing-output]")||t;i.textContent=e.blessing,i.removeAttribute("hidden");let a=t.querySelector("[data-blessing-meta]"),r=t.querySelector("[data-sidthie-title]"),l=t.querySelector("[data-sidthie-excerpt]");if(a){let g=!!e.sidthieLabel,y=!!e.explanation;r&&(g?(r.textContent=e.sidthieLabel,r.removeAttribute("hidden")):r.setAttribute("hidden","hidden")),l&&(y?(l.textContent=e.explanation,l.removeAttribute("hidden")):l.setAttribute("hidden","hidden")),g||y?a.removeAttribute("hidden"):a.setAttribute("hidden","hidden")}let o=t.querySelector("[data-blessing-signup]"),d=t.querySelector("[data-signup-prompt]"),c=t.querySelector("[data-signup-sidthie]"),h=(d==null?void 0:d.getAttribute("data-default-prompt"))||(d==null?void 0:d.textContent)||"";o&&(d&&(h.includes("{sidthie}")?d.textContent=h.replace("{sidthie}",e.sidthieLabel||"your Sidthie"):e.sidthieLabel&&(d.textContent=`${h} (${e.sidthieLabel})`)),c&&(c.value=e.sidthieLabel||""),o.removeAttribute("hidden"))})}};function Y(n){return n.clone().json().catch(()=>({}))}function J(n){let e=n.headers.get("Content-Type")||n.headers.get("content-type");return e?/ndjson|stream/.test(e):!1}function Q(n){let e={},s=p(n.dataset.apiUrl);s&&(e.apiUrl=s);let t=p(n.dataset.placeholder);t&&(e.placeholder=t);let i=p(n.dataset.loadingText);i&&(e.loadingText=i);let a=W(n.dataset.requireBlessing);return typeof a=="boolean"&&(e.requireBlessing=a),e}function v(n,e){let s=n?document.querySelector(n):document.querySelector("[data-chat-container]");if(!s){console.warn("BlessChat: target container not found.");return}console.info("BlessChat: mounting widget",{selector:n,target:s});let t={...Q(s),...e||{}};new S(s,t).mount()}typeof window!="undefined"&&(window.BlessChat={mount:v},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>v()):setTimeout(()=>v(),0));return I(V);})();
//# sourceMappingURL=bless-chat-widget.js.map
