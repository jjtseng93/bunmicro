import { firstCommand, isLinuxLike, platformId, runSync } from "./commands.js";

const CLIPBOARD_TIMEOUT_MS = 2000;
const internalRegisters = new Map();

export class ClipboardManager {
  constructor() {
    this.backend = detectClipboardBackend();
  }

  methodName() {
    return this.backend.name;
  }

  fallbackToInternal() {
    this.backend = internalClipboard();
    return this.backend;
  }

  read(register = "clipboard") {
    if (register !== "clipboard" && register !== "primary") {
      return internalRegisters.get(register) ?? "";
    }
    try {
      const text = this.backend.read?.(register);
      if (text == null) return internalRegisters.get(register) ?? "";
      return text;
    } catch {
      return this.fallbackToInternal().read(register);
    }
  }

  write(text, register = "clipboard") {
    internalRegisters.set(register, text);
    if (register !== "clipboard" && register !== "primary") return true;
    try {
      const ok = this.backend.write?.(text, register) ?? true;
      if (!ok) this.fallbackToInternal();
      return true;
    } catch {
      this.fallbackToInternal();
      return true;
    }
  }
}

function detectClipboardBackend() {
  const platform = platformId();

  if (platform === "android") {
    const termuxSet = firstCommand(["termux-clipboard-set"]);
    const termuxGet = firstCommand(["termux-clipboard-get"]);
    if (termuxSet && termuxGet) return termuxClipboard(termuxSet, termuxGet);
  }

  if (isLinuxLike()) {
    const wlCopy = firstCommand(["wl-copy"]);
    const wlPaste = firstCommand(["wl-paste"]);
    if (wlCopy && wlPaste) return wlClipboard(wlCopy, wlPaste);

    const xclip = firstCommand(["xclip"]);
    if (xclip) return xclipClipboard(xclip);

    const xsel = firstCommand(["xsel"]);
    if (xsel) return xselClipboard(xsel);

    return internalClipboard();
  }

  if (platform === "darwin") {
    const pbcopy = firstCommand(["pbcopy"]);
    const pbpaste = firstCommand(["pbpaste"]);
    if (pbcopy && pbpaste) return commandClipboard("pbcopy/pbpaste", [pbcopy], [pbpaste]);
    return internalClipboard();
  }

  if (platform === "win32") {
    const shell = firstCommand(["pwsh.exe", "powershell.exe", "pwsh", "powershell"]);
    if (shell) return powershellClipboard(shell);
    return internalClipboard();
  }

  return internalClipboard();
}

function internalClipboard() {
  return {
    name: "internal",
    read: (register) => internalRegisters.get(register) ?? "",
    write: (text, register) => {
      internalRegisters.set(register, text);
      return true;
    },
  };
}

function commandClipboard(name, writeCommand, readCommand) {
  return {
    name,
    read: () => outputOrThrow(runSync(readCommand, { timeout: CLIPBOARD_TIMEOUT_MS })),
    write: (text) => runSync(writeCommand, { stdin: text, stdout: "ignore", timeout: CLIPBOARD_TIMEOUT_MS }).ok,
  };
}

function termuxClipboard(set, get) {
  return commandClipboard("termux", [set], [get]);
}

function wlClipboard(wlCopy, wlPaste) {
  return {
    name: "wl-clipboard",
    read: () => outputOrThrow(runSync([wlPaste, "--no-newline"], { timeout: CLIPBOARD_TIMEOUT_MS })),
    write: (text) => runSync([wlCopy], { stdin: text, stdout: "ignore", timeout: CLIPBOARD_TIMEOUT_MS }).ok,
  };
}

function xclipClipboard(xclip) {
  return {
    name: "xclip",
    read: (register) => {
      const selection = register === "primary" ? "primary" : "clipboard";
      return outputOrThrow(runSync([xclip, "-selection", selection, "-o"], { timeout: CLIPBOARD_TIMEOUT_MS }));
    },
    write: (text, register) => {
      const selection = register === "primary" ? "primary" : "clipboard";
      return runSync([xclip, "-selection", selection], { stdin: text, stdout: "ignore", timeout: CLIPBOARD_TIMEOUT_MS }).ok;
    },
  };
}

function xselClipboard(xsel) {
  return {
    name: "xsel",
    read: (register) => {
      const selection = register === "primary" ? "--primary" : "--clipboard";
      return outputOrThrow(runSync([xsel, selection, "--output"], { timeout: CLIPBOARD_TIMEOUT_MS }));
    },
    write: (text, register) => {
      const selection = register === "primary" ? "--primary" : "--clipboard";
      return runSync([xsel, selection, "--input"], { stdin: text, stdout: "ignore", timeout: CLIPBOARD_TIMEOUT_MS }).ok;
    },
  };
}

function powershellClipboard(shell) {
  return {
    name: "powershell",
    // Get-Clipboard -Raw appends \r\n to stdout; strip exactly one trailing line ending.
    read: () => outputOrThrow(runSync([shell, "-NoProfile", "-Command", "Get-Clipboard -Raw"], { timeout: CLIPBOARD_TIMEOUT_MS })).replace(/\r?\n$/, ""),
    write: (text) => runSync([shell, "-NoProfile", "-Command", "Set-Clipboard"], { stdin: text, stdout: "ignore", timeout: CLIPBOARD_TIMEOUT_MS }).ok,
  };
}

function outputOrThrow(result) {
  if (!result.ok) throw new Error(result.stderr || result.stdout || "clipboard command failed");
  return result.stdout;
}
