# Introduction
- bunmicro is a Bun JavaScript rewrite of the micro editor originally in Golang
- This project is not affiliated with Bun / Micro
- .
- Original project:
- https://github.com/micro-editor/micro
- .
- Mostly written by Claude or Codex
- But also some handwritten code 

# Unique features
## Load URLs directly
- bunmicro `url`
- or inside the editor Ctrl-E open `url`
## Long line protection
- In the original micro, if you open a minified file like vue.min.js it will be very slow due to re-highlighting
- In this Bun version, if line > 300 characters, re-highlighting is paused until ESC is pressed
## Text-To-Speech
- Ctrl-E tts: Start reading from the current position
- Ctrl-E ttsspeed 2
- Ctrl-E ttspitch 1.1
## Easy selection
- Mouse click on line numbers to select a range of lines
- Alt-s to enter selection mode
- Useful without a mouse on Android
- Also available: Ctrl-E act SelectRight
## js plugin
- Instead of writing Lua, use your familiar JavaScript to extend functionalities
- runtime/jsplugins/`name`/`name`.js
- a full documentation in example.js
- an example plugin named chapter for turning to the next/prev page by number. 
- It registers 2 commands: next/prevchapter
## Output highlighted text to terminal
- Works like bat ccat glow
- bunmicro -bat file
- aliases: --cat --bat --ccat --glow
## Preview color schemes(theme)
- Ctrl-E theme, then press Tab and use arrow keys to preview
## Mouse clicks more useful
- Almost every component on the screen is clickable or double clickable
- A complete help is at the end
## Auto-completions arrow keys
- Press Tab and use arrow keys to select items
## action/js commands
- A complete help is at the end
## Portability
- One codebase. One folder. 
- Runs on Windows, Android, Linux
- No per-platform builds
- No native bindings
- No recompilation
- Just Copy folder -> Run with Bun
## Version shows backends
- bunmicro --version shows http/clipboard/tts backends

# Installation and basic usage

## Option 1: Use npm
### 1. Install npm
- Android(Termux): pkg i npm
  * As of 2026/06/01
  * npm is the only way for automatically installing Bun for Android(Termux) 
  * bunx is broken on Android
- Windows: .msi, macOS: .pkg
  * https://nodejs.org
- Linux: one of
  * sudo apt install npm
  * sudo apk add npm
  * sudo pacman -S npm
  * or use whatever package manager your OS provides 

### 2. Install bunmicro

```sh
# Install Bun
npm install -g bun

# Run bunmicro(stable)
npx bunmicro
# npx bunmicro [options] [file1] [file2] ...
# alternative: bun bunmicro/src/index.js [options] [file1] [file2] ...
# if npx is not available, use npm x -- bunmicro

# Run bunmicro(shorter command, less stable)
# npm install -g bunmicro
# bunmicro
```

## Option 2: Use Bun
- Android(Termux): Use npm
- You can install Bun at:
- https://bun.com

```sh
bun x bunmicro
# bun x bunmicro [options] [file1] [file2] ... 
# alternative: bun bunmicro/src/index.js [options] [file1] [file2] ...

# If bunx is broken, follow the 2 steps below
# bun i -g --backend=copyfile bunmicro
# bun ~/.bun/bin/bunmicro
```

# Basic features 
- Inherited from the original Golang micro
- Only features listed here are implemented
  * There may be some differences from the original micro. Let me know if it's an obvious bug.
  * Send me an email directly:
  * jjtseng93@gmail.com
- .
- Easy to use: No mode switching. Just start typing.
- Familiar key bindings (Ctrl-s=Save, Ctrl-c=Copy, etc)
- Panes(Splits) & Tabs (multitasking)
- nano-like key bindings menu by Alt-g or mouse click
- Extremely good mouse support
- Cross-platform: Copy the same bunmicro folder and run anywhere with Bun present
- Plugin system
  * From the original micro: written in Lua
  * From bunmicro: jsplugins in Bun JavaScript
  * runtime/plugins runtime/jsplugins
- diff gutter: diff color shown at the line numbers column
- autocompletion by pressing Tab
- Auto linting on save or command(lint) if tools are installed
- Syntax highlighting for over 130 languages
- Color scheme support (theme)
- Copy and paste with the system clipboard
- Small and simple (around 3MB)
- Common editor features such as undo/redo, line numbers, Unicode support, soft wrapping, etc

# Useful key bindings:
- For a detailed help:
- Ctrl+E > help defaultkeys

- `Ctrl-Q`: Close current tab/pane, quits if it is the last tab/pane; prompts if modified
- `Alt-q`: Close current tab/pane, quits if it is the last tab/pane; prompts if modified
- `Ctrl-S`: Save
- `Ctrl-O`: Open
- `Ctrl-G`: Toggle help pane
- `Ctrl-E`: Command prompt
- `Ctrl-K`: Cut current line to detected clipboard backend
- `Ctrl-F`: Find
- `Ctrl-Z`: Undo
- `Ctrl-Y`: Redo
- `Ctrl-A`: Select All
- `Ctrl-B`: Shell prompt
- `Ctrl-D`: Duplicate Line/Selection
- `Ctrl-T`: Open a new tab
- `Alt-g`: Toggle nano-like key bindings menu 
- `Alt-h`: replace [-l] `text1` `text2`
- `Alt-c`: Toggle comment
- `Alt-s`: Selection mode
- `Alt-,` / `Alt-p`: Previous tab
- `Alt-.` / `Alt-t`: Next tab
- `Alt-k` / `Alt-j`: Move lines Up/Down
- `Tab`: Triggers autocomplete
- `Esc`: close command/shell prompt or terminal pane, rehighlight long lines

# Mouse click actions
- Top Tabs: 
  * Click: switch tabs
  * Double click: show complete file path
- Line numbers(gutter):
  * Click: select lines
  * Double click: toggle comment
  * also click on linter symbols to show the problem
- Filename: Switch tabs or show complete file path
- (row,col)
  * row to goto line
  * col to jump cursor between paired ()[]{} or Home/End
- Multi-window icon: new tab
- File type: switch highlighting languages
- Euro: Command prompt
- Unix/dos: toggle newline chars LF/CRLF
- Dollar: Shell prompt
- Encoding: Reopen with a specific encoding. 
  * Show supported encodings by bunmicro --version
- Alt-G: Show nano-like key bindings menu 

# Command/Shell Prompts
## Command
- Internal commands for automating / tuning bunmicro
- Press Tab for available commands, arrow keys for selection
- In this Bun version, I added more commands like
  * js to eval JavaScript
  * act/action to do automation actions.
  * Press tab after act to get a list of them
  * or use help actions to show the list
## Shell
- Executes a given shell command like sh -c
- Outputs the result to the original terminal before entering bunmicro
