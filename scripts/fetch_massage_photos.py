#!/usr/bin/env python3
"""Search Bing Images and download real massage photographs into the repository."""
from __future__ import annotations
import argparse, html, mimetypes, re, sys, time
from pathlib import Path
from urllib.parse import quote, unquote, urlparse
import requests

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "images" / "massage"
QUERIES = [
    "Swedish massage therapy professional",
    "deep tissue massage therapist",
    "traditional Thai massage stretching",
    "Shiatsu Japanese massage therapy",
    "Tui Na Chinese traditional massage",
    "Ayurvedic Abhyanga oil massage India",
    "Balinese massage spa treatment",
    "Lomi lomi Hawaiian massage",
    "hot stone massage therapy",
    "aromatherapy essential oil massage",
    "sports massage physiotherapy",
    "reflexology foot massage treatment",
    "head scalp face massage therapy",
    "prenatal pregnancy massage therapist",
    "bamboo massage spa treatment",
    "four hands massage therapy",
    "traditional hammam Moroccan bath massage",
    "traditional Iranian hammam massage",
    "traditional Persian massage therapy",
    "back neck shoulder massage therapy",
    "spa massage treatment room therapist",
    "luxury spa oil massage professional therapist",
    "relaxing back massage spa warm natural light",
    "professional full body massage draped spa treatment",
    "couples spa massage side by side wellness",
    "aromatherapy massage oil treatment elegant spa",
    "hot towel massage therapy wellness studio",
    "massage therapist hands oil treatment close up",
    "luxury resort spa massage treatment room",
    "relaxing shoulder neck massage wellness spa",
    "Thai massage traditional spa treatment",
    "Balinese spa massage oil treatment",
    "stone therapy massage professional spa",
    "foot reflexology massage luxury spa",
    "face and head massage spa treatment",
    "professional massage therapist wellness studio",
    "natural light spa massage treatment",
    "premium wellness massage oil treatment",
    "therapeutic massage studio neutral linens",
    "spa treatment with towels and essential oils",
]
HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36"}
SESSION = requests.Session()
SESSION.headers.update(HEADERS)

def image_urls(query: str) -> list[str]:
    url = "https://www.bing.com/images/search?q=" + quote(query) + "&form=HDRSC3"
    try:
        response = SESSION.get(url, timeout=20)
        response.raise_for_status()
        body = html.unescape(response.text)
    except requests.RequestException as exc:
        print(f"Search failed for {query!r}: {exc}", file=sys.stderr)
        return []
    found = []
    # Bing embeds original image URLs in the murl field of image result records.
    for raw in re.findall(r'"murl"\s*:\s*"((?:\\.|[^"\\])*)"', body):
        candidate = raw.replace(r"\/", "/").replace(r"\u0026", "&")
        candidate = bytes(candidate, "utf-8").decode("unicode_escape") if r"\u" in candidate else candidate
        candidate = html.unescape(candidate).strip()
        if candidate.startswith(("https://", "http://")):
            found.append(candidate)
    # Fallback for alternate Bing HTML markup.
    if not found:
        for raw in re.findall(r'murl.{0,30}?(https?://[^"\\\s<>]+)', body):
            candidate = raw.replace("&amp;", "&").rstrip("),")
            if candidate.startswith(("https://", "http://")):
                found.append(candidate)
    return list(dict.fromkeys(found))

def download(url: str, path: Path) -> bool:
    try:
        with SESSION.get(url, timeout=25, stream=True, allow_redirects=True) as response:
            if response.status_code != 200:
                return False
            content_type = response.headers.get("Content-Type", "").split(";")[0].lower()
            if not content_type.startswith("image/") or any(x in content_type for x in ("svg", "gif")):
                return False
            length = int(response.headers.get("Content-Length", "0") or 0)
            if length > 15_000_000:
                return False
            data = bytearray()
            for chunk in response.iter_content(64 * 1024):
                if chunk:
                    data.extend(chunk)
                    if len(data) > 15_000_000:
                        return False
            if len(data) < 8_000:
                return False
            signature = bytes(data[:16])
            if not (signature.startswith(b"\xff\xd8\xff") or signature.startswith(b"\x89PNG\r\n\x1a\n") or signature.startswith(b"RIFF") and signature[8:12] == b"WEBP" or signature.startswith(b"\x00\x00\x00") and b"ftypavif" in data[:32]):
                return False
            ext = ".png" if signature.startswith(b"\x89PNG") else ".webp" if signature.startswith(b"RIFF") and signature[8:12] == b"WEBP" else ".avif" if b"ftypavif" in data[:32] else ".jpg"
            actual_path = path.with_suffix(ext)
            actual_path.write_bytes(data)
            return True
    except (requests.RequestException, OSError, ValueError):
        return False

def write_index() -> None:
    import json
    files = sorted((p for p in DEST.glob("photo-*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}), key=lambda p: int(re.search(r"photo-(\\d+)", p.stem).group(1)))
    (DEST / "gallery-index.json").write_text(json.dumps([p.name for p in files], ensure_ascii=False, indent=2), encoding="utf-8")

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=70)
    parser.add_argument("--replace", action="store_true")
    args = parser.parse_args()
    target = max(1, min(args.count, 170))
    DEST.mkdir(parents=True, exist_ok=True)
    if args.replace:
        for old in DEST.glob("photo-*"):
            if old.is_file():
                old.unlink()
    existing = sorted(DEST.glob("photo-*"))
    target_new = max(0, target - len(existing))
    if target_new == 0:
        write_index()
        print(f"Already have {len(existing)} photos; target is {target}. Nothing to download.")
        return 0
    next_index = max([int(m.group(1)) for p in existing if (m := re.match(r"photo-(\d+)", p.stem))] + [0]) + 1
    saved = 0
    seen = set()
    for query in QUERIES:
        print(f"Searching: {query}")
        for url in image_urls(query):
            if saved >= target_new:
                break
            if url in seen:
                continue
            seen.add(url)
            # Download into a temporary path; extension is selected from verified image bytes.
            placeholder = DEST / f"photo-{next_index + saved:03d}.tmp"
            if download(url, placeholder):
                final = next(p for p in DEST.glob(placeholder.stem + ".*") if p.suffix != ".tmp")
                print(f"Saved {final.relative_to(ROOT)} ({final.stat().st_size:,} bytes)")
                saved += 1
                time.sleep(0.15)
            try:
                placeholder.unlink(missing_ok=True)
            except OSError:
                pass
        if saved >= target_new:
            break
    write_index()
    print(f"Finished: downloaded {saved} photo(s); requested total {target}; existing {len(existing)}; added {saved}.")
    if saved == 0:
        print("Bing image search returned no downloadable photos; inspect the log before retrying.", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
