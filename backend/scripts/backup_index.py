"""CLI: zip the current (or named) index version into vectorstore/backups/."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings  # noqa: E402
from app.rag.index_versions import backup_version, list_versions  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Backup a vector index version to zip")
    parser.add_argument(
        "--version",
        default=None,
        help="Version id (default: current)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List versions and exit",
    )
    args = parser.parse_args()

    settings = get_settings()
    settings.apply_hf_env()

    if args.list:
        data = list_versions(settings)
        print(f"current={data.get('current')}")
        for item in data.get("versions", []):
            marker = "*" if item.get("is_current") else " "
            print(f" {marker} {item['version']} chunks={item.get('chunk_count')}")
        return 0

    try:
        path = backup_version(version=args.version, settings=settings)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}")
        return 1

    print(f"Wrote backup {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
