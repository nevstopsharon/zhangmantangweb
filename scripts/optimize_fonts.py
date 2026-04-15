from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


BASE_TEXT = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789"
    " .,;:!?\"'()[]{}<>+-–—/&@#%*"
    "首页作品展览新闻关于联系搜索筛选年份返回下一页上一页查看全部精选详情城市邮箱回复时间"
    "Based in Email Response Home Works Exhibitions News About Search"
)


FONT_MAP = {
    "sans_light": "Noto_Sans_SC/static/NotoSansSC-Light.ttf",
    "serif_light": "Noto_Serif_SC/static/NotoSerifSC-Light.ttf",
}


def iter_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for nested in value.values():
            yield from iter_strings(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from iter_strings(nested)


def collect_text(data_dir: Path, extra_text: str = "") -> str:
    pieces = [BASE_TEXT, extra_text]
    for json_file in sorted(data_dir.glob("*.json")):
        data = json.loads(json_file.read_text(encoding="utf-8"))
        pieces.extend(iter_strings(data))
    chars = sorted(set("".join(pieces)))
    return "".join(chars)


def run_subset(source_font: Path, output_font: Path, text: str) -> None:
    output_font.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "pyftsubset",
        str(source_font),
        f"--output-file={output_font}",
        "--flavor=woff2",
        f"--text={text}",
        "--layout-features=*",
        "--passthrough-tables",
        "--desubroutinize",
    ]
    subprocess.run(cmd, check=True)


def write_css(output_dir: Path) -> None:
    css = """@font-face {
  font-family: 'Noto Sans SC';
  src: url('./noto-sans-sc-light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Noto Serif SC';
  src: url('./noto-serif-sc-light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
"""
    (output_dir / "fonts.css").write_text(css, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate minimal WOFF2 web fonts from local Noto font files.")
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--extra-text", default="", help="Extra characters to force-include in the subset.")
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    data_dir = repo_root / "data"
    fonts_root = repo_root / "site" / "assets" / "fonts"
    output_dir = fonts_root / "web"

    text = collect_text(data_dir, extra_text=args.extra_text)

    outputs = {
        "sans_light": output_dir / "noto-sans-sc-light.woff2",
        "serif_light": output_dir / "noto-serif-sc-light.woff2",
    }

    for key, relative_path in FONT_MAP.items():
        run_subset(fonts_root / relative_path, outputs[key], text)

    write_css(output_dir)
    print(f"Generated fonts in: {output_dir}")


if __name__ == "__main__":
    main()
