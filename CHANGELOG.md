# Changelog

## [0.9.25] - 2026-06-10
- Fixed colorscheme: aligned with go
- Added colorcolumn taberror showchars
  * e.g. showchars = tab=>,space=.
- linter underline
- set hltrailingws on : whitespace
- Added tests/pty-demo.js
  * Demo of the whole bunmicro App
  * bun tests/pty-demo.js

## [0.9.23] - 2026-06-10
- Fixed mouse close prompt cursor move
- Fixed set filetype doesn't apply instantly
- Added syntax highlighting fallback if user ~/.config/micro yaml fails 
- Redetect highlighting syntax when unknown filetype saves
- Warning for dos(CRLF) shell scripts

## [0.9.22] - 2026-06-09
- Clicking on icons toggles prompts
- Unsaved star triggers save cmd
- URLs support save cursor

## [0.9.21] - 2026-06-09
- Prompt mouse click repositions cursor (command and shell prompt)
- Clicking > or $ label toggles between command/shell prompt, preserving input
- Prompt mouse double click: left=key-down, middle=key-up, right=key-enter (command and shell prompt)
- js and eval js/py/sh commands

## [0.9.20] - 2026-06-07
- Added cursor shape option
- Fixed selection hide cursor

## [0.9.19] - 2026-06-06
- Fixed Windows clipboard
- Fixed cli encoding help readme
- Added cli clean config dir
- Added softwrap subrow line number
  * goto line
  * show subrow line number in showpath
  * pageup/down respects softwrap
- Fixed CRLF being overwritten
- Added primary clipboard 
- Fixed clipboard cmd / action
  * Ctrl+K should accumulate
- Clipboard backend priority
- Added OSC 52 clipboard copy
  * Use by set clipboard terminal

## [0.9.10] - 2026-06-04
- Up/Down key auto-complete selection in editor

## [0.9.9] - 2026-06-04
- Added long line protection for softwrap
  * That means binary edits available
  * you can now open libc.so.6
  * Ctrl+E reopen hex3 to edit & save
- Fixed softwrap search match cross line

## [0.9.5] - 2026-06-03
- Added encoding hex3 for binary edit
- term better supports fish
- enter to close term
- bat-like highlighting supports URL

## [0.9.1] - 2026-06-03
- Upgrade method explanation

## [0.9.0] - 2026-06-03
- Added more alt- key bindings
- Alt-s for Selection mode
- Alt-d for unindent/dedent/outdent
- Updated help md documents
- js/python builtin objects autocomplete
- autocomplete includes language keywords
- Fixed unicode/emoji for term and editor

## [0.8.3] - 2026-06-02
- Fixed Linux failed to parse php.yaml crashes the whole program
- Fixed Linux espeak-ng args passing

## [0.8.2] - 2026-06-02
- Fixed Windows TTS function
- Added ttslang for Windows

## [0.8.1] - 2026-06-02
- Added help for prompts and actions in readme
- Added more install guides in readme
- Fixed crash when opening `config.fish`
- Fixed Ctrl-k Ctrl-v newline behavior
