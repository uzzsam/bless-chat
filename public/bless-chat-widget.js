"use strict";var BlessChat=(()=>{var h=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var S=Object.getOwnPropertyNames;var T=Object.prototype.hasOwnProperty;var L=(n,e)=>{for(var t in e)h(n,t,{get:e[t],enumerable:!0})},B=(n,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of S(e))!T.call(n,i)&&i!==t&&h(n,i,{get:()=>e[i],enumerable:!(s=E(e,i))||s.enumerable});return n};var M=n=>B(h({},"__esModule",{value:!0}),n);var U={};L(U,{mount:()=>l});var k={apiUrl:"https://bless-test-brown.vercel.app/api/chat",placeholder:"Talk to Sidthah",sendAriaLabel:"Send message",loadingText:"Listening...",requireBlessing:!0},C=`
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
}

.bless-chat-input::placeholder {
  color: rgba(var(--bless-cream-100), 0.45);
  opacity: 1;
}

.bless-chat-input:focus {
  outline: none;
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
`,w=document.createElement("style");w.textContent=C;document.head.appendChild(w);function A(){return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#175F4B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 32H94" />
    <path d="M70 14L94 32L70 50" />
    <circle cx="106" cy="32" r="4.5" fill="#175F4B" stroke="#175F4B" stroke-width="2" />
  </g>
</svg>`}var x="bless-chat-blessing-created",N=[/Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gim,/How can I assist you with (them|it|the files?)\?.*$/gim,/Would you like me to search for specific information.*$/gim,/or summarize the content\?.*$/gim,/\【\d+:\d+†source\】/g,/To create a personalized blessing.*?providing the files?!?/gim,/and for providing the files?!?/gim];function v(n){let e=n!=null?n:"";return N.forEach(t=>{e=e.replace(t,"")}),e.trim()}function H(n){try{return typeof sessionStorage!="undefined"?sessionStorage.getItem(n):null}catch{return null}}function R(n,e){try{typeof sessionStorage!="undefined"&&sessionStorage.setItem(n,e)}catch{}}var g=class{constructor(e,t){this.messages=[];this.isProcessing=!1;this.blessingDelivered=!1;this.currentStreamingNode=null;this.currentStreamingText="";this.container=e,this.options={...k,...t||{}},this.blessingDelivered=H(x)==="true"}mount(){this.container.innerHTML="",this.container.classList.add("bless-chat-shell");let e=document.createElement("div");e.className="bless-chat-window",this.messageList=document.createElement("div"),this.messageList.className="bless-chat-messages",this.statusEl=document.createElement("div"),this.statusEl.className="bless-chat-bubble bless-chat-bubble--status",this.statusEl.hidden=!0,this.errorEl=document.createElement("div"),this.errorEl.className="bless-chat-error",this.errorEl.hidden=!0;let t=document.createElement("form");t.className="bless-chat-input-row";let s=document.createElement("div");s.className="bless-chat-input-wrapper",this.inputEl=document.createElement("input"),this.inputEl.type="text",this.inputEl.className="bless-chat-input",this.inputEl.placeholder=this.options.placeholder,this.inputEl.autocomplete="off",this.inputEl.spellcheck=!1,this.inputEl.setAttribute("aria-label",this.options.placeholder),s.appendChild(this.inputEl),this.sendBtn=document.createElement("button"),this.sendBtn.type="submit",this.sendBtn.className="bless-chat-send",this.sendBtn.setAttribute("aria-label",this.options.sendAriaLabel),this.sendBtn.innerHTML=A(),t.append(s,this.sendBtn),t.addEventListener("submit",i=>{i.preventDefault(),this.handleSubmit()}),this.messageList.addEventListener("scroll",()=>{this.messageList.scrollTop===0?this.messageList.classList.add("scrolled-top"):this.messageList.classList.remove("scrolled-top")}),e.append(this.messageList,this.statusEl,t,this.errorEl),this.container.appendChild(e),this.inputEl.addEventListener("keydown",i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),this.handleSubmit())}),this.blessingDelivered?this.pushAssistantMessage("Your blessing has already been crafted. Scroll to revisit it below."):this.startConversation()}async startConversation(){await this.fetchAssistantReply()}async handleSubmit(){if(this.isProcessing)return;let e=this.inputEl.value.trim();if(!e){this.inputEl.reportValidity();return}if(this.blessingDelivered&&this.options.requireBlessing){this.pushAssistantMessage("Your blessing has been created. Scroll down to read it."),this.inputEl.value="";return}this.appendMessage({role:"user",content:e}),this.inputEl.value="",this.messages.push({role:"user",content:e}),await this.fetchAssistantReply()}appendMessage(e,t=!1){let s=document.createElement("div");s.className="bless-chat-bubble",e.role==="user"&&s.classList.add("bless-chat-bubble--user"),s.textContent=e.content,this.messageList.appendChild(s),this.scrollToBottom(),e.role==="assistant"&&t&&(this.currentStreamingNode=s,this.currentStreamingText=e.content)}updateStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingText+=e,this.currentStreamingNode.textContent=this.currentStreamingText,this.scrollToBottom())}finalizeStreamingBubble(e){this.currentStreamingNode&&(this.currentStreamingNode.textContent=e.trim()),this.currentStreamingNode=null,this.currentStreamingText="",this.scrollToBottom()}pushAssistantMessage(e){let t={role:"assistant",content:e};this.appendMessage(t),this.messages.push(t)}setStatus(e){e?(this.statusEl.textContent=e,this.statusEl.hidden=!1):this.statusEl.hidden=!0}setError(e){e?(this.errorEl.textContent=e,this.errorEl.hidden=!1):(this.errorEl.hidden=!0,this.errorEl.textContent="")}scrollToBottom(){requestAnimationFrame(()=>{this.messageList.scrollTop=this.messageList.scrollHeight})}async fetchAssistantReply(){this.isProcessing=!0,this.sendBtn.disabled=!0,this.setError(),this.setStatus(this.options.loadingText);let e=new AbortController;try{let t=await fetch(this.options.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:this.messages}),signal:e.signal});if(this.setStatus(),!t.ok){let s=await D(t);throw new Error((s==null?void 0:s.error)||`Request failed with status ${t.status}`)}if(O(t))await this.handleStream(t);else{let s=await t.json(),i=(s==null?void 0:s.message)||"",o=!!(s!=null&&s.done);if(i){let a=v(i)||i;this.appendMessage({role:"assistant",content:a}),this.messages.push({role:"assistant",content:a}),this.onAssistantComplete(a,o)}}}catch(t){console.error("Bless chat error",t),this.setError((t==null?void 0:t.message)||"Something went wrong. Please try again."),this.pushAssistantMessage("I could not continue the conversation. Let us try once more when you are ready.")}finally{this.isProcessing=!1,this.sendBtn.disabled=!1}}async handleStream(e){var m;let t=(m=e.body)==null?void 0:m.getReader();if(!t){let c=await e.text();this.pushAssistantMessage(c);return}let s=!1,i="",o="";this.appendMessage({role:"assistant",content:""},!0);let u=new TextDecoder,a="";for(;;){let{value:c,done:y}=await t.read();if(y)break;a+=u.decode(c,{stream:!0});let f=a.split(`
`);a=f.pop()||"";for(let p of f){if(!p.trim())continue;let r;try{r=JSON.parse(p)}catch{console.warn("Unable to parse stream chunk",p);continue}if(r.type==="response.delta"&&typeof r.delta=="string")o+=r.delta,this.updateStreamingBubble(r.delta);else if(r.type==="response.output_text.delta"&&typeof r.textDelta=="string")o+=r.textDelta,this.updateStreamingBubble(r.textDelta);else if(r.type==="response.message.delta"&&typeof r.delta=="string")o+=r.delta,this.updateStreamingBubble(r.delta);else if(!(r.type==="response.completed"||r.type==="response.stop")){if(r.type==="meta"&&typeof r.done=="boolean")s=r.done;else if(r.type==="final"&&typeof r.text=="string")i=r.text,typeof r.done=="boolean"&&(s=r.done);else if(r.type==="error")throw new Error(r.message||"Unexpected error")}}}let b=(i||o).trim(),d=v(b)||b;this.finalizeStreamingBubble(d),this.messages.push({role:"assistant",content:d}),this.onAssistantComplete(d,s)}onAssistantComplete(e,t){e&&t&&(this.blessingDelivered=!0,R(x,"true"),window.dispatchEvent(new CustomEvent("blessing:ready",{detail:{blessing:e,done:!0}})))}};function D(n){return n.clone().json().catch(()=>({}))}function O(n){let e=n.headers.get("Content-Type")||n.headers.get("content-type");return e?/ndjson|stream/.test(e):!1}function F(n){let e=n.dataset.apiUrl,t=n.dataset.placeholder,s=n.dataset.loadingText;return{apiUrl:e,placeholder:t,loadingText:s}}function l(n,e){let t=n?document.querySelector(n):document.querySelector("[data-chat-container]");if(!t){console.warn("BlessChat: target container not found.");return}console.info("BlessChat: mounting widget",{selector:n,target:t});let s={...F(t),...e||{}};new g(t,s).mount()}typeof window!="undefined"&&(window.BlessChat={mount:l},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>l()):setTimeout(()=>l(),0));return M(U);})();
//# sourceMappingURL=bless-chat-widget.js.map
