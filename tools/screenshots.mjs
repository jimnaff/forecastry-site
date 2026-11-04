// Save full-page screenshots of the staged site to docs/screenshots/.
// Run: npm run screenshots   (stages _site/ first, then runs this)
// Fails if the page is wider than the viewport (horizontal scroll on phones).
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const page = join(root, "_site", "index.html");
const outDir = join(root, "docs", "screenshots");

const views = [
  { name: "phone", width: 375, height: 667, isMobile: true },
  { name: "desktop", width: 1280, height: 800, isMobile: false },
];

if (!existsSync(page)) {
  console.error("screenshots: _site/index.html not found. Run `npm run stage` first.");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
let failed = false;
try {
  const tab = await browser.newPage();
  for (const view of views) {
    await tab.setViewport({ width: view.width, height: view.height, isMobile: view.isMobile, deviceScaleFactor: 1 });
    await tab.goto(pathToFileURL(page).href, { waitUntil: "load" });

    // The headshot is lazy-loaded; scroll to it and wait so it appears in the shot.
    await tab.evaluate(() => document.querySelector(".headshot")?.scrollIntoView());
    await tab.waitForFunction(() => document.querySelector(".headshot")?.complete ?? true);
    await tab.evaluate(() => window.scrollTo(0, 0));

    // Compare with clientWidth, not innerWidth: mobile emulation zooms out to fit
    // wide content, so innerWidth grows with the overflow and hides it.
    const { scrollWidth, clientWidth } = await tab.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (scrollWidth > clientWidth) {
      console.error(`screenshots: ${view.name} page is ${scrollWidth}px wide in a ${clientWidth}px viewport`);
      failed = true;
    }

    const file = join(outDir, `${view.name}.png`);
    await tab.screenshot({ path: file, fullPage: true });
    console.log(`screenshots: wrote ${relative(root, file).replaceAll("\\", "/")} (${view.width}px wide)`);
  }
} finally {
  await browser.close();
}
if (failed) process.exit(1);
