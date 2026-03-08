# Favicon generation

This repository includes a small Python script to generate `favicon.ico` and related sizes from a source PNG.

Usage (Windows/macOS/Linux):

1. Install Pillow:

```bash
python -m pip install --upgrade pillow
```

2. Ensure the source PNG is at `assets/images/favicon-32x32.png` (replace with your new logo PNG).

3. Run the generator:

```bash
python tools/generate_favicons.py
```

This will create/update:

- `favicon.ico` (root)
- `assets/images/favicon-16x16.png`
- `assets/images/apple-touch-icon.png`

If you want me to run this and commit the resulting `favicon.ico`, grant permission and confirm which source image to use (e.g. `assets/images/redlinelogo.png` or `assets/images/favicon-32x32.png`).
