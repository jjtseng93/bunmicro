# This is completely optional
- I still recommend using the methods in the root README.md
- Bun's Android build is currently not supported

# Single Exe

This folder contains the Bun single-exe bootstrap used by the project.

## Entry Flow

- `entry.mjs` imports `assetsLoader.mjs` first
- `assetsLoader.mjs` loads `assets.tar` with `Bun.Archive`
- `assetsLoaderPromise` is exposed on `globalThis`
- `../src/index.js` waits for `assetsLoaderPromise` if it exists

That keeps the main program bootable even if asset loading reports errors.

## Asset Loading

- Bundled assets are loaded sequentially with `await file.bytes()`
- Load failures are collected and printed to `stderr`
- Asset loading never rejects the bootstrap promise

## CLI Flags

- `--assets-list`
  - Lists all entries inside bundled `assets.tar`
  - Exits early before the main program starts

- `--assets-extract`
  - Extracts bundled assets to the same directory as the executable
  - Exits early before the main program starts

- `--assets-external`
  - Skips loading bundled assets into `globalThis.internalAssets`
  - Forces `../src/index.js` and runtime helpers to use the external file tree
  - Keeps the bootstrap alive while leaving `internalAssets` falsy

# Usage

  ```shell
  bun build --compile --bytecode --minify --sourcemap ./entry.mjs --outfile=bmi
  ```
