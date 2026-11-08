#!/usr/bin/env python3
"""
update_name.py
Updates all references to Vadim Carazan to Shamveel Khan, including generating
custom typographic SVG lettering from PP Editorial Old Italic.
"""

import re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

def update_name():
    font_path = "/home/shamveelkhan/Downloads/vadim-portfolio/fonts/pp-editorial-old-italic.woff2"
    f = TTFont(font_path)
    glyph_set = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f['hmtx']

    # 1. Generate single line SVG path
    pen_single = SVGPathPen(glyph_set)
    x_cursor = 0
    for char in "Shamveel Khan":
        if char == " ":
            x_cursor += 240
            continue
        gname = cmap[ord(char)]
        advance, lsb = hmtx[gname]
        tpen = TransformPen(pen_single, (1, 0, 0, -1, x_cursor, 830))
        glyph_set[gname].draw(tpen)
        x_cursor += advance - 15

    path_single = pen_single.getCommands()
    viewbox_single = f"0 0 {x_cursor + 20} 860"

    # 2. Generate stacked SVG path
    pen_stack = SVGPathPen(glyph_set)
    # Line 1: Shamveel
    x_cursor1 = 0
    for char in "Shamveel":
        gname = cmap[ord(char)]
        advance, lsb = hmtx[gname]
        tpen = TransformPen(pen_stack, (1, 0, 0, -1, x_cursor1, 830))
        glyph_set[gname].draw(tpen)
        x_cursor1 += advance - 15

    # Line 2: Khan (shifted down by 740)
    x_cursor2 = 0
    for char in "Khan":
        gname = cmap[ord(char)]
        advance, lsb = hmtx[gname]
        tpen = TransformPen(pen_stack, (1, 0, 0, -1, x_cursor2, 830 + 740))
        glyph_set[gname].draw(tpen)
        x_cursor2 += advance - 15

    path_stack = pen_stack.getCommands()
    w_stack = max(x_cursor1, x_cursor2) + 20
    h_stack = 830 + 740 + 50
    viewbox_stack = f"0 0 {w_stack} {h_stack}"

    print(f"Generated SVG paths:\n  - Single line viewbox: {viewbox_single}\n  - Stacked viewbox: {viewbox_stack}")

    # Read index.html
    html_path = "/home/shamveelkhan/Downloads/vadim-portfolio/index.html"
    with open(html_path, "r", encoding="utf-8") as file:
        html = file.read()

    # Replace titles, metas, labels
    html = html.replace("<title>Vadim Carazan, Creative Director</title>", "<title>Shamveel Khan, Creative Director</title>")
    html = html.replace('content="Vadim Carazan, creative director', 'content="Shamveel Khan, creative director')
    html = html.replace('content="Vadim Carazan, Creative Director"', 'content="Shamveel Khan, Creative Director"')
    html = html.replace('aria-label="Vadim Carazan, home"', 'aria-label="Shamveel Khan, home"')
    html = html.replace('aria-label="Vadim Carazan"', 'aria-label="Shamveel Khan"')
    html = html.replace("I'm Vadim.", "I'm Shamveel.")

    # Replace SVG in #bigname
    new_bigname = f'<h1 class="bigname" id="bigname" aria-label="Shamveel Khan"><svg class="namesvg" viewBox="{viewbox_single}" aria-hidden="true" focusable="false"><path d="{path_single}"/></svg><svg class="namesvg-stack" viewBox="{viewbox_stack}" aria-hidden="true" focusable="false"><path d="{path_stack}"/></svg></h1>'

    html = re.sub(r'<h1 class="bigname" id="bigname".*?</h1>', new_bigname, html, flags=re.DOTALL)

    with open(html_path, "w", encoding="utf-8") as file:
        file.write(html)
    print("Updated index.html successfully!")

    # Read app.js
    app_path = "/home/shamveelkhan/Downloads/vadim-portfolio/app.js"
    with open(app_path, "r", encoding="utf-8") as file:
        app_js = file.read()

    app_js = app_js.replace("${p.t} · Vadim Carazan", "${p.t} · Shamveel Khan")

    with open(app_path, "w", encoding="utf-8") as file:
        file.write(app_js)
    print("Updated app.js successfully!")

if __name__ == "__main__":
    update_name()
