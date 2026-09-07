#!/usr/bin/env python3
"""Run repository-wide completion checks with concise terminal output."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import time
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = ROOT / "build" / "validation-logs"
DEFAULT_TAIL_LINES = 60


@dataclass(frozen=True, slots=True)
class ValidationCheck:
    """One repository-wide validation command."""

    name: str
    command: tuple[str, ...]


CHECKS = (
    ValidationCheck("ruff-check", ("ruff", "check", ".")),
    ValidationCheck("ruff-format", ("ruff", "format", "--check", ".")),
    ValidationCheck("pytest", ("pytest", "-q")),
    ValidationCheck(
        "metadata",
        (sys.executable, "scripts/validate_metadata.py"),
    ),
    ValidationCheck(
        "site-build",
        (sys.executable, "scripts/build_site.py"),
    ),
)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--all",
        action="store_true",
        required=True,
        help="run every repository-wide completion check",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="print only the final result unless a check fails",
    )
    parser.add_argument(
        "--tail-lines",
        type=int,
        default=DEFAULT_TAIL_LINES,
        metavar="N",
        help=f"show the final N log lines after a failure (default: {DEFAULT_TAIL_LINES})",
    )
    args = parser.parse_args(argv)
    if args.tail_lines < 1:
        parser.error("--tail-lines must be positive")
    return args


def _write_log(index: int, check: ValidationCheck, output: str) -> Path:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    path = LOG_DIR / f"{index:02d}-{check.name}.log"
    path.write_text(output, encoding="utf-8")
    return path


def _display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def run_checks(
    checks: Sequence[ValidationCheck] = CHECKS,
    *,
    quiet: bool = False,
    tail_lines: int = DEFAULT_TAIL_LINES,
) -> int:
    """Run checks in order, retaining full logs and printing concise results."""

    environment = os.environ.copy()
    environment.update({"NO_COLOR": "1", "PY_COLORS": "0"})
    started = time.monotonic()

    for index, check in enumerate(checks, start=1):
        check_started = time.monotonic()
        try:
            result = subprocess.run(
                check.command,
                cwd=ROOT,
                env=environment,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                check=False,
            )
        except OSError as exc:
            output = f"Could not start {' '.join(check.command)}: {exc}\n"
            log_path = _write_log(index, check, output)
            print(f"Validation failed: {check.name}")
            print(f"Full log: {_display_path(log_path)}")
            print(output.rstrip())
            return 1

        output = result.stdout or ""
        log_path = _write_log(index, check, output)
        elapsed = time.monotonic() - check_started
        if result.returncode != 0:
            print(f"Validation failed: {check.name} (exit {result.returncode})")
            print(f"Command: {' '.join(check.command)}")
            print(f"Full log: {_display_path(log_path)}")
            lines = output.rstrip().splitlines()
            if lines:
                print(f"Last {min(tail_lines, len(lines))} log line(s):")
                print("\n".join(lines[-tail_lines:]))
            return result.returncode
        if not quiet:
            print(f"Passed {check.name} ({elapsed:.1f}s)")

    elapsed = time.monotonic() - started
    print(f"Validation passed ({len(checks)} checks, {elapsed:.1f}s).")
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    """Run the requested validation mode."""

    args = parse_args(argv)
    return run_checks(quiet=args.quiet, tail_lines=args.tail_lines)


if __name__ == "__main__":
    raise SystemExit(main())
