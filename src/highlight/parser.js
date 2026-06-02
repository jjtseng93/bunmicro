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
  constructor(header, source) {
    this.header = header;
    this.filetype = header.filetype;
    this.source = source;
    this.rules = parseRules(source.rules ?? []);
  }
}

export async function loadSyntaxDefinitions(runtime) {
  const headers = new Map();
  for (const file of runtime.list(4)) {
    headers.set(file.name, parseHeaderFile(await file.text()));
  }

  const definitions = [];
  for (const file of runtime.list(1)) {
    try{
      const source = Bun.YAML.parse(await file.text());
      const header = headers.get(file.name) ?? parseHeaderYaml(source);
      definitions.push(new SyntaxDefinition(header, source));
    }catch(e){
      console.error("Failed to parse syntax yaml:",file.name)
      console.error("  Will not highlight this kind of file")
      console.error("  @ loadSyntaxDefinitions ")
    }
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
