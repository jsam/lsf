"""
Factory CLI.

Command-line interface for running the software factory.
"""

import sys
from pathlib import Path

import click

from factory.orchestrator import SoftwareFactory


@click.group()
def cli():
    """LSF Software Factory - Automated software production."""
    pass


@cli.command()
@click.argument("human_spec", type=click.Path(exists=True, path_type=Path))
@click.option("--debug", is_flag=True, help="Show detailed agent conversations")
def run(human_spec: Path, debug: bool):
    """
    Execute complete factory pipeline from human spec to working code.

    HUMAN_SPEC: Path to human specification file (e.g., specs/human-spec-feature.md)
    """
    if debug:
        print("[DEBUG] Debug mode enabled")

    # Run factory
    factory = SoftwareFactory()
    result = factory.run(human_spec)

    # Display results
    print("\n" + "=" * 70)

    if result.success:
        print("✅ FACTORY RUN COMPLETED SUCCESSFULLY")
        print(f"\nMessage: {result.message}")

        if result.artifacts:
            print(f"\nGenerated artifacts ({len(result.artifacts)}):")
            for name, path in result.artifacts.items():
                print(f"  - {name}: {path}")

        if result.decision_log:
            print(f"\nDecisions made: {len(result.decision_log)}")
            if debug:
                for i, decision in enumerate(result.decision_log, 1):
                    print(f"\n  {i}. Phase: {decision.get('phase')}")
                    print(f"     Decision: {decision.get('decision')}")

        sys.exit(0)
    else:
        print("❌ FACTORY RUN FAILED")
        print(f"\nBlocked at phase: {result.blocked_phase}")
        print(f"Message: {result.message}")

        if result.violations:
            print(f"\nViolations ({len(result.violations)}):")
            for v in result.violations:
                severity_icon = {
                    "critical": "🚨",
                    "error": "❌",
                    "warning": "⚠️ "
                }.get(v.severity, "•")

                print(f"\n  {severity_icon} [{v.severity.upper()}] {v.principle}")
                print(f"     Location: {v.location}")
                print(f"     Issue: {v.description}")
                print(f"     Fix: {v.suggestion}")

        sys.exit(1)


@cli.command()
def status():
    """Show current factory state."""
    from factory.state import FactoryState

    try:
        state = FactoryState.load()

        print("\n" + "=" * 70)
        print("FACTORY STATE")
        print("=" * 70)

        print(f"\nCurrent phase: {state.current_phase}")
        print(f"Path mode: {state.path_mode}")
        print(f"Human spec: {state.human_spec}")

        if state.artifacts:
            print(f"\nArtifacts generated ({len(state.artifacts)}):")
            for name, path in state.artifacts.items():
                exists = "✓" if path.exists() else "✗"
                print(f"  {exists} {name}: {path}")

        if state.decision_log:
            print(f"\nDecisions: {len(state.decision_log)}")

    except FileNotFoundError:
        print("No factory state found. Run 'factory run' to start a factory run.")
        sys.exit(1)


def main():
    """Main entry point."""
    cli()


if __name__ == "__main__":
    main()
