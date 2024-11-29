import.meta.env = {"VITE_API_URL":"/api","BASE_URL":"/","MODE":"development","DEV":true,"PROD":false,"SSR":false};globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
  cache: /* @__PURE__ */ new Map(),
  get(name, inst) {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }
    this.cache.set(name, inst);
    return inst;
  }
};
import { clsx } from "/vendor/.vite-deps-clsx.js__v--95fb556c.js";
import { twMerge } from "/vendor/.vite-deps-tailwind-merge.js__v--287ffa09.js";
import { v4 } from "/vendor/.vite-deps-uuid.js__v--9f1ef65a.js";
import __vite__cjsImport3_webextensionPolyfill from "/vendor/.vite-deps-webextension-polyfill.js__v--713a74f2.js"; const Browser = __vite__cjsImport3_webextensionPolyfill.__esModule ? __vite__cjsImport3_webextensionPolyfill.default : __vite__cjsImport3_webextensionPolyfill;
export function uuid() {
  return v4();
}
export function getVersion() {
  return Browser.runtime.getManifest().version;
}
export function isProduction() {
  return !import.meta.env.DEV;
}
export function cx(...inputs) {
  return twMerge(clsx(inputs));
}
