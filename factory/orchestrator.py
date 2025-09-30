"""
Factory Orchestrator.

Coordinates the complete factory pipeline from human spec to working code.
Simple sequential execution with checkpoints.
"""

from pathlib import Path
from typing import Any

from factory.command_agent import CommandAgent
from factory.result import DiscriminationResult, FactoryResult
from factory.state import FactoryState
from factory.tools import DISCRIMINATOR_TOOLS, EXECUTOR_TOOLS


class SoftwareFactory:
    """Orchestrates the LSF software factory pipeline."""

    def __init__(self):
        """Initialize factory with empty state."""
        self.state = FactoryState()

    def _create_agent(self, command_name: str, tools: list[Any] | None = None) -> CommandAgent:
        """
        Create an agent for a specific phase.

        Args:
            command_name: Name of command file (without .md)
            tools: Tools to provide to agent

        Returns:
            CommandAgent configured for this phase
        """
        return CommandAgent(command_name, tools)

    def _get_tools_for_phase(self, phase_name: str) -> list[Any]:
        """
        Get appropriate tools for a phase.

        Args:
            phase_name: Name of the phase

        Returns:
            List of tool instances
        """
        if "discriminate" in phase_name:
            return DISCRIMINATOR_TOOLS
        elif "execute" in phase_name or "check-data-plane" in phase_name:
            return EXECUTOR_TOOLS
        else:
            # Most phases use only agent native capabilities
            return []

    def _execute_phase(self, phase_name: str, context: dict[str, Any]) -> dict[str, Any]:
        """
        Execute a single phase.

        Args:
            phase_name: Name of phase/command to execute
            context: Context dict for this phase

        Returns:
            Phase result dict
        """
        print(f"\n[FACTORY] Executing phase: {phase_name}")

        # Get appropriate tools for this phase
        tools = self._get_tools_for_phase(phase_name)

        # Create agent for this phase
        agent = self._create_agent(phase_name, tools)

        # Execute agent
        result = agent.execute(context)

        # Update state with results
        self.state.current_phase = phase_name
        self.state.artifacts.update(result.output_artifacts)
        self.state.decision_log.extend(result.decision_log)

        # Save checkpoint
        self.state.save()

        print(f"[FACTORY] Phase {phase_name} completed")
        if result.output_artifacts:
            print(f"[FACTORY] Generated artifacts: {list(result.output_artifacts.keys())}")

        return {
            "success": True,
            "artifacts": result.output_artifacts,
            "metadata": result.metadata
        }

    def run(self, human_spec_path: Path) -> FactoryResult:
        """
        Execute complete factory pipeline.

        Args:
            human_spec_path: Path to human specification

        Returns:
            FactoryResult with success/failure and artifacts
        """
        print(f"[FACTORY] Starting factory run for: {human_spec_path}")

        try:
            # 1. Load spec
            self.state.load_human_spec(human_spec_path)

            # 2. Spec to requirements
            result = self._execute_phase("spec-to-requirements", {
                "input_file": human_spec_path,
                "codebase_root": Path.cwd(),
                "architecture_boundaries": Path(".lsf/memory/architecture-boundaries.md")
            })

            # Check for requirements and test-cases artifacts
            requirements_path = self.state.artifacts.get("requirements.md")
            test_cases_path = self.state.artifacts.get("test-cases.md")

            if not requirements_path or not test_cases_path:
                return FactoryResult.failed(
                    "spec-to-requirements",
                    "Failed to generate requirements.md or test-cases.md"
                )

            # 3. Discriminate layer 2
            result = self._execute_phase("discriminate-layer2", {
                "requirements_file": requirements_path,
                "test_cases_file": test_cases_path
            })

            # Check if discrimination passed
            # TODO: Parse discrimination result properly
            # For now, assume it passed if no exception

            # 4. Complexity gate
            result = self._execute_phase("complexity-gate", {
                "requirements_file": requirements_path,
                "test_cases_file": test_cases_path,
                "codebase_root": Path.cwd()
            })

            # Determine path (TDD or SEED) from result
            # TODO: Parse gate recommendation from agent result
            # For now, default to TDD
            path_mode = result.get("metadata", {}).get("recommendation", "TDD")
            self.state.path_mode = path_mode
            self.state.save()

            print(f"\n[FACTORY] Complexity gate recommends: {path_mode} path")

            if path_mode == "SEED":
                return self._execute_seed_path()
            else:
                return self._execute_tdd_path()

        except Exception as e:
            print(f"\n[FACTORY] Error during execution: {e}")
            import traceback
            traceback.print_exc()
            return FactoryResult.failed(
                self.state.current_phase,
                str(e)
            )

    def _execute_tdd_path(self) -> FactoryResult:
        """Execute TDD path: requirements → red → green → execute."""
        print("\n[FACTORY] Executing TDD path")

        try:
            requirements_path = self.state.artifacts.get("requirements.md")
            test_cases_path = self.state.artifacts.get("test-cases.md")
            data_plane_target = self.state.artifacts.get("data-plane-target.yaml")

            # 5a. Requirements to red
            result = self._execute_phase("requirements-to-red", {
                "requirements_file": requirements_path,
                "test_cases_file": test_cases_path,
                "data_plane_target": data_plane_target
            })

            red_phase_path = self.state.artifacts.get("red-phase.md")
            if not red_phase_path:
                return FactoryResult.failed("requirements-to-red", "Failed to generate red-phase.md")

            # 5b. Discriminate red
            result = self._execute_phase("discriminate-red", {
                "red_phase_file": red_phase_path
            })

            # 5c. Red to green
            result = self._execute_phase("red-to-green", {
                "red_phase_file": red_phase_path,
                "data_plane_target": data_plane_target,
                "architecture_boundaries": Path(".lsf/memory/architecture-boundaries.md")
            })

            green_phase_path = self.state.artifacts.get("green-phase.md")
            if not green_phase_path:
                return FactoryResult.failed("red-to-green", "Failed to generate green-phase.md")

            # 5d. Discriminate green
            result = self._execute_phase("discriminate-green", {
                "green_phase_file": green_phase_path
            })

            # 5e. Execute red (generate failing tests)
            result = self._execute_phase("execute-red", {
                "red_phase_file": red_phase_path
            })

            # 5f. Execute green (implement to pass tests)
            result = self._execute_phase("execute-green", {
                "green_phase_file": green_phase_path,
                "data_plane_target": data_plane_target
            })

            # 6. Check data plane alignment (if data-plane-target exists)
            if data_plane_target:
                data_plane_current = self.state.artifacts.get("data-plane-current.yaml")
                if data_plane_current:
                    result = self._execute_phase("check-data-plane", {
                        "target": data_plane_target,
                        "current": data_plane_current
                    })

            # Success!
            print("\n[FACTORY] TDD path completed successfully")
            return FactoryResult.succeeded(
                artifacts=self.state.artifacts,
                decision_log=self.state.decision_log
            )

        except Exception as e:
            print(f"\n[FACTORY] Error in TDD path: {e}")
            import traceback
            traceback.print_exc()
            return FactoryResult.failed(self.state.current_phase, str(e))

    def _execute_seed_path(self) -> FactoryResult:
        """Execute Seed path: seed → extract-tests → verify."""
        print("\n[FACTORY] Executing SEED path")

        try:
            requirements_path = self.state.artifacts.get("requirements.md")

            # 5a. Seed implementation
            result = self._execute_phase("seed-implementation", {
                "requirements_file": requirements_path,
                "architecture_boundaries": Path(".lsf/memory/architecture-boundaries.md"),
                "codebase_root": Path.cwd()
            })

            seeded_files = result.get("artifacts", {})

            # 5b. Extract tests from implementation
            result = self._execute_phase("extract-tests", {
                "implementation_files": list(seeded_files.values()),
                "requirements_file": requirements_path
            })

            # 5c. Verify tests pass
            # TODO: Run tests using bash
            print("[FACTORY] Seed path test verification not yet implemented")

            # 6. Check data plane (if applicable)
            data_plane_target = self.state.artifacts.get("data-plane-target.yaml")
            if data_plane_target:
                # Generate current data plane
                result = self._execute_phase("check-data-plane", {
                    "target": data_plane_target
                })

            # Success!
            print("\n[FACTORY] SEED path completed successfully")
            return FactoryResult.succeeded(
                artifacts=self.state.artifacts,
                decision_log=self.state.decision_log
            )

        except Exception as e:
            print(f"\n[FACTORY] Error in SEED path: {e}")
            import traceback
            traceback.print_exc()
            return FactoryResult.failed(self.state.current_phase, str(e))
