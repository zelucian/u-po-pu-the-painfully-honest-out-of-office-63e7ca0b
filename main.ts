import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Thank you for your email — I'm out of office, and honestly I'm not reading this just yet because rest is the one deadline I've stopped missing.";

// Maximum line length (characters). The one-liner must stay short enough to
// read at a glance, so anything longer is rejected before writing.
const MAX_LINE_CHARS = 200;

function assertValidLine(line: string): void {
  if (line.length < 1 || line.length > MAX_LINE_CHARS) {
    throw new Error(
      `Line must be 1-${MAX_LINE_CHARS} characters, got ${line.length}.`,
    );
  }
  // U+FFFD is the Unicode replacement character: its presence means the
  // source text was decoded from damaged UTF-8, so refuse it outright.
  if (line.includes("\uFFFD")) {
    throw new Error("Line must not contain the replacement character U+FFFD.");
  }
  if (line.trim().length === 0) {
    throw new Error("Line must not be only whitespace.");
  }
  if (line !== line.trim()) {
    throw new Error("Line must not have leading or trailing whitespace.");
  }
  if (/[\r\n]/.test(line)) {
    throw new Error("Line must be a single line (no newline characters).");
  }
  // No control characters: the output must be one clean line of text.
  if (/[\u0000-\u001F\u007F]/.test(line)) {
    throw new Error("Line must not contain control characters.");
  }
}

assertValidLine(LINE);

// Writes the validated line to <outDir>/entry.txt and verifies the write by
// reading the file back. Throws on any mismatch so a bad write is never
// mistaken for a successful run.
function writeEntry(line: string): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, line, "utf8");
  const written = readFileSync(outPath, "utf8");
  if (written !== line) {
    throw new Error("Read-back mismatch: entry.txt does not match the line.");
  }
  // Byte-length cross-check: equal strings must encode to equal byte counts,
  // so a mismatch here means the file was written with the wrong encoding.
  if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(line, "utf8")) {
    throw new Error("Byte-length mismatch: entry.txt encoding is wrong.");
  }
}

writeEntry(LINE);
