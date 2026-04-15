from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}


def build_webp_path(source: Path) -> Path:
    return source.with_suffix(".webp")


def build_thumbnail_path(source: Path, thumbnail_root: Path) -> Path:
    parts = list(source.parts)
    if "images" in parts:
        images_index = parts.index("images")
        relative = Path(*parts[images_index + 1 :]).with_suffix(".webp")
        return thumbnail_root / relative
    return thumbnail_root / source.with_suffix(".webp").name


def resize_image(image: Image.Image, max_width: int) -> Image.Image:
    if image.width <= max_width:
        return image
    ratio = max_width / image.width
    return image.resize((max_width, int(image.height * ratio)), Image.LANCZOS)


def save_webp(source: Path, output: Path, max_width: int, quality: int) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img = resize_image(img, max_width)
        img.save(output, format="WEBP", quality=quality, method=6)


def compress_directory(images_root: Path, thumbnail_root: Path, max_width: int, thumb_width: int, quality: int) -> int:
    count = 0
    for source in images_root.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        if thumbnail_root in source.parents:
            continue
        if source.name.lower() == "readme.txt":
            continue

        target = build_webp_path(source)
        save_webp(source, target, max_width=max_width, quality=quality)

        thumb_target = build_thumbnail_path(source, thumbnail_root)
        save_webp(source, thumb_target, max_width=thumb_width, quality=quality)
        count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Compress images to WebP and generate thumbnails.")
    parser.add_argument("--images-root", type=Path, required=True, help="Root images directory.")
    parser.add_argument("--thumbnail-root", type=Path, help="Thumbnail output directory. Defaults to <images-root>/thumbnails.")
    parser.add_argument("--max-width", type=int, default=1920, help="Max width for full-size outputs.")
    parser.add_argument("--thumb-width", type=int, default=480, help="Max width for thumbnails.")
    parser.add_argument("--quality", type=int, default=82, help="WebP quality, 0-100.")
    args = parser.parse_args()

    thumbnail_root = args.thumbnail_root or (args.images_root / "thumbnails")
    total = compress_directory(
        images_root=args.images_root.resolve(),
        thumbnail_root=thumbnail_root.resolve(),
        max_width=args.max_width,
        thumb_width=args.thumb_width,
        quality=args.quality,
    )
    print(f"Processed {total} image(s).")


if __name__ == "__main__":
    main()
