# Changelog

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
