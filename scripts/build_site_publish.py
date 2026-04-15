from __future__ import annotations

import argparse
import shutil
from pathlib import Path

import generate_static_route_shells as generator


ROUTE_OUTPUTS = [
    "about",
    "en",
    "exhibitions",
    "news",
    "search",
    "works",
    "index.html",
    "robots.txt",
    "sitemap.xml",
]

RUNTIME_DIRECTORIES = [
    "data",
    "images",
]


def remove_path(path: Path) -> None:
    if path.is_dir():
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()


def rebuild_route_shells(repo_root: Path, site_dir: Path) -> None:
    data_dir = repo_root / "data"
    profile = generator.read_json(data_dir / "profile.json")
    works = generator.read_json(data_dir / "works.json")
    exhibitions = generator.read_json(data_dir / "exhibitions.json")
    news = generator.read_json(data_dir / "news.json")
    routes = generator.collect_routes(works, exhibitions, news)

    for output in ROUTE_OUTPUTS:
        remove_path(site_dir / output)

    for lang in ("zh", "en"):
        for route in routes:
            metadata = generator.metadata_for_route(route, lang, profile, works, exhibitions, news)
            generator.write_page(site_dir, route, lang, metadata, works, exhibitions, news)

    generator.write_robots(site_dir)
    generator.write_sitemap(site_dir, routes)


def sync_runtime_directories(repo_root: Path, site_dir: Path) -> None:
    for directory_name in RUNTIME_DIRECTORIES:
        source = repo_root / directory_name
        target = site_dir / directory_name
        remove_path(target)
        shutil.copytree(source, target)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a self-contained publish directory in site/.")
    parser.add_argument("--repo-root", type=Path, required=True)
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    site_dir = repo_root / "site"
    site_dir.mkdir(parents=True, exist_ok=True)

    rebuild_route_shells(repo_root, site_dir)
    sync_runtime_directories(repo_root, site_dir)

    print(f"Built publish output in {site_dir}")


if __name__ == "__main__":
    main()
