"""Remove paper background from scanned hand-drawn assets using color distance + flood fill."""

from PIL import Image
import numpy as np
from scipy import ndimage
from pathlib import Path


def remove_background(input_path: str, output_path: str):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    r, g, b = data[:, :, 0].astype(float), data[:, :, 1].astype(float), data[:, :, 2].astype(float)

    # Sample paper color from corners (average of all 4 corners, 100x100 px)
    h, w = r.shape
    corners = []
    for region in [data[:100, :100], data[:100, -100:], data[-100:, :100], data[-100:, -100:]]:
        corners.append(region[:, :, :3].mean(axis=(0, 1)))
    paper_rgb = np.mean(corners, axis=0)  # average paper color
    print(f"  Paper color: R={paper_rgb[0]:.0f} G={paper_rgb[1]:.0f} B={paper_rgb[2]:.0f}")

    # Color distance from paper color
    dist = np.sqrt((r - paper_rgb[0])**2 + (g - paper_rgb[1])**2 + (b - paper_rgb[2])**2)

    # Content = pixels far from paper color (threshold ~80 works well for ink + colored fills)
    is_content = dist > 80

    # Flood fill: find non-content regions connected to border = background
    not_content = ~is_content
    labeled, num_features = ndimage.label(not_content)

    # Find labels touching the border
    border_labels = set()
    border_labels.update(labeled[0, :].tolist())
    border_labels.update(labeled[-1, :].tolist())
    border_labels.update(labeled[:, 0].tolist())
    border_labels.update(labeled[:, -1].tolist())
    border_labels.discard(0)

    is_background = np.isin(labeled, list(border_labels))

    # Make background transparent
    data[is_background, 3] = 0

    # Also make remaining near-paper pixels semi-transparent for smoother edges
    # (pixels that are close to paper but not connected to border = inside the drawing)

    result = Image.fromarray(data)

    # Crop to bounding box using alpha
    alpha = data[:, :, 3]
    rows_mask = np.any(alpha > 0, axis=1)
    cols_mask = np.any(alpha > 0, axis=0)
    if rows_mask.any() and cols_mask.any():
        rmin, rmax = np.where(rows_mask)[0][[0, -1]]
        cmin, cmax = np.where(cols_mask)[0][[0, -1]]
        result = result.crop((cmin, rmin, cmax + 1, rmax + 1))

    # Add small padding
    padding = 10
    padded = Image.new("RGBA", (result.width + padding * 2, result.height + padding * 2), (0, 0, 0, 0))
    padded.paste(result, (padding, padding))

    padded.save(output_path, "PNG")
    print(f"  Saved: {output_path} ({padded.width}x{padded.height})")


def main():
    assets_dir = Path(__file__).parent / "assets"

    tasks = [
        ("IMG_1029", "ghost_blue.png", "Blauw spookje"),
        ("IMG_1030", "ghost_red.png", "Rood spookje"),
        ("IMG_1031", "dot.png", "Pickup dot"),
    ]

    for src_base, dst_name, label in tasks:
        num = src_base.split("_")[1]
        tmp = f"/tmp/preview_{num}.png"
        dst = assets_dir / dst_name
        print(f"Processing {label}...")
        remove_background(tmp, str(dst))


if __name__ == "__main__":
    main()
