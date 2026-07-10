#!/usr/bin/env python3
"""
Bundle the multi-file "The Edge" app into ONE self-contained HTML file
(`The-Edge.html`) with CSS, fonts, both scripts, and every illustration
inlined as data URIs. The result has zero external references, so it renders
fully anywhere — double-clicked from disk, emailed, or dropped in a preview
pane — with no server and no sibling files.

Usage:  python3 build-standalone.py
Requires: Pillow  (pip install pillow)
"""
import base64, glob, os, re, json
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)

def b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# 1. Optimise illustrations (cap long edge at 900px; line art stays crisp) ----
img_uri = {}
for f in sorted(glob.glob("assets/*.png")):
    im = Image.open(f).convert("RGBA")
    m = max(im.size)
    if m > 900:
        s = 900 / m
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    tmp = "/tmp/_edge_" + os.path.basename(f)
    im.save(tmp, optimize=True)
    img_uri[os.path.basename(f)] = "data:image/png;base64," + b64(tmp)
    os.remove(tmp)
favicon = "data:image/svg+xml;base64," + b64("assets/favicon.svg")

# 2. Fonts: inline woff2 as data URIs inside fonts.css ------------------------
fcss = open("fonts.css").read()
fcss = re.sub(r"url\(\./(fonts/[^)]+\.woff2)\)",
              lambda m: f"url(data:font/woff2;base64,{b64(m.group(1))})", fcss)

styles = open("styles.css").read()

# 3. Point data.js asset refs at a shared (deduped) image map -----------------
data_js = open("data.js").read()
data_js, n = re.subn(r"A \+ '([A-Za-z0-9\-]+\.png)'",
                     lambda m: f"__IMG[{json.dumps(m.group(1))}]", data_js)
data_js = data_js.replace("const A = './assets/';", "const A = '';")
assert n == 37, f"expected 37 asset refs, found {n}"
assert "./assets/" not in data_js

app_js = open("app.js").read()

# 4. Assemble the single HTML file --------------------------------------------
html = open("index.html").read()
html = re.sub(r'<link rel="stylesheet" href="\./fonts\.css" />', f"<style>\n{fcss}\n</style>", html)
html = re.sub(r'<link rel="stylesheet" href="\./styles\.css" />', "<style>\n__STYLES__\n</style>", html)
html = re.sub(r'<link rel="icon"[^>]*>', f'<link rel="icon" href="{favicon}" type="image/svg+xml" />', html)
html = html.replace("    <!-- Fonts are self-hosted (latin subset) so the experience works offline and when emailed. -->\n", "")

img_script = "<script>window.__IMG=" + json.dumps(img_uri) + ";</script>"
scripts = img_script + "\n<script>\n" + data_js + "\n</script>\n<script>\n" + app_js + "\n</script>"
html = html.replace('    <script src="./data.js"></script>\n    <script src="./app.js"></script>', scripts)
html = html.replace("__STYLES__", styles)

with open("The-Edge.html", "w") as f:
    f.write(html)

assert "./assets/" not in html and "./fonts/" not in html and "<script src=" not in html
print(f"✓ The-Edge.html  {os.path.getsize('The-Edge.html')/1e6:.2f} MB — fully self-contained")
