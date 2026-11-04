// Cheap gate for the CLAUDE.md wording rules. Fails the build when:
//   - a forbidden phrase appears in a published file or in the social-card text
//   - something that looks like a street address appears
//   - a script, stylesheet, font or image is loaded from another server
// It does not replace reading the copy against the facts list (/wording-check).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "_site");

const forbidden = [
  "business partner",
  "IBM Partner",
  "Partner Plus",
  "18+",
  "18 years",
  "PA Studio",
  "better than",
  "testimonial",
];

const streetWords =
  "street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd|court|ct|place|pl|way|terrace|circle|highway|hwy|parkway|pkwy";
const streetAddress = new RegExp(
  `\\b\\d{1,5}\\s+(?:[A-Za-z]+\\s+){0,3}(?:${streetWords})\\b\\.?`,
  "i",
);

const textExtensions = new Set([".html", ".css", ".svg", ".txt", ".xml", ""]);
const offSite = /^(?:https?:)?\/\//i;
// <link> rels that do not load anything into the page.
const nonLoadingRels = new Set(["canonical", "alternate", "me", "author", "license"]);

const findings = [];

function report(file, line, rule, text) {
  findings.push({ file: relative(root, file).replaceAll("\\", "/"), line, rule, text: text.trim() });
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function checkPhrases(file, source, { addresses }) {
  source.split("\n").forEach((line, i) => {
    const lower = line.toLowerCase();
    for (const phrase of forbidden) {
      if (lower.includes(phrase.toLowerCase())) {
        report(file, i + 1, `forbidden phrase "${phrase}"`, line);
      }
    }
    if (addresses && streetAddress.test(line)) {
      report(file, i + 1, "looks like a street address", line);
    }
  });
}

function checkHtmlLoads(file, source) {
  const attr = (tag, name) => {
    const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
    return m ? (m[2] ?? m[3] ?? m[4] ?? "") : null;
  };
  const urlsIn = (tag, name) => {
    const value = attr(tag, name);
    if (value === null) return [];
    if (name === "srcset") return value.split(",").map((part) => part.trim().split(/\s+/)[0]);
    return [value];
  };

  for (const m of source.matchAll(/<(script|img|source|link|iframe|video|audio|embed|object)\b[^>]*>/gi)) {
    const tag = m[0];
    const name = m[1].toLowerCase();
    let urls = [];
    if (name === "link") {
      const rels = (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/);
      if (rels.every((rel) => nonLoadingRels.has(rel))) continue;
      urls = urlsIn(tag, "href");
    } else if (name === "object") {
      urls = urlsIn(tag, "data");
    } else {
      urls = [...urlsIn(tag, "src"), ...urlsIn(tag, "srcset")];
    }
    for (const url of urls) {
      if (offSite.test(url)) report(file, lineOf(source, m.index), `off-site <${name}>`, url);
    }
  }
}

// `offset` is where `css` starts inside `full`, so line numbers match the file.
function checkCssLoads(file, css, full = css, offset = 0) {
  for (const m of css.matchAll(/(?:url\(\s*['"]?|@import\s+['"])([^'")\s]+)/gi)) {
    if (offSite.test(m[1])) report(file, lineOf(full, offset + m.index), "off-site url() or @import", m[1]);
  }
}

// 1. Published files.
let scanned = 0;
for (const file of walk(site)) {
  const ext = extname(file).toLowerCase();
  if (!textExtensions.has(ext)) continue;
  const source = readFileSync(file, "utf8");
  scanned += 1;
  checkPhrases(file, source, { addresses: ext === ".html" || ext === ".txt" });
  if (ext === ".html") {
    checkHtmlLoads(file, source);
    for (const m of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      checkCssLoads(file, m[1], source, m.index + m[0].indexOf(">") + 1);
    }
    for (const m of source.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) checkCssLoads(file, m[1], source, m.index);
  }
  if (ext === ".css" || ext === ".svg") checkCssLoads(file, source);
}

// 2. Social-card text, which only exists inside og.png and the script that draws it.
const assetScript = join(root, "tools", "make-assets.py");
const ogLines = readFileSync(assetScript, "utf8")
  .split("\n")
  .map((line, i) => ({ line, n: i + 1 }))
  .filter(({ line }) => /^OG_[A-Z_]+\s*=/.test(line));
if (ogLines.length === 0) {
  report(assetScript, 1, "no OG_* text constants found to check", "");
}
for (const { line, n } of ogLines) {
  for (const phrase of forbidden) {
    if (line.toLowerCase().includes(phrase.toLowerCase())) {
      report(assetScript, n, `forbidden phrase "${phrase}"`, line);
    }
  }
}

if (findings.length > 0) {
  console.error(`wording-check: ${findings.length} finding(s)`);
  for (const f of findings) console.error(`  ${f.file}:${f.line}  ${f.rule}  ${f.text}`);
  process.exit(1);
}
console.log(`wording-check: clean (${scanned} published files, ${ogLines.length} social-card lines)`);
