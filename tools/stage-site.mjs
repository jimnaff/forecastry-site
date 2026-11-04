// Copy the public files into _site/. Checks and the Pages deploy use _site/,
// so tools/, README.md, CLAUDE.md and config files are never published.
// There is no build step: the files are copied as they are.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "_site");

const allowlist = [
  "index.html",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "css",
  "images",
];

// The original headshot is the source for the resized copies; it is not served.
const skip = new Set([join(root, "images", "jim-naff.jpg")]);

rmSync(out, { recursive: true, force: true });
mkdirSync(out);

for (const entry of allowlist) {
  const src = join(root, entry);
  if (!existsSync(src)) {
    console.error(`stage: missing ${entry}`);
    process.exit(1);
  }
  cpSync(src, join(out, entry), {
    recursive: true,
    filter: (path) => !skip.has(path),
  });
}

console.log(`stage: copied ${allowlist.length} entries to _site/`);
