# Image Naming Standard

This repository uses directory paths to express content meaning and file names to express role and sequence.

## Rules

- Use lowercase letters only.
- Use digits only where numbering is needed.
- Use hyphen `-` as the only separator.
- Do not use spaces.
- Do not use Chinese characters in image file names.
- Do not use underscores.

## Directory Semantics

- Category and record identity belong in the directory path.
- File names only describe asset role and sequence inside that directory.

Examples:

- `images/works/work-001/cover-01.webp`
- `images/exhibitions/exhibition-004/detail-01.webp`
- `images/news/news-005/detail-03.webp`

## Canonical Patterns

### Content Images

Use these names inside `works`, `exhibitions`, and `news` item folders:

- `cover-01.webp`
- `detail-01.webp`
- `detail-02.webp`
- `detail-03.webp`

If a folder contains a non-gallery support image that is still intentionally kept, use:

- `asset-01.webp`
- `reference-01.png`

### Brand, Home, and About Images

Use role-based names with numeric suffixes:

- `seal-01.webp`
- `signature-01.webp`
- `hero-01.webp`
- `about-portrait-01.webp`

Preview or process variants must still carry a numeric suffix:

- `seal-preview-01.webp`
- `signature-preview-01.webp`
- `signature-raw-01.webp`
- `seal-process-01.webp`

### Thumbnails

Thumbnail files must use the same base file name as their source image.

Examples:

- source: `images/works/work-001/cover-01.webp`
- thumbnail: `images/thumbnails/works/work-001/cover-01.webp`

## Numbering Rules

- Content item directories such as `work-001` and `news-014` keep their existing three-digit identifiers.
- Image sequence inside a directory uses two digits: `01`, `02`, `03`.
- Do not skip to mixed widths such as `detail-010.webp` when `detail-10.webp` is sufficient.

## Source Of Truth

- Edit source assets under `images/`.
- Edit path references in `data/*.json` and `data/profile.json`.
- For content managed in `excel/content.xlsx`, keep `cover_image` and `gallery_images` aligned with the same final paths.
- Rebuild `site/` after any path change.
