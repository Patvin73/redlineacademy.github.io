from PIL import Image
import sys

SRC = "assets/images/favicon-32x32.png"
OUT_ICO = "favicon.ico"
OUT_16 = "assets/images/favicon-16x16.png"
OUT_APPLE = "assets/images/apple-touch-icon.png"

try:
    img = Image.open(SRC).convert('RGBA')
except Exception as e:
    print('ERROR: cannot open source PNG:', e)
    sys.exit(1)

# create 16x16
img16 = img.resize((16,16), Image.LANCZOS)
img16.save(OUT_16, format='PNG')
print('Saved', OUT_16)

# create apple-touch (180x180)
img180 = img.resize((180,180), Image.LANCZOS)
img180.save(OUT_APPLE, format='PNG')
print('Saved', OUT_APPLE)

# create favicon.ico with multiple sizes (16,32,48)
sizes = [(16,16),(32,32),(48,48)]
icons = [img.resize(s, Image.LANCZOS) for s in sizes]
try:
    icons[0].save(OUT_ICO, format='ICO', sizes=sizes)
    print('Saved', OUT_ICO)
except Exception as e:
    print('ERROR: cannot save ICO:', e)
    sys.exit(1)
