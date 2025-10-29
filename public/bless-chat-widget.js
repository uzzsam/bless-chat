"use strict";var BlessChat=(()=>{var x=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var R=Object.getOwnPropertyNames;var H=Object.prototype.hasOwnProperty;var O=(n,e)=>{for(var t in e)x(n,t,{get:e[t],enumerable:!0})},U=(n,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of R(e))!H.call(n,i)&&i!==t&&x(n,i,{get:()=>e[i],enumerable:!(s=N(e,i))||s.enumerable});return n};var D=n=>U(x({},"__esModule",{value:!0}),n);var J={};O(J,{mount:()=>f});var g={apiUrl:"https://bless-test-brown.vercel.app/api/chat",placeholder:"Talk to Sidthah",sendAriaLabel:"Send message",loadingText:"Listening...",requireBlessing:!0};function c(n){if(n==null)return;let e=n.toString().trim();if(!e)return;let t=e.toLowerCase();if(!(t==="undefined"||t==="null"))return e}var q=`
:root {
  --bless-green-900: 23, 95, 75;
  --bless-green-500: 70, 136, 111;
  --bless-gold-400: 227, 216, 154;
  --bless-cream-100: 236, 227, 214;
}

.bless-chat-shell {
  width: min(820px, 92vw);
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
  border-radius: 48px;
  background: linear-gradient(135deg, rgba(20,62,48,0.78), rgba(27,73,58,0.6));
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(var(--bless-gold-400), 0.38);
  overflow: hidden;
}

.bless-chat-window::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 36px;
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
  background: rgba(19, 63, 52, 0.72);
  border: 1px solid rgba(var(--bless-gold-400), 0.4);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
  color: rgba(var(--bless-cream-100), 0.96);
  font-size: clamp(1.02rem, 1vw + 0.9rem, 1.2rem);
  line-height: 1.6;
  /* Align all message text to the left for improved readability */
  text-align: left;
}

.bless-chat-bubble--user {
  align-self: flex-end;
  background: linear-gradient(120deg, rgba(28,88,70,0.6), rgba(22,65,52,0.7));
  border: 1px solid rgba(var(--bless-green-500), 0.6);
  color: rgba(var(--bless-cream-100), 0.9);
}

.bless-chat-bubble--status {
  text-align: center;
  font-size: 0.95rem;
  color: rgba(var(--bless-cream-100), 0.65);
  background: rgba(15, 48, 39, 0.4);
  border: 1px solid rgba(var(--bless-green-500), 0.35);
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
  border: 1px solid rgba(var(--bless-green-500), 0.55);
  background: linear-gradient(120deg, rgba(21,65,53,0.78), rgba(15,52,41,0.74));
  padding: 0.4rem 0.4rem 0.4rem 1.4rem;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
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
  gap: 0.75rem 0.9rem;
}

.bless-chat-option {
  display: block;
  padding: 1.1rem clamp(1.4rem, 3.2vw, 2.3rem);
  border-radius: 42px;
  background: rgba(19, 63, 52, 0.72);
  border: 1px solid rgba(var(--bless-gold-400), 0.4);
  color: rgba(var(--bless-cream-100), 0.96);
  font-size: clamp(0.98rem, 0.8vw + 0.9rem, 1.15rem);
  line-height: 1.55;
  cursor: pointer;
  text-align: center;
}

.bless-chat-option:hover,
.bless-chat-option:focus {
  background: rgba(19, 63, 52, 0.85);
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
  width: 6px;
  height: 6px;
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
`,T=document.createElement("style");T.textContent=q;document.head.appendChild(T);var M={NALAMERA:{key:"NALAMERA",label:"Inner Strength",short:"A steady courage that rises quietly from within."},LUMASARA:{key:"LUMASARA",label:"Happiness",short:"A soft, luminous joy that brightens the ordinary."},WELAMORA:{key:"WELAMORA",label:"Love",short:"A tender presence that listens and embraces."},NIRALUMA:{key:"NIRALUMA",label:"Wisdom",short:"A calm clarity that sees the path with kindness."},RAKAWELA:{key:"RAKAWELA",label:"Protection",short:"A gentle guard that shelters what is precious."},OLANWELA:{key:"OLANWELA",label:"Healing",short:"A quiet mending that restores balance and breath."},MORASARA:{key:"MORASARA",label:"Peace",short:"A stillness that settles and softens the heart."}},b=Object.values(M);function I(n){var t;if(!n)return null;let e=n.toUpperCase();return(t=M[e])!=null?t:null}function j(n){var t,s;if(!n)return null;let e=n.trim().toLowerCase();return(s=(t=b.find(i=>i.label.toLowerCase()===e))!=null?t:b.find(i=>e.includes(i.label.toLowerCase())))!=null?s:null}function W(){return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`}var S="bless-chat-blessing-created",_=[/Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,/How can I assist you with (them|it|the files?)\?.*$/gim,/Would you like me to search for specific information.*$/gim,/or summarize the content\?.*$/gim,/\【\d+:\d+†source\】/g,/To create a personalized blessing.*?providing the files?!?/gim,/and for providing the files?!?/gim];function w(n){let e=n!=null?n:"";return _.forEach(t=>{e=e.replace(t,"")}),e.trim()}function z(n){try{return typeof sessionStorage!="undefined"?sessionStorage.getItem(n):null}catch{return null}}function F(n,e){try{typeof sessionStorage!="undefined"&&sessionStorage.setItem(n,e)}catch{}}function A(n){if(!n)return null;let e=n.replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g,`
$2. `).replace(/\s{2,}/g," ").trim(),t=e.split(/\r?\n/).map(o=>o.trim()).filter(Boolean);if(t.filter(o=>/^[1-7]\.\s*/.test(o)).length<7)return null;let r=t.filter(o=>!/^[1-7]\.\s*/.test(o)).join(" ").trim();if(!b.every(o=>e.toLowerCase().includes(o.label.toLowerCase())||e.includes(`(${o.key})`)))return null;let d=b.map(o=>`${o.label} (${o.key})`);return{intro:r,options:d,metas:b}}function P(n){if(!n)return null;let e=n.match(/\(([A-Za-z]+)\)\s*$/);if(e){let s=I(e[1]);if(s)return s}let t=n.replace(/\([^)]*\)/g,"").trim();return j(t)}var E=class{constructor(e,t){this.messages=[];this.isProcessing=!1;this.blessingDelivered=!1;this.currentStreamingNode=null;this.currentStreamingText="";this.activeSidthie=null;var i,r,l,d;this.container=e;let s={...g,...t||{}};this.options={apiUrl:(i=c(s.apiUrl))!=null?i:g.apiUrl,placeholder:(r=c(s.placeholder))!=null?r:g.placeholder,sendAriaLabel:(l=c(s.sendAriaLabel))!=null?l:g.sendAriaLabel,loadingText:(d=c(s.loadingText))!=null?d:g.loadingText,requireBlessing:s.requireBlessing},this.blessingDelivered=z(S)==="true"}mount(){this.container.innerHTML="",this.container.classList.add("bless-chat-shell");let e=document.createElement("div");e.className="bless-chat-window",this.messageList=document.createElement("div"),this.messageList.className="bless-chat-messages",this.statusEl=document.createElement("div"),this.statusEl.className="bless-chat-bubble bless-chat-bubble--status",this.statusEl.hidden=!0,this.errorEl=document.createElement("div"),this.errorEl.className="bless-chat-error",this.errorEl.hidden=!0;let t=document.createElement("form");t.className="bless-chat-input-row";let s=document.createElement("div");s.className="bless-chat-input-wrapper",this.inputEl=document.createElement("input"),this.inputEl.type="text",this.inputEl.className="bless-chat-input",this.inputEl.placeholder=this.options.placeholder,this.inputEl.autocomplete="off",this.inputEl.spellcheck=!1,this.inputEl.setAttribute("aria-label",this.options.placeholder),s.appendChild(this.inputEl),this.sendBtn=document.createElement("button"),this.sendBtn.type="submit",this.sendBtn.className="bless-chat-send",this.sendBtn.setAttribute("aria-label",this.options.sendAriaLabel),this.sendBtn.innerHTML=W(),t.append(s,this.sendBtn),t.addEventListener("submit",i=>{i.preventDefault(),this.handleSubmit()}),this.messageList.addEventListener("scroll",()=>{this.messageList.scrollTop===0?this.messageList.classList.add("scrolled-top"):this.messageList.classList.remove("scrolled-top")}),e.append(this.messageList,this.statusEl,t,this.errorEl),this.container.appendChild(e),this.inputEl.addEventListener("keydown",i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),this.handleSubmit())}),this.blessingDelivered?this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below."):this.startConversation()}async startConversation(){this.activeSidthie=null,await this.fetchAssistantReply()}async handleSubmit(){if(this.isProcessing)return;let e=this.inputEl.value.trim();if(!e){this.inputEl.reportValidity();return}if(this.blessingDelivered&&this.options.requireBlessing){this.pushAssistantMessage("Your blessing has been created. Scroll down to read it."),this.inputEl.value="";return}this.appendMessage({role:"user",content:e}),this.inputEl.value="",this.messages.push({role:"user",content:e}),await this.fetchAssistantReply()}appendMessage(e,t=!1){if(e.role==="assistant"&&!t){let i=A(e.content);if(i){this.messages.push({role:"assistant",content:e.content}),this.createOptionsBubble(i.options,i.intro,i.metas);return}}let s=document.createElement("div");s.className="bless-chat-bubble",e.role==="user"&&s.classList.add("bless-chat-bubble--user"),s.textContent=e.content,this.messageList.appendChild(s),this.scrollToBottom(),e.role==="assistant"&&t&&(this.currentStreamingNode=s,this.currentStreamingText=e.content)}createOptionsBubble(e,t,s){if(this.activeSidthie=null,t){let l=document.createElement("div");l.className="bless-chat-bubble",l.textContent=t,this.messageList.appendChild(l),this.scrollToBottom()}let i=document.createElement("div");i.className="bless-chat-bubble";let r=document.createElement("div");r.className="bless-chat-options",e.forEach((l,d)=>{let o=document.createElement("button");o.type="button",o.className="bless-chat-option",o.textContent=l,o.addEventListener("click",()=>{var h;let p=(h=s==null?void 0:s[d])!=null?h:P(l);if(p){this.activeSidthie=p;try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:p.key,sidthieLabel:p.label}}))}catch{}}this.appendMessage({role:"user",content:l}),this.messages.push({role:"user",content:l}),r.querySelectorAll("button").forEach(m=>{m.disabled=!0}),this.fetchAssistantReply()}),r.appendChild(o)}),i.appendChild(r),this.messageList.appendChild(i),this.scrollToBottom()}updateStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingText+=e,this.currentStreamingNode.textContent=this.currentStreamingText,this.scrollToBottom())}finalizeStreamingBubble(e){if(this.currentStreamingNode){let t=A(e);if(t){this.messageList.removeChild(this.currentStreamingNode),this.currentStreamingNode=null,this.currentStreamingText="",this.createOptionsBubble(t.options,t.intro);return}this.currentStreamingNode.textContent=e.trim()}this.currentStreamingNode=null,this.currentStreamingText="",this.scrollToBottom()}pushAssistantMessage(e){let t={role:"assistant",content:e};this.appendMessage(t),this.messages.push(t)}setStatus(e,t=!1){e?(t?(this.statusEl.innerHTML='<span class="bless-typing" aria-hidden="true"><span></span><span></span><span></span></span>',this.statusEl.classList.add("is-typing"),this.statusEl.setAttribute("aria-label",e)):(this.statusEl.textContent=e,this.statusEl.classList.remove("is-typing"),this.statusEl.removeAttribute("aria-label")),this.statusEl.hidden=!1):(this.statusEl.hidden=!0,this.statusEl.classList.remove("is-typing"),this.statusEl.innerHTML="",this.statusEl.removeAttribute("aria-label"))}setError(e){e?(this.errorEl.textContent=e,this.errorEl.hidden=!1):(this.errorEl.hidden=!0,this.errorEl.textContent="")}scrollToBottom(){requestAnimationFrame(()=>{this.messageList.scrollTop=this.messageList.scrollHeight})}async fetchAssistantReply(){this.isProcessing=!0,this.sendBtn.disabled=!0,this.setError(),this.setStatus(this.options.loadingText,!0);let e=new AbortController;try{let t=await fetch(this.options.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:this.messages}),signal:e.signal});if(this.setStatus(),!t.ok){let s=await $(t);throw new Error((s==null?void 0:s.error)||`Request failed with status ${t.status}`)}if(Y(t))await this.handleStream(t);else{let s=await t.json(),i=(s==null?void 0:s.message)||"",r=!!(s!=null&&s.done);if(i){let d=w(i)||i;this.appendMessage({role:"assistant",content:d}),this.messages.push({role:"assistant",content:d}),this.onAssistantComplete(d,r)}}}catch(t){console.error("Bless chat error",t),this.setError((t==null?void 0:t.message)||"Something went wrong. Please try again."),this.pushAssistantMessage("I could not continue the conversation. Let us try once more when you are ready.")}finally{this.setStatus(),this.isProcessing=!1,this.sendBtn.disabled=!1}}async handleStream(e){var m;let t=(m=e.body)==null?void 0:m.getReader();if(!t){let y=await e.text();this.pushAssistantMessage(y);return}let s=!1,i="",r="";this.appendMessage({role:"assistant",content:""},!0);let l=new TextDecoder,d="";for(;;){let{value:y,done:k}=await t.read();if(k)break;d+=l.decode(y,{stream:!0});let L=d.split(`

`);d=L.pop()||"";for(let B of L){let C=B.split(`
`),u="";for(let v of C)v.startsWith("data:")&&(u+=v.slice(5).trim());if(!u||u==="[DONE]")continue;let a;try{a=JSON.parse(u)}catch{console.warn("Unable to parse stream chunk",u);continue}if(a.type==="response.delta"&&typeof a.delta=="string")r+=a.delta,this.updateStreamingBubble(a.delta);else if(a.type==="response.output_text.delta"&&typeof a.textDelta=="string")r+=a.textDelta,this.updateStreamingBubble(a.textDelta);else if(a.type==="response.message.delta"&&typeof a.delta=="string")r+=a.delta,this.updateStreamingBubble(a.delta);else if(!(a.type==="response.completed"||a.type==="response.stop")){if(a.type==="meta"&&typeof a.done=="boolean")s=a.done;else if(a.type==="final"&&typeof a.text=="string")i=a.text,typeof a.done=="boolean"&&(s=a.done);else if(a.type==="error")throw new Error(a.message||"Unexpected error")}}}let o=(i||r).trim(),h=w(o)||o;this.finalizeStreamingBubble(h),this.messages.push({role:"assistant",content:h}),this.onAssistantComplete(h,s)}onAssistantComplete(e,t){if(e){if(t){let s=this.prepareBlessing(e),i=s.blessing||s.raw||e.trim();this.blessingDelivered=!0,F(S,"true");let r=this.messageList.lastElementChild;r&&r.classList.contains("bless-chat-bubble")&&this.messageList.removeChild(r),this.displayBlessing(i),this.pushAssistantMessage("Your blessing has been created! Scroll down to read it.");return}/image|upload|photo|picture/i.test(e)&&this.pushAssistantMessage("No image is needed. Let us continue in words.")}}prepareBlessing(e){let t=w(e),s=t.split(/\r?\n/).map(l=>l.trim()).filter(Boolean),i=[],r=[];for(let l of s)i.length<5&&!/^is the blessing/i.test(l)?i.push(l):/^is the blessing/i.test(l)||r.push(l);return{blessing:i.join(`
`),extra:r,raw:t}}displayBlessing(e){let t=this.activeSidthie,s={text:e,blessing:e,sidthie:t==null?void 0:t.key,sidthieLabel:t==null?void 0:t.label,explanation:t==null?void 0:t.short};if(this.renderBlessingPanel(s),t)try{window.dispatchEvent(new CustomEvent("sidthie:selected",{detail:{sidthie:t.key,sidthieLabel:t.label}}))}catch{}window.dispatchEvent(new CustomEvent("blessing:update",{detail:s}))}renderBlessingPanel(e){let t=[e.blessing];e.explanation&&t.push(e.explanation);let s=t.join(`

`).trim(),i=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(i).forEach(r=>{r.style.fontFamily="'Cormorant Upright', serif",r.style.whiteSpace="pre-line",r.style.textAlign="center",r.style.color="#fff",r.style.fontSize="clamp(18px, 2.4vw, 30px)",r.style.lineHeight="1.35",r.style.textShadow="0 2px 8px rgba(0,0,0,.55)",r.textContent=s})}};function $(n){return n.clone().json().catch(()=>({}))}function Y(n){let e=n.headers.get("Content-Type")||n.headers.get("content-type");return e?/ndjson|stream/.test(e):!1}function K(n){let e=c(n.dataset.apiUrl),t=c(n.dataset.placeholder),s=c(n.dataset.loadingText);return{apiUrl:e,placeholder:t,loadingText:s}}function f(n,e){let t=n?document.querySelector(n):document.querySelector("[data-chat-container]");if(!t){console.warn("BlessChat: target container not found.");return}console.info("BlessChat: mounting widget",{selector:n,target:t});let s={...K(t),...e||{}};new E(t,s).mount()}typeof window!="undefined"&&(window.BlessChat={mount:f},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>f()):setTimeout(()=>f(),0));return D(J);})();
//# sourceMappingURL=bless-chat-widget.js.map
