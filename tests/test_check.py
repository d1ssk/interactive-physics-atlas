from __future__ import annotations

import subprocess
from pathlib import Path

import check


def test_completion_checks_cover_the_required_commands() -> None:
    commands = [validation.command for validation in check.CHECKS]

    assert commands == [
        ("ruff", "check", "."),
        ("ruff", "format", "--check", "."),
        ("pytest", "-q"),
        (check.sys.executable, "scripts/validate_metadata.py"),
        (check.sys.executable, "scripts/build_site.py"),
    ]


def test_quiet_success_writes_logs_and_prints_one_summary(
    tmp_path: Path,
    monkeypatch,
    capsys,
) -> None:
    monkeypatch.setattr(check, "ROOT", tmp_path)
    monkeypatch.setattr(check, "LOG_DIR", tmp_path / "build" / "validation-logs")
    validation = check.ValidationCheck("example", ("example-command",))
    calls = []

    def fake_run(command, **kwargs):
        calls.append((command, kwargs))
        return subprocess.CompletedProcess(command, 0, stdout="successful output\n")

    monkeypatch.setattr(check.subprocess, "run", fake_run)

    assert check.run_checks((validation,), quiet=True) == 0
    assert capsys.readouterr().out.startswith("Validation passed (1 checks,")
    assert (check.LOG_DIR / "01-example.log").read_text(encoding="utf-8") == ("successful output\n")
    assert calls[0][1]["cwd"] == tmp_path
    assert calls[0][1]["stderr"] is subprocess.STDOUT


def test_failure_prints_only_log_tail_and_stops(
    tmp_path: Path,
    monkeypatch,
    capsys,
) -> None:
    monkeypatch.setattr(check, "ROOT", tmp_path)
    monkeypatch.setattr(check, "LOG_DIR", tmp_path / "build" / "validation-logs")
    validations = (
        check.ValidationCheck("failing", ("first-command",)),
        check.ValidationCheck("not-run", ("second-command",)),
    )
    output = "\n".join(f"line {index}" for index in range(10)) + "\n"
    calls = []

    def fake_run(command, **kwargs):
        calls.append(command)
        return subprocess.CompletedProcess(command, 3, stdout=output)

    monkeypatch.setattr(check.subprocess, "run", fake_run)

    assert check.run_checks(validations, quiet=True, tail_lines=3) == 3
    terminal = capsys.readouterr().out
    assert "Validation failed: failing (exit 3)" in terminal
    assert "Last 3 log line(s):\nline 7\nline 8\nline 9" in terminal
    assert "line 6" not in terminal
    assert calls == [("first-command",)]
    assert (check.LOG_DIR / "01-failing.log").read_text(encoding="utf-8") == output
