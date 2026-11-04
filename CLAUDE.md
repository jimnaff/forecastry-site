# CLAUDE.md — Forecastry Analytics website

## Clear instructions
One-page static marketing site for Forecastry Analytics LLC (FP&A analytics
consulting; IBM Planning Analytics / TM1 today, other planning platforms later).
Audience: CFOs, FP&A leaders, IBM partner-program reviewers. Tone: plain, confident,
no hype. Short sentences. No buzzwords. Done beats perfect.

## Operational process
- Start every step on a feature branch: feat/<step-slug>.
- Plan before editing. If the real code or a tool contradicts the plan or this file,
  say so in the handback. Never adapt silently.
- Run all checks locally before committing. Merge to main only when CI is green.
- Commit messages: imperative, one line of what and why.
- End every step with a handback report: what was built, test output, deviations
  from the plan, open questions.
- Never touch DNS, Namecheap, or email settings. Those are Jim's.

## Naming and standards
- Files: index.html, css/styles.css, images/, tools/, docs/. Lowercase, hyphens.
- Semantic HTML5. One h1. Heading levels in order. Every image has alt text.
- CSS: custom properties for colors and spacing, mobile-first media queries, no
  frameworks, no preprocessors.
- No JavaScript unless unavoidable; justify it in the handback if added.

## Testing and quality gates
- html-validate on index.html.
- lychee link check.
- pa11y-ci, WCAG2AA.
- Lighthouse CI, mobile preset: performance, accessibility, best-practices, seo >= 0.9.
- All of these run in GitHub Actions and must pass before merge.

## Examples and references
- Palette: --navy #0B2545, --navy-deep #071A33, --amber #E8A33D, --paper #F7F5F0,
  --ink #1F2933. Amber is for accents and the CTA only; never for body text.
- Wordmark: text only. "Forecastry" semibold, "Analytics" regular, navy on paper.
- Live URL after go-live: https://forecastryanalytics.com. Pages URL meanwhile:
  https://jimnaff.github.io/forecastry-site/.

## Expectations and boundaries — WORDING RULES (hard constraints)
Facts about Jim (use these; do not embellish):
- Jim Naff (James F. Naff), sole member of Forecastry Analytics LLC, a Massachusetts LLC.
- IBM Champion; active in the TM1 / Planning Analytics community.
- Working with TM1 since 2007. NEVER write "18+ years" or "built and run TM1 systems
  for 18+ years." Say "since 2007" only.
- Accounting degree and accounting background; taught himself programming to move
  from accounting into systems work. Understands both the numbers and the tech.
- Former IBM TM1 Finance Systems Manager in FP&A at Coursera, 2021–2022.
- Prototyping AI-augmented Planning Analytics tools since 2023; 14+ LinkedIn articles.
- Built a TM1 MCP server, a PAW MCP server, and a VS Code extension for TM1.
  Do NOT name the VS Code extension. Say "a VS Code extension for TM1."
Never:
- Say "IBM Business Partner" or "IBM Partner" in any form. "IBM Champion" is fine.
  "Registered with IBM Partner Plus" is NOT to appear either.
- Use IBM logos, badges, or trademark imagery. Plain-text product names
  ("IBM Planning Analytics", "TM1", "Planning Analytics Workspace") are fine.
- Claim Jim's tools are better than, replace, or outperform IBM's.
- Name any client, employer's client, or show their logo.
- Invent testimonials, statistics, client results, years-of-experience numbers,
  or quotes.
- Show a street address. Location is "North Grafton, Massachusetts" only.
- Load fonts, scripts, or images from third-party servers.
Contact: jim@forecastryanalytics.com and https://www.linkedin.com/in/jimnaff/.
No rates, no booking link.

## Tools and dependencies
- GitHub Pages + GitHub Actions (actions/configure-pages, upload-pages-artifact,
  deploy-pages).
- Dev checks via npx: html-validate, lychee (or lychee-action in CI), pa11y-ci,
  @lhci/cli. Asset generation: Python 3 + Pillow (or Node + sharp).
- No package.json runtime dependencies; dev tools only.