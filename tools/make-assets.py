"""Generate the site's image assets from source.

Writes:
  favicon.svg               navy rounded square, paper "F", amber middle bar
  images/og.png             1200x630 social card
  images/jim-naff-300.jpg   square headshot, 300px
  images/jim-naff-600.jpg   square headshot, 600px

Source: images/jim-naff.jpg (kept untouched).
Run from the repo root:  py tools/make-assets.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"

NAVY = "#0B2545"
AMBER = "#E8A33D"
PAPER = "#F7F5F0"
INK = "#1F2933"
MUTED = "#52606D"

# Square crop of the original (left, top, right, bottom), tuned by eye.
HEADSHOT_CROP = (338, 0, 1678, 1340)
HEADSHOT_SIZES = (300, 600)
JPEG_QUALITY = 82

# Text on the social card. tools/wording-check.mjs scans these lines too.
OG_WORD_BOLD = "Forecastry"
OG_WORD_REGULAR = "Analytics"
OG_TAGLINE = "Forecasting and FP&A planning systems"
OG_URL = "forecastryanalytics.com"

FONT_DIRS = [
    Path("C:/Windows/Fonts"),
    Path("/usr/share/fonts/truetype/dejavu"),
    Path("/usr/share/fonts/TTF"),
    Path("/Library/Fonts"),
    Path("/System/Library/Fonts/Supplemental"),
]
SEMIBOLD_FONTS = ["seguisb.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"]
REGULAR_FONTS = ["segoeui.ttf", "DejaVuSans.ttf", "Arial.ttf", "arial.ttf"]


def find_font(names, size):
    for name in names:
        for folder in FONT_DIRS:
            path = folder / name
            if path.exists():
                return ImageFont.truetype(str(path), size)
    raise SystemExit(f"No usable font found. Tried: {', '.join(names)}")


def make_favicon():
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="{NAVY}"/>
  <rect x="19" y="13" width="9" height="38" fill="{PAPER}"/>
  <rect x="19" y="13" width="28" height="9" fill="{PAPER}"/>
  <rect x="28" y="28" width="16" height="8" fill="{AMBER}"/>
</svg>
"""
    (ROOT / "favicon.svg").write_text(svg, encoding="utf-8", newline="\n")


def make_og():
    width, height = 1200, 630
    left = 96
    img = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(img)

    word_bold = find_font(SEMIBOLD_FONTS, 104)
    word_regular = find_font(REGULAR_FONTS, 104)
    tagline = find_font(REGULAR_FONTS, 46)
    url = find_font(REGULAR_FONTS, 32)

    # Wordmark on one baseline.
    baseline = 270
    draw.text((left, baseline), OG_WORD_BOLD, font=word_bold, fill=NAVY, anchor="ls")
    gap = draw.textlength(" ", font=word_regular)
    x = left + draw.textlength(OG_WORD_BOLD, font=word_bold) + gap
    draw.text((x, baseline), OG_WORD_REGULAR, font=word_regular, fill=NAVY, anchor="ls")

    # Amber rule, then tagline and URL.
    draw.rectangle((left, 318, left + 140, 327), fill=AMBER)
    draw.text((left, 410), OG_TAGLINE, font=tagline, fill=INK, anchor="ls")
    draw.text((left, 540), OG_URL, font=url, fill=MUTED, anchor="ls")

    # Navy band along the bottom edge.
    draw.rectangle((0, height - 18, width, height), fill=NAVY)

    img.save(IMAGES / "og.png", optimize=True)


def make_headshots():
    with Image.open(IMAGES / "jim-naff.jpg") as src:
        square = src.convert("RGB").crop(HEADSHOT_CROP)
    for size in HEADSHOT_SIZES:
        out = square.resize((size, size), Image.Resampling.LANCZOS)
        # No exif or icc arguments, so no metadata is written.
        out.save(
            IMAGES / f"jim-naff-{size}.jpg",
            "JPEG",
            quality=JPEG_QUALITY,
            optimize=True,
            progressive=True,
        )


def main():
    make_favicon()
    make_og()
    make_headshots()
    for name in ["favicon.svg", "images/og.png", "images/jim-naff-300.jpg", "images/jim-naff-600.jpg"]:
        path = ROOT / name
        print(f"{name}: {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
