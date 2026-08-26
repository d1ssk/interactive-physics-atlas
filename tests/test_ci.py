from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FULL_SHA = re.compile(r"[0-9a-f]{40}")


def test_external_github_actions_are_pinned_to_full_commit_shas() -> None:
    workflow = (ROOT / ".github" / "workflows" / "ci-pages.yml").read_text(encoding="utf-8")
    external_actions: list[tuple[str, str]] = []

    for line in workflow.splitlines():
        match = re.match(r"\s*uses:\s*([^@\s]+)@([^\s#]+)", line)
        if match and not match.group(1).startswith("./"):
            external_actions.append((match.group(1), match.group(2)))

    assert external_actions
    assert all(FULL_SHA.fullmatch(revision) for _, revision in external_actions)
