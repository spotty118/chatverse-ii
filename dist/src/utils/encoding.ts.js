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
export function string2Uint8Array(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}
export function uint8Array2String(uint8Array) {
  const decoder = new TextDecoder();
  return decoder.decode(uint8Array);
}
