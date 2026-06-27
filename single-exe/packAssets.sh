#!/bin/sh

sd=$(dirname "$0")

cd "$sd"/..

tar -cvf single-exe/assets.tar runtime README.md CHANGELOG.md node_modules/wasmoon/dist/glue.wasm
