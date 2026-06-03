import { basename } from "node:path";

export class SyntaxHeader {
  constructor({ filetype = "", filename = "", header = "", signature = "" } = {}) {
    this.filetype = filetype;
    this.filename = filename;
    this.header = header;
    this.signature = signature;
    this.fileNameRegex = compileRegex(filename);
    this.headerRegex = compileRegex(header);
    this.signatureRegex = compileRegex(signature);
  }

  matchFileName(path) {
    return !!this.fileNameRegex?.test(basename(path));
  }

  matchHeader(firstLine) {
    return !!this.headerRegex?.test(firstLine);
  }

  hasSignature() {
    return !!this.signatureRegex;
  }

  matchSignature(line) {
    return !!this.signatureRegex?.test(line);
  }
}

export class SyntaxDefinition {
  constructor(header, source, text = "") {
    this.header = header;
    this.filetype = header.filetype;
    this.source = source;
    this.rules = parseRules(source.rules ?? []);
    this.autocompleteWords = scanAutocompleteWordsFromText(text);
  }
}

export async function loadSyntaxDefinitions(runtime) {
  const headers = new Map();
  for (const file of runtime.list(4)) {
    headers.set(file.name, parseHeaderFile(await file.text()));
  }

  const definitions = [];
  for (const file of runtime.list(1)) {
    let text = "";
    try {
      text = await file.text();
    } catch (e) {
      console.error("Failed to read syntax yaml:", file.name);
      console.error("  Will not highlight this kind of file");
      console.error("  @ loadSyntaxDefinitions ");
      continue;
    }

    let source = null;
    try {
      source = Bun.YAML.parse(text);
    } catch (e) {
      console.error("Failed to parse syntax yaml:", file.name);
      console.error("  Will not highlight this kind of file");
      console.error("  @ loadSyntaxDefinitions ");
    }

    const header = headers.get(file.name) ?? (source ? parseHeaderYaml(source) : parseHeaderTextFallback(text, file.name));
    definitions.push(new SyntaxDefinition(header, source ?? { rules: [] }, text));
  }
  return definitions;
}

export function detectSyntax(definitions, { path = "", firstLine = "", lines = [] } = {}) {
  for (const def of definitions) {
    if (path && def.header.matchFileName(path)) return def;
  }
  for (const def of definitions) {
    if (firstLine && def.header.matchHeader(firstLine)) return def;
  }
  for (const def of definitions) {
    if (!def.header.hasSignature()) continue;
    if (lines.some((line) => def.header.matchSignature(line))) return def;
  }
  return null;
}

export function parseHeaderFile(text) {
  const [filetype = "", filename = "", header = "", signature = ""] = String(text).split(/\r?\n/);
  return new SyntaxHeader({ filetype, filename, header, signature });
}

export function parseHeaderYaml(source) {
  return new SyntaxHeader({
    filetype: source?.filetype ?? "",
    filename: source?.detect?.filename ?? "",
    header: source?.detect?.header ?? "",
    signature: source?.detect?.signature ?? "",
  });
}

function parseHeaderTextFallback(text, fileName = "") {
  const source = String(text ?? "");
  const fallbackType = String(fileName).replace(/\.ya?ml$/i, "");
  const filetype = rawYamlScalar(source.match(/^filetype:[ \t]*(.*)$/m)?.[1]) || fallbackType;
  return new SyntaxHeader({
    filetype,
    filename: rawYamlDetectScalar(source, "filename"),
    header: rawYamlDetectScalar(source, "header"),
    signature: rawYamlDetectScalar(source, "signature"),
  });
}

function rawYamlDetectScalar(text, key) {
  const detect = text.match(/^detect:[ \t]*(?:#.*)?(?:\r?\n)((?:[ \t]+[^\n]*\r?\n?)*)/m)?.[1] ?? "";
  return rawYamlScalar(detect.match(new RegExp(`^[ \t]+${key}:[ \t]*(.*)$`, "m"))?.[1]);
}

function rawYamlScalar(value) {
  if (value == null) return "";
  let out = String(value).trim();
  if (!out) return "";
  if (out.startsWith("\"") && out.endsWith("\"")) {
    try { return JSON.parse(out); } catch { return out.slice(1, -1); }
  }
  if (out.startsWith("'") && out.endsWith("'")) return out.slice(1, -1).replaceAll("''", "'");
  return out;
}

function scanAutocompleteWordsFromText(text) {
  const source = String(text ?? "");
  const words = [];
  const seen = new Set();
  let i = 0;
  while (i < source.length) {
    if (!isSyntaxWordChar(source[i])) { i++; continue; }
    let j = i;
    while (j < source.length && isSyntaxWordChar(source[j])) j++;
    const word = source.slice(i, j);
    if (!seen.has(word)) {
      seen.add(word);
      words.push(word);
    }
    i = j;
  }
  return words;
}

function isSyntaxWordChar(ch) {
  if (!ch) return false;
  const cp = ch.codePointAt(0);
  if ((cp >= 65 && cp <= 90) || (cp >= 97 && cp <= 122) || (cp >= 48 && cp <= 57) || cp === 95) return true;
  if (cp <= 127) return false;
  return /\p{L}|\p{N}/u.test(ch);
}

function parseRules(rules) {
  return rules.map((rule) => parseRule(rule)).filter(Boolean);
}

function parseRule(rule) {
  if (typeof rule === "string") return { type: "include", include: rule };
  if (!rule || typeof rule !== "object") return null;
  const [[group, value]] = Object.entries(rule);
  if (group === "include") return { type: "include", include: value };
  if (typeof value === "string") return { type: "pattern", group, regex: compileRegex(value), source: value };
  if (value && typeof value === "object") {
    return {
      type: "region",
      group,
      start: compileRegex(value.start),
      end: compileRegex(value.end),
      skip: compileRegex(value.skip),
      limitGroup: value["limit-group"] ?? group,
      rules: parseRules(value.rules ?? []),
      source: value,
    };
  }
  return null;
}

function compileRegex(pattern) {
  if (!pattern) return null;
  const translated = translateGoRegexp(pattern);
  try {
    return new RegExp(translated, "u");
  } catch {
    try {
      return new RegExp(translated);
    } catch {
      return null;
    }
  }
}

function translateGoRegexp(pattern) {
  return String(pattern)
    .replaceAll("[[:alnum:]]", "[A-Za-z0-9]")
    .replaceAll("[[:alpha:]]", "[A-Za-z]")
    .replaceAll("[[:ascii:]]", "[\\x00-\\x7F]")
    .replaceAll("[[:blank:]]", "[ \\t]")
    .replaceAll("[[:cntrl:]]", "[\\x00-\\x1F\\x7F]")
    .replaceAll("[[:digit:]]", "[0-9]")
    .replaceAll("[[:graph:]]", "[!-~]")
    .replaceAll("[[:lower:]]", "[a-z]")
    .replaceAll("[[:print:]]", "[ -~]")
    .replaceAll("[[:space:]]", "\\s")
    .replaceAll("[[:upper:]]", "[A-Z]")
    .replaceAll("[[:word:]]", "[A-Za-z0-9_]")
    .replaceAll("[[:xdigit:]]", "[A-Fa-f0-9]");
}
