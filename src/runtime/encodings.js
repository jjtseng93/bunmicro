const HEX3_ENCODINGS = new Set(["hex3", "hex3gz", "hex3zst"]);

export function isHex3Encoding(encoding) {
  return HEX3_ENCODINGS.has(String(encoding || "utf-8").toLowerCase());
}
