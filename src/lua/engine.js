export async function createLuaEngine() {
  const wasmoon = await tryImport("wasmoon");
  if (!wasmoon?.LuaFactory) {
    throw new Error("Lua support requires the WASM runtime `wasmoon`. Install it with `bun add wasmoon`.");
  }

  const factory = new wasmoon.LuaFactory();
  const lua = await factory.createEngine();
  return new WasmoonEngine(lua);
}

async function tryImport(name) {
  try {
    return await import(name);
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND" || /Cannot find package/.test(String(error?.message))) return null;
    throw error;
  }
}

class WasmoonEngine {
  constructor(lua) {
    this.kind = "wasmoon";
    this.lua = lua;
  }

  async doString(source, chunkName = "chunk") {
    return this.lua.doString(source, chunkName);
  }

  setGlobal(name, value) {
    this.lua.global.set(name, value);
  }

  getGlobal(name) {
    return this.lua.global.get(name);
  }
}
