"""
State management for factory runs.

Tracks current phase, artifacts, and decision log across factory execution.
Supports checkpointing and resuming interrupted runs.
"""

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal


@dataclass
class FactoryState:
    """Persistent state across factory run."""

    current_phase: str = "spec-to-requirements"
    """Current phase being executed"""

    path_mode: Literal["TDD", "SEED"] = "TDD"
    """Execution path: TDD or SEED"""

    artifacts: dict[str, Path] = field(default_factory=dict)
    """All artifacts generated so far"""

    decision_log: list[dict[str, Any]] = field(default_factory=list)
    """Complete decision log from all phases"""

    human_spec: Path | None = None
    """Path to human specification being processed"""

    STATE_FILE = Path(".lsf/factory-state/current-run.json")
    """Location of persisted state"""

    def load_human_spec(self, spec_path: Path) -> None:
        """Load human specification and add to artifacts."""
        self.human_spec = spec_path
        self.artifacts["human-spec.md"] = spec_path

    def add_artifact(self, name: str, path: Path) -> None:
        """Add an artifact to state."""
        self.artifacts[name] = path

    def add_decision(self, phase: str, decision: str, details: dict[str, Any] | None = None) -> None:
        """Add a decision to the log."""
        entry = {
            "phase": phase,
            "decision": decision,
            "details": details or {}
        }
        self.decision_log.append(entry)

    def save(self) -> None:
        """Persist state to disk."""
        self.STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

        state_dict = {
            "current_phase": self.current_phase,
            "path_mode": self.path_mode,
            "artifacts": {k: str(v) for k, v in self.artifacts.items()},
            "decision_log": self.decision_log,
            "human_spec": str(self.human_spec) if self.human_spec else None
        }

        self.STATE_FILE.write_text(json.dumps(state_dict, indent=2))

    @classmethod
    def load(cls) -> "FactoryState":
        """Resume from saved state."""
        if not cls.STATE_FILE.exists():
            return cls()

        state_dict = json.loads(cls.STATE_FILE.read_text())

        return cls(
            current_phase=state_dict["current_phase"],
            path_mode=state_dict["path_mode"],
            artifacts={k: Path(v) for k, v in state_dict["artifacts"].items()},
            decision_log=state_dict["decision_log"],
            human_spec=Path(state_dict["human_spec"]) if state_dict["human_spec"] else None
        )
