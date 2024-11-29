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
import { uuid } from "/src/utils/index.ts.js";
import { string2Uint8Array, uint8Array2String } from "/src/utils/encoding.ts.js";
import { streamAsyncIterable } from "/src/utils/stream-async-iterable.ts.js";
export function setupProxyExecutor() {
  Browser.runtime.onConnect.addListener((port) => {
    const abortController = new AbortController();
    port.onDisconnect.addListener(() => {
      abortController.abort();
    });
    port.onMessage.addListener(async (message) => {
      console.debug("proxy fetch", message.url, message.options);
      const resp = await fetch(message.url, {
        ...message.options,
        signal: abortController.signal
      });
      port.postMessage({
        type: "PROXY_RESPONSE_METADATA",
        metadata: {
          status: resp.status,
          statusText: resp.statusText,
          headers: Object.fromEntries(resp.headers.entries())
        }
      });
      for await (const chunk of streamAsyncIterable(resp.body)) {
        port.postMessage({
          type: "PROXY_RESPONSE_BODY_CHUNK",
          value: uint8Array2String(chunk),
          done: false
        });
      }
      port.postMessage({
        type: "PROXY_RESPONSE_BODY_CHUNK",
        done: true
      });
    });
  });
}
export async function proxyFetch(tabId, url, options) {
  console.debug("proxyFetch", tabId, url, options);
  return new Promise((resolve) => {
    const port = Browser.tabs.connect(tabId, {
      name: uuid()
    });
    port.onDisconnect.addListener(() => {
      throw new DOMException("proxy fetch aborted", "AbortError");
    });
    options?.signal?.addEventListener("abort", () => port.disconnect());
    const body = new ReadableStream({
      start(controller) {
        port.onMessage.addListener(function onMessage(message) {
          if (message.type === "PROXY_RESPONSE_METADATA") {
            const response = new Response(body, message.metadata);
            resolve(response);
          } else if (message.type === "PROXY_RESPONSE_BODY_CHUNK") {
            if (message.done) {
              controller.close();
              port.onMessage.removeListener(onMessage);
              port.disconnect();
            } else {
              const chunk = string2Uint8Array(message.value);
              controller.enqueue(chunk);
            }
          }
        });
        port.postMessage({
          url,
          options
        });
      },
      cancel(_reason) {
        port.disconnect();
      }
    });
  });
}
