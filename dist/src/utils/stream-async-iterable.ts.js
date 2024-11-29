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
export async function* streamAsyncIterable(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const {
        done,
        value
      } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
