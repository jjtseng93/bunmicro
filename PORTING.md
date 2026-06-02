# Porting Plan

## Dependency Policy

- Prefer Bun built-ins and Web/Node-compatible built-ins.
- Lua may use a pure JavaScript or WebAssembly package.
- Avoid native bindings: no `.node`, N-API, node-gyp, curses/notcurses bindings.
- Platform integration should use commands that already exist on the system.

## Platform Policies

### Zip Extraction

- macOS: use built-in `tar` / bsdtar.
- Windows: use built-in `tar.exe` / bsdtar.
- Linux and Android: use `unzip` if present; otherwise show an install message.

### Clipboard

- Android: try `termux-clipboard-set` and `termux-clipboard-get` first, then Linux-style tools.
- Linux: try `wl-copy` / `wl-paste`, then `xclip`, then `xsel`; do not use Termux commands when `process.platform` reports Linux.
- macOS: use `pbcopy` / `pbpaste`.
- Windows: use PowerShell `Set-Clipboard` / `Get-Clipboard -Raw`.
- If no external backend is available, use internal registers only.

## Lua

Runtime is `wasmoon` only because it is WebAssembly, not native binding, and keeps the project to one Lua VM. It needs a micro-specific interop layer that exposes `import("micro")`, `import("micro/buffer")`, `import("micro/config")`, and related APIs.

## Terminal Screen

There is no direct tcell equivalent in Bun without native bindings. The port
should implement a local screen abstraction over raw stdin/stdout, ANSI escape
sequences, bracketed paste, mouse tracking, and a cell diff renderer.
