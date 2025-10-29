"use strict";var BlessChat=(()=>{var m=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var M=Object.getOwnPropertyNames;var A=Object.prototype.hasOwnProperty;var N=(n,e)=>{for(var t in e)m(n,t,{get:e[t],enumerable:!0})},H=(n,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of M(e))!A.call(n,r)&&r!==t&&m(n,r,{get:()=>e[r],enumerable:!(s=k(e,r))||s.enumerable});return n};var O=n=>H(m({},"__esModule",{value:!0}),n);var P={};N(P,{mount:()=>h});var p={apiUrl:"https://bless-test-brown.vercel.app/api/chat",placeholder:"Talk to Sidthah",sendAriaLabel:"Send message",loadingText:"Listening...",requireBlessing:!0};function d(n){if(n==null)return;let e=n.toString().trim();if(!e)return;let t=e.toLowerCase();if(!(t==="undefined"||t==="null"))return e}var R=`
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
}

/* Additional styles for Sidthie option buttons */
.bless-chat-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bless-chat-option {
  display: block;
  padding: 1.3rem clamp(1.6rem, 3.8vw, 2.6rem);
  border-radius: 42px;
  background: rgba(19, 63, 52, 0.72);
  border: 1px solid rgba(var(--bless-gold-400), 0.4);
  color: rgba(var(--bless-cream-100), 0.96);
  font-size: clamp(1.02rem, 1vw + 0.9rem, 1.2rem);
  line-height: 1.6;
  cursor: pointer;
  text-align: center;
}

.bless-chat-option:hover,
.bless-chat-option:focus {
  background: rgba(19, 63, 52, 0.85);
}
`,L=document.createElement("style");L.textContent=R;document.head.appendChild(L);function D(){return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`}var y="bless-chat-blessing-created",U=[/Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,/How can I assist you with (them|it|the files?)\?.*$/gim,/Would you like me to search for specific information.*$/gim,/or summarize the content\?.*$/gim,/\【\d+:\d+†source\】/g,/To create a personalized blessing.*?providing the files?!?/gim,/and for providing the files?!?/gim];function E(n){let e=n!=null?n:"";return U.forEach(t=>{e=e.replace(t,"")}),e.trim()}function q(n){try{return typeof sessionStorage!="undefined"?sessionStorage.getItem(n):null}catch{return null}}function z(n,e){try{typeof sessionStorage!="undefined"&&sessionStorage.setItem(n,e)}catch{}}function F(n){let e=["[data-bless-panel]",".bless-blessing__panel","#bless-blessing__panel"].join(",");document.querySelectorAll(e).forEach(t=>{t.style.fontFamily="'Cormorant Upright', serif",t.style.whiteSpace="pre-line",t.style.textAlign="center",t.style.color="#fff",t.style.fontSize="clamp(18px, 2.4vw, 30px)",t.style.lineHeight="1.35",t.style.textShadow="0 2px 8px rgba(0,0,0,.55)",t.textContent=n})}function S(n){if(!n)return null;let t=n.replace(/([*\-•]?\s*)([1-7])[\.\)\:]\s*/g,`
$2. `).replace(/\s{2,}/g," ").trim().split(/\r?\n/).map(a=>a.trim()).filter(Boolean),s=t.filter(a=>/^[1-7]\.\s*/.test(a));if(s.length<7)return null;let o=t.filter(a=>!/^[1-7]\.\s*/.test(a)).join(" ").trim(),l=s.map(a=>a.replace(/^[1-7]\.\s*/,"").trim());return l.length<7?null:{intro:o,options:l}}var f=class{constructor(e,t){this.messages=[];this.isProcessing=!1;this.blessingDelivered=!1;this.currentStreamingNode=null;this.currentStreamingText="";var r,o,l,a;this.container=e;let s={...p,...t||{}};this.options={apiUrl:(r=d(s.apiUrl))!=null?r:p.apiUrl,placeholder:(o=d(s.placeholder))!=null?o:p.placeholder,sendAriaLabel:(l=d(s.sendAriaLabel))!=null?l:p.sendAriaLabel,loadingText:(a=d(s.loadingText))!=null?a:p.loadingText,requireBlessing:s.requireBlessing},this.blessingDelivered=q(y)==="true"}mount(){this.container.innerHTML="",this.container.classList.add("bless-chat-shell");let e=document.createElement("div");e.className="bless-chat-window",this.messageList=document.createElement("div"),this.messageList.className="bless-chat-messages",this.statusEl=document.createElement("div"),this.statusEl.className="bless-chat-bubble bless-chat-bubble--status",this.statusEl.hidden=!0,this.errorEl=document.createElement("div"),this.errorEl.className="bless-chat-error",this.errorEl.hidden=!0;let t=document.createElement("form");t.className="bless-chat-input-row";let s=document.createElement("div");s.className="bless-chat-input-wrapper",this.inputEl=document.createElement("input"),this.inputEl.type="text",this.inputEl.className="bless-chat-input",this.inputEl.placeholder=this.options.placeholder,this.inputEl.autocomplete="off",this.inputEl.spellcheck=!1,this.inputEl.setAttribute("aria-label",this.options.placeholder),s.appendChild(this.inputEl),this.sendBtn=document.createElement("button"),this.sendBtn.type="submit",this.sendBtn.className="bless-chat-send",this.sendBtn.setAttribute("aria-label",this.options.sendAriaLabel),this.sendBtn.innerHTML=D(),t.append(s,this.sendBtn),t.addEventListener("submit",r=>{r.preventDefault(),this.handleSubmit()}),this.messageList.addEventListener("scroll",()=>{this.messageList.scrollTop===0?this.messageList.classList.add("scrolled-top"):this.messageList.classList.remove("scrolled-top")}),e.append(this.messageList,this.statusEl,t,this.errorEl),this.container.appendChild(e),this.inputEl.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),this.handleSubmit())}),this.blessingDelivered?this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below."):this.startConversation()}async startConversation(){await this.fetchAssistantReply()}async handleSubmit(){if(this.isProcessing)return;let e=this.inputEl.value.trim();if(!e){this.inputEl.reportValidity();return}if(this.blessingDelivered&&this.options.requireBlessing){this.pushAssistantMessage("Your blessing has been created. Scroll down to read it."),this.inputEl.value="";return}this.appendMessage({role:"user",content:e}),this.inputEl.value="",this.messages.push({role:"user",content:e}),await this.fetchAssistantReply()}appendMessage(e,t=!1){if(e.role==="assistant"&&!t){let r=S(e.content);if(r){this.messages.push({role:"assistant",content:e.content}),this.createOptionsBubble(r.options,r.intro);return}}let s=document.createElement("div");s.className="bless-chat-bubble",e.role==="user"&&s.classList.add("bless-chat-bubble--user"),s.textContent=e.content,this.messageList.appendChild(s),this.scrollToBottom(),e.role==="assistant"&&t&&(this.currentStreamingNode=s,this.currentStreamingText=e.content)}createOptionsBubble(e,t){if(t){let o=document.createElement("div");o.className="bless-chat-bubble",o.textContent=t,this.messageList.appendChild(o),this.scrollToBottom()}let s=document.createElement("div");s.className="bless-chat-bubble";let r=document.createElement("div");r.className="bless-chat-options",e.forEach(o=>{let l=document.createElement("button");l.type="button",l.className="bless-chat-option",l.textContent=o,l.addEventListener("click",()=>{this.appendMessage({role:"user",content:o}),this.messages.push({role:"user",content:o}),r.querySelectorAll("button").forEach(a=>{a.disabled=!0}),this.fetchAssistantReply()}),r.appendChild(l)}),s.appendChild(r),this.messageList.appendChild(s),this.scrollToBottom()}updateStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingText+=e,this.currentStreamingNode.textContent=this.currentStreamingText,this.scrollToBottom())}finalizeStreamingBubble(e){if(this.currentStreamingNode){let t=S(e);if(t){this.messageList.removeChild(this.currentStreamingNode),this.currentStreamingNode=null,this.currentStreamingText="",this.createOptionsBubble(t.options,t.intro);return}this.currentStreamingNode.textContent=e.trim()}this.currentStreamingNode=null,this.currentStreamingText="",this.scrollToBottom()}pushAssistantMessage(e){let t={role:"assistant",content:e};this.appendMessage(t),this.messages.push(t)}setStatus(e){e?(this.statusEl.textContent=e,this.statusEl.hidden=!1):this.statusEl.hidden=!0}setError(e){e?(this.errorEl.textContent=e,this.errorEl.hidden=!1):(this.errorEl.hidden=!0,this.errorEl.textContent="")}scrollToBottom(){requestAnimationFrame(()=>{this.messageList.scrollTop=this.messageList.scrollHeight})}async fetchAssistantReply(){this.isProcessing=!0,this.sendBtn.disabled=!0,this.setError(),this.setStatus(this.options.loadingText);let e=new AbortController;try{let t=await fetch(this.options.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:this.messages}),signal:e.signal});if(this.setStatus(),!t.ok){let s=await j(t);throw new Error((s==null?void 0:s.error)||`Request failed with status ${t.status}`)}if(I(t))await this.handleStream(t);else{let s=await t.json(),r=(s==null?void 0:s.message)||"",o=!!(s!=null&&s.done);if(r){let a=E(r)||r;this.appendMessage({role:"assistant",content:a}),this.messages.push({role:"assistant",content:a}),this.onAssistantComplete(a,o)}}}catch(t){console.error("Bless chat error",t),this.setError((t==null?void 0:t.message)||"Something went wrong. Please try again."),this.pushAssistantMessage("I could not continue the conversation. Let us try once more when you are ready.")}finally{this.isProcessing=!1,this.sendBtn.disabled=!1}}async handleStream(e){var v;let t=(v=e.body)==null?void 0:v.getReader();if(!t){let g=await e.text();this.pushAssistantMessage(g);return}let s=!1,r="",o="";this.appendMessage({role:"assistant",content:""},!0);let l=new TextDecoder,a="";for(;;){let{value:g,done:T}=await t.read();if(T)break;a+=l.decode(g,{stream:!0});let w=a.split(`

`);a=w.pop()||"";for(let B of w){let C=B.split(`
`),c="";for(let b of C)b.startsWith("data:")&&(c+=b.slice(5).trim());if(!c||c==="[DONE]")continue;let i;try{i=JSON.parse(c)}catch{console.warn("Unable to parse stream chunk",c);continue}if(i.type==="response.delta"&&typeof i.delta=="string")o+=i.delta,this.updateStreamingBubble(i.delta);else if(i.type==="response.output_text.delta"&&typeof i.textDelta=="string")o+=i.textDelta,this.updateStreamingBubble(i.textDelta);else if(i.type==="response.message.delta"&&typeof i.delta=="string")o+=i.delta,this.updateStreamingBubble(i.delta);else if(!(i.type==="response.completed"||i.type==="response.stop")){if(i.type==="meta"&&typeof i.done=="boolean")s=i.done;else if(i.type==="final"&&typeof i.text=="string")r=i.text,typeof i.done=="boolean"&&(s=i.done);else if(i.type==="error")throw new Error(i.message||"Unexpected error")}}}let x=(r||o).trim(),u=E(x)||x;this.finalizeStreamingBubble(u),this.messages.push({role:"assistant",content:u}),this.onAssistantComplete(u,s)}onAssistantComplete(e,t){if(e&&t){this.blessingDelivered=!0,z(y,"true");let s=this.messageList.lastElementChild;s&&s.classList.contains("bless-chat-bubble")&&this.messageList.removeChild(s),F(e),window.dispatchEvent(new CustomEvent("blessing:update",{detail:{text:e,done:!0}})),this.pushAssistantMessage("Your blessing has been created! Scroll down to read it.");return}}};function j(n){return n.clone().json().catch(()=>({}))}function I(n){let e=n.headers.get("Content-Type")||n.headers.get("content-type");return e?/ndjson|stream/.test(e):!1}function _(n){let e=d(n.dataset.apiUrl),t=d(n.dataset.placeholder),s=d(n.dataset.loadingText);return{apiUrl:e,placeholder:t,loadingText:s}}function h(n,e){let t=n?document.querySelector(n):document.querySelector("[data-chat-container]");if(!t){console.warn("BlessChat: target container not found.");return}console.info("BlessChat: mounting widget",{selector:n,target:t});let s={..._(t),...e||{}};new f(t,s).mount()}typeof window!="undefined"&&(window.BlessChat={mount:h},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>h()):setTimeout(()=>h(),0));return O(P);})();
//# sourceMappingURL=bless-chat-widget.js.map
