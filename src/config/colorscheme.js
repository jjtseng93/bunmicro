export const DEFAULT_STYLE = {
  fg: "default",
  bg: "default",
  bold: false,
  italic: false,
  reverse: false,
  underline: false,
};

// Built-in fallback styles for color groups not defined in a colorscheme.
// Matches Go micro's default group colours.
const BUILTIN_GROUPS = {
  "diff-added":    { ...DEFAULT_STYLE, fg: "green" },
  "diff-modified": { ...DEFAULT_STYLE, fg: "yellow" },
  "diff-deleted":  { ...DEFAULT_STYLE, fg: "red" },
  "gutter-error":  { ...DEFAULT_STYLE, fg: "red" },
  "gutter-warning":{ ...DEFAULT_STYLE, fg: "yellow" },
  "gutter-info":   { ...DEFAULT_STYLE, fg: "brightblue" },
};

const COLOR_LINK = /color-link\s+(\S*)\s+"(.*)"/;
const INCLUDE = /include\s+"(.*)"/;

export class Colorscheme {
  constructor(runtime) {
    this.runtime = runtime;
    this.styles = new Map();
    this.defaultStyle = { ...DEFAULT_STYLE };
  }

  async load(name = "default", parsed = new Set()) {
    const file = this.runtime.find(0, name);
    if (!file) throw new Error(`${name} is not a valid colorscheme`);
    parsed.add(name);
    const parsedStyles = await this.parse(name, await file.text(), parsed);
    this.styles = parsedStyles;
    return this;
  }

  async parse(name, text, parsed = new Set()) {
    const styles = new Map();
    for (const rawLine of String(text).split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const include = line.match(INCLUDE);
      if (include) {
        const includeName = include[1];
        if (!parsed.has(includeName)) {
          const child = new Colorscheme(this.runtime);
          await child.load(includeName, parsed);
          for (const [key, value] of child.styles) styles.set(key, value);
          if (child.styles.has("default")) this.defaultStyle = child.styles.get("default");
        }
        continue;
      }

      const match = line.match(COLOR_LINK);
      if (!match) throw new Error(`Color-link statement is not valid: ${rawLine}`);
      const style = stringToStyle(match[2], this.defaultStyle);
      styles.set(match[1], style);
      if (match[1] === "default") this.defaultStyle = style;
    }
    if (styles.has("default")) this.defaultStyle = styles.get("default");
    return styles;
  }

  get(group) {
    if (!group) return this.defaultStyle;
    const parts = String(group).split(".");
    let style = this.styles.get(group);
    if (parts.length > 1) {
      let cur = "";
      for (const part of parts) {
        cur = cur ? `${cur}.${part}` : part;
        if (this.styles.has(cur)) style = this.styles.get(cur);
      }
    }
    return style ?? BUILTIN_GROUPS[group] ?? stringToStyle(group, this.defaultStyle);
  }
}

export function stringToStyle(input, base = DEFAULT_STYLE) {
  const text = String(input);
  const colorPart = text.split(/\s+/).at(-1) ?? "";
  const [fgRaw = "default", bgRaw = "default"] = colorPart.split(",");
  return {
    fg: stringToColor(fgRaw.trim(), base.fg),
    bg: stringToColor(bgRaw.trim(), base.bg),
    bold: text.includes("bold"),
    italic: text.includes("italic"),
    reverse: text.includes("reverse"),
    underline: text.includes("underline"),
  };
}

export function stringToColor(value, fallback = "default") {
  const color = String(value || "default").trim();
  if (color === "default" || color === "") return fallback;
  if (/^\d+$/.test(color)) return Number(color);
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  const names = new Set([
    "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
    "brightblack", "brightred", "brightgreen", "brightyellow", "brightblue",
    "brightmagenta", "brightcyan", "brightwhite", "lightblack", "lightred",
    "lightgreen", "lightyellow", "lightblue", "lightmagenta", "lightcyan", "lightwhite",
  ]);
  return names.has(color) ? color : fallback;
}
