#!/usr/bin/env python3
"""Build the complete production site."""

import subprocess
from pathlib import Path

from build_visualizations import build_all
from validate_metadata import validate_all

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    directories = validate_all()
    print(f"Metadata valid ({len(directories)} visualization(s)).")
    outputs = build_all(directories)
    print(f"Visualization build complete ({len(outputs)} visualization(s)).")
    subprocess.run(["zensical", "build", "--clean"], cwd=ROOT, check=True)
    print("Production site built at site/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
