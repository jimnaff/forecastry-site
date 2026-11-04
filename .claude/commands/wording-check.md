Check $ARGUMENTS (default: index.html and COPY.md) against the WORDING RULES in
CLAUDE.md.

Steps:
1. Grep for forbidden strings, case-insensitive: "business partner", "IBM Partner",
   "Partner Plus", "18+", "18 years", "PA Studio", "better than", "testimonial",
   any street-address pattern (number followed by a street word), any
   img/link/script/font src pointing off-site.
2. Read the About and Tools sections and compare each factual claim to the facts
   list in CLAUDE.md. Flag anything not on the list.
3. Confirm the contact section contains only the email, the LinkedIn URL, and the
   line "North Grafton, Massachusetts". CLAUDE.md is the source of truth: location
   is "North Grafton, Massachusetts" only, and no rates or booking link.

Output a table: Finding | File:line | Rule broken | Suggested fix. If there are no
findings, say "Wording check: clean." Do not edit files; report only.