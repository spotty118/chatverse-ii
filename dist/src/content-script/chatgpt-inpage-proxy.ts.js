globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
  cache: /* @__PURE__ */ new Map(),
  get(name, inst) {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }
    this.cache.set(name, inst);
    return inst;
  }
};
import __vite__cjsImport0_webextensionPolyfill from "/vendor/.vite-deps-webextension-polyfill.js__v--713a74f2.js"; const Browser = __vite__cjsImport0_webextensionPolyfill.__esModule ? __vite__cjsImport0_webextensionPolyfill.default : __vite__cjsImport0_webextensionPolyfill;
import { setupProxyExecutor } from "/src/services/proxy-fetch.ts.js";
function injectTip() {
  const div = document.createElement("div");
  div.innerText = "Please keep this tab open, now you can go back to ChatHub";
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.right = "0";
  div.style.zIndex = "50";
  div.style.padding = "10px";
  div.style.margin = "10px";
  div.style.border = "1px solid";
  div.style.color = "red";
  document.body.appendChild(div);
}
async function main() {
  Browser.runtime.onMessage.addListener(async (message) => {
    if (message === "url") {
      return location.href;
    }
  });
  if (window.__NEXT_DATA__) {
    if (await Browser.runtime.sendMessage({
      event: "PROXY_TAB_READY"
    })) {
      injectTip();
    }
  }
}
setupProxyExecutor();
main().catch(console.error);
