import{B as o}from"./browser-polyfill-5e752e65.js";import{s as i}from"./proxy-fetch-96b4aec9.js";globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(e,t){return this.cache.has(e)?this.cache.get(e):(this.cache.set(e,t),t)}};function s(){const e=document.createElement("div");e.innerText="Please keep this tab open, now you can go back to ChatHub",e.style.position="fixed",e.style.top="0",e.style.right="0",e.style.zIndex="50",e.style.padding="10px",e.style.margin="10px",e.style.border="1px solid",e.style.color="red",document.body.appendChild(e)}async function n(){o.runtime.onMessage.addListener(async e=>{if(e==="url")return location.href}),window.__NEXT_DATA__&&await o.runtime.sendMessage({event:"PROXY_TAB_READY"})&&s()}i();n().catch(console.error);
