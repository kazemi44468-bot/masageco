#!/usr/bin/env python3
"""Download massage-only photos; commit verified, relevant image-search results safely."""
from __future__ import annotations
import argparse, html, mimetypes, re, sys, time
from pathlib import Path
from urllib.parse import quote, unquote, urlparse
import requests

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "images" / "massage"
QUERIES = [
    '"sensual oil massage spa treatment adult" -illustration',
    '"luxury full body oil massage professional therapist client" photo',
    '"relaxing full body massage warm candlelight spa" photo',
    '"bare shoulder back massage oil treatment spa" photo',
    '"massage therapist applying oil to back close up" real photo',
    '"premium spa massage draped client natural skin texture" photo',
    '"Balinese full body massage luxury resort spa" photo',
    '"aromatherapy massage warm light professional treatment" photo',
    '"couples massage luxury spa treatment room" photo',
    '"romantic spa couples massage adults wellness" photo',
    '"sensory relaxation massage spa oil treatment" photo',
    '"professional massage therapist oil massage back shoulders" photo',
    '"massage with warm oil closeup hands on skin" spa photo',
    '"full body massage treatment professional spa linens" photo',
    '"luxury spa massage treatment natural photography" photo',
    '"Swedish massage therapist client treatment photo"',
    '"deep tissue massage therapy" therapist client photo',
    '"Thai massage therapy" therapist client photo',
    '"Shiatsu massage treatment" therapist client photo',
    '"sports massage therapist" athlete treatment photo',
    '"foot reflexology massage" therapist client photo',
    '"hot stone massage treatment" therapist client photo',
    '"aromatherapy oil massage" therapist client photo',
    '"head scalp massage therapy" therapist client photo',
    '"neck shoulder massage therapy" therapist client photo',
    '"back massage treatment" spa therapist photo',
    '"full body massage therapy" professional therapist draped client photo',
    '"prenatal massage therapy" professional therapist photo',
    '"bamboo massage therapy" spa treatment photo',
    '"four hands massage therapy" professional spa photo',
    '"Balinese massage therapy" therapist client photo',
    '"Ayurvedic Abhyanga massage" oil treatment photo',
    '"Lomi Lomi massage therapy" therapist client photo',
    '"traditional hammam massage treatment" photo',
    '"massage therapist hands applying oil" client back photo',
    '"massage table treatment room" professional spa photo',
    '"couples massage spa treatment" professional photo',
    '"massage therapy clinic" therapist treatment photo',
    '"myofascial release massage therapy" therapist client photo',
    '"trigger point massage therapy" physiotherapy photo',
    '"lymphatic drainage massage" therapist client photo',
    '"relaxation massage treatment" professional therapist photo',
    '"shoulder massage treatment" spa therapist photo',
    '"leg massage therapy" professional therapist photo',
    '"hand massage treatment" spa therapist photo',
    '"facial massage treatment" professional spa photo',
    '"traditional Persian massage" therapy photo',
    '"massage therapist demonstrating technique" training photo',
    '"massage therapy oil and hands" real treatment photo',
    "\"professional massage therapist working on client back\" photography",
    "\"relaxing massage at boutique wellness spa\" photo",
    "\"luxury spa treatment massage client lying face down\" photography",
    "\"oil massage therapist hands shoulders close up\" photography",
    "\"wellness resort massage treatment natural light\" photo",
    "\"spa massage treatment detail hands back\" professional photography",
    "\"massage therapy room neutral linen wood interior\" photo",
    "\"deep tissue back massage therapist hands closeup\" photography",
    "\"Swedish massage session spa professional photography\" photo",
    "\"Thai yoga massage therapist stretching client\" photography",
    "\"hot stone back massage spa treatment closeup\" photo",
    "\"reflexology foot massage professional treatment\" photography",
    "\"head massage spa treatment close up hands\" photo",
    "\"neck shoulder massage therapist treatment\" photography",
    "\"sports recovery massage therapist athlete\" photo",
    "\"physiotherapy manual massage treatment clinic\" photography",
    "\"lymphatic drainage massage professional treatment\" photo",
    "\"aromatherapy massage oil hands warm light\" photography",
    "\"couples spa massage two massage tables\" photo",
    "\"massage therapist applying lotion back treatment\" photo",
    "\"wellness spa massage stones towels candles\" photography",
    "\"massage therapy professional hands on upper back\" photo",
    "\"relaxation massage treatment room natural textures\" photography",
    "\"spa therapist foot massage treatment close up\" photo",
    "\"facial massage therapist hands treatment\" photography",
    "\"bamboo massage spa therapist treatment\" photo",
    "\"Ayurvedic oil massage Abhyanga treatment\" photography",
    "\"Balinese spa massage therapist client\" professional photo",
    "\"Lomi Lomi massage treatment therapist\" photography",
    "\"four hand massage treatment luxury spa\" photo",
    "\"prenatal pregnancy massage professional spa\" photo",
    "\"myofascial release therapist treatment\" professional photography",
    "\"trigger point massage physiotherapist hands\" photo",
    "\"massage training therapist demonstrating technique\" photo",
    "\"professional massage table clean spa linens\" photography",
    "\"warm oil massage back spa closeup\" photo",
    "\"massage therapist preparing massage table spa\" photo",
    "\"massage therapist using forearm deep tissue technique\" photo",
    "\"professional body massage spa treatment high resolution\" photo",
    "\"massage wellness treatment hands and shoulders\" photography",
    "\"therapeutic back massage spa room\" photo",
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
    # Require massage-related metadata from the image result itself; do not accept
    # every file that merely happens to have an image MIME type.
    records = re.finditer(r'"murl"\s*:\s*"((?:\\.|[^"\\])*)"', body)
    relevant = re.compile(r"massage|masseur|masseuse|reflexology|shiatsu|abhyanga|lomi.?lomi|hammam|myofascial|trigger.?point", re.I)
    irrelevant = re.compile(r"massage chair|massage gun|massage device|massage machine|massage oil bottle|logo|icon|illustration|cartoon|diagram|stock photo watermark|porn|sexual intercourse|explicit nude", re.I)
    for match in records:
        # Bing places the result title and description close to murl in its result JSON.
        context = body[max(0, match.start()-900):min(len(body), match.end()+1300)]
        title_match = re.search(r'"t"\s*:\s*"((?:\\.|[^"\\])*)"', context)
        desc_match = re.search(r'"desc"\s*:\s*"((?:\\.|[^"\\])*)"', context)
        title = html.unescape(title_match.group(1)) if title_match else ""
        desc = html.unescape(desc_match.group(1)) if desc_match else ""
        metadata = f"{title} {desc}"
        if not relevant.search(metadata) or irrelevant.search(metadata):
            continue
        candidate = match.group(1).replace(r"\/", "/").replace(r"\u0026", "&")
        candidate = html.unescape(candidate).strip()
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
    files = sorted((p for p in DEST.glob("photo-*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}), key=lambda p: int(re.search(r"photo-(\d+)", p.stem).group(1)))
    (DEST / "gallery-index.json").write_text(json.dumps([p.name for p in files], ensure_ascii=False, indent=2), encoding="utf-8")

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=170)
    parser.add_argument("--replace", action="store_true")
    args = parser.parse_args()
    target = max(1, min(args.count, 170))
    DEST.mkdir(parents=True, exist_ok=True)
    if args.replace:
        for old in DEST.glob("photo-*"):
            if old.is_file():
                old.unlink()
    existing = sorted((p for p in DEST.glob("photo-*") if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}), key=lambda p: int(re.search(r"photo-(\d+)", p.stem).group(1)))
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
