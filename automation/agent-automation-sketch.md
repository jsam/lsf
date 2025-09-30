# Automated Software Factory Concept
## Using Claude Agent SDK + LSF Workflow

## Core Philosophy

**Primary Goal**: Produce and maintain industry-grade software reproducibly
**Secondary Goal**: Token efficiency (only where it doesn't compromise quality)
**Approach**: Reuse existing `.claude/commands/*.md` as agent instructions

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│         Factory Orchestrator (Python + SDK)               │
│  - Loads .claude/commands/*.md as agent instructions      │
│  - Manages state machine transitions                     │
│  - Executes quality gates                                │
│  - Provides tools to agents                              │
└──────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Claude Agent │   │ Claude Agent │   │ Claude Agent │
│ (spec-to-req)│   │ (req-to-red) │   │ (execute)    │
│              │   │              │   │              │
│ Uses existing│   │ Uses existing│   │ Uses existing│
│ command def  │   │ command def  │   │ command def  │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Implementation Strategy

### 1. **Agent = Command File + Tools**

Each `.claude/commands/*.md` becomes an agent instruction:

```python
from anthropic import Anthropic
from pathlib import Path

class CommandAgent:
    """Wraps a Claude command as an executable agent"""

    def __init__(self, command_name: str, tools: list):
        self.command_path = Path(f".claude/commands/{command_name}.md")
        self.instructions = self.command_path.read_text()
        self.client = Anthropic()
        self.tools = tools

    async def execute(self, context: dict) -> AgentResult:
        """Execute the command as an agent conversation"""

        # Build context message from inputs
        user_message = self._build_context_message(context)

        # Run agent with command instructions
        messages = [{"role": "user", "content": user_message}]

        response = self.client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=16000,  # Don't skimp on quality
            system=self.instructions,  # Command file as system prompt
            messages=messages,
            tools=self.tools
        )

        # Handle tool use, iterate until completion
        while response.stop_reason == "tool_use":
            # Execute tools, continue conversation
            tool_results = self._execute_tools(response.content)
            messages.extend([
                {"role": "assistant", "content": response.content},
                {"role": "user", "content": tool_results}
            ])
            response = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=16000,
                system=self.instructions,
                messages=messages,
                tools=self.tools
            )

        return AgentResult(
            output_artifacts=self._extract_artifacts(response),
            decision_log=self._extract_decisions(messages)
        )
```

### 2. **Orchestrator Maps Workflow to Commands**

```python
class SoftwareFactory:
    """Orchestrates the LSF workflow using Claude agents"""

    def __init__(self):
        # Map workflow phases to command files
        self.phase_commands = {
            "spec-to-requirements": "spec-to-requirements.md",
            "discriminate-layer2": "discriminate-layer2.md",
            "complexity-gate": "complexity-gate.md",
            "requirements-to-red": "requirements-to-red.md",
            "discriminate-red": "discriminate-red.md",
            "red-to-green": "red-to-green.md",
            "discriminate-green": "discriminate-green.md",
            "execute-red": "execute-red.md",
            "execute-green": "execute-green.md",
            # Seed path
            "seed-implementation": "seed-implementation.md",
            "extract-tests": "extract-tests.md",
            # Final
            "check-data-plane": "check-data-plane.md",
        }

        # Initialize agents with appropriate tools
        self.agents = self._initialize_agents()

        self.state = FactoryState()

    def _initialize_agents(self) -> dict[str, CommandAgent]:
        """Create agents for each command"""
        agents = {}

        # Transformation agents need read/write/search tools
        transformation_tools = [
            FileReadTool(),
            FileWriteTool(),
            CodeSearchTool(),
            GrepTool(),
            ArchitectureBoundariesTool(),
        ]

        # Discriminators need validation tools
        discriminator_tools = [
            FileReadTool(),
            ConstitutionalValidatorTool(),
            DriftCheckTool(),
            DependencyCheckTool(),
            OverengCheckTool(),
        ]

        # Executors need code generation + execution tools
        executor_tools = [
            FileWriteTool(),
            BashExecuteTool(),
            GitCommitTool(),
            DataPlaneInspectorTool(),
        ]

        # Map commands to tool sets
        for phase, command_file in self.phase_commands.items():
            if "discriminate" in phase:
                tools = discriminator_tools
            elif "execute" in phase:
                tools = executor_tools
            else:
                tools = transformation_tools

            agents[phase] = CommandAgent(
                command_name=command_file.replace(".md", ""),
                tools=tools
            )

        return agents

    async def run(self, human_spec_path: Path) -> FactoryResult:
        """Execute complete factory pipeline"""

        self.state.load_human_spec(human_spec_path)

        # Phase 1: Spec to Requirements
        await self._execute_phase("spec-to-requirements", {
            "input_file": human_spec_path,
            "codebase_root": Path.cwd(),
            "architecture_boundaries": Path(".lsf/memory/architecture-boundaries.md")
        })

        # Phase 2: Discriminate Layer 2
        discrimination_result = await self._execute_phase("discriminate-layer2", {
            "requirements_file": self.state.artifacts["requirements.md"],
            "test_cases_file": self.state.artifacts["test-cases.md"]
        })

        if not discrimination_result.passed:
            return FactoryResult.blocked(
                phase="discriminate-layer2",
                violations=discrimination_result.violations
            )

        # Phase 3: Complexity Gate (branching decision)
        gate_result = await self._execute_phase("complexity-gate", {
            "requirements_file": self.state.artifacts["requirements.md"],
            "test_cases_file": self.state.artifacts["test-cases.md"],
            "codebase_root": Path.cwd()
        })

        if gate_result.recommendation == "SEED":
            return await self._execute_seed_path()
        else:
            return await self._execute_tdd_path()

    async def _execute_tdd_path(self) -> FactoryResult:
        """TDD path: requirements → red → green → execute"""

        # Requirements to Red
        await self._execute_phase("requirements-to-red", {
            "requirements_file": self.state.artifacts["requirements.md"],
            "test_cases_file": self.state.artifacts["test-cases.md"],
            "data_plane_target": self.state.artifacts.get("data-plane-target.yaml")
        })

        # Discriminate Red
        red_discrimination = await self._execute_phase("discriminate-red", {
            "red_phase_file": self.state.artifacts["red-phase.md"]
        })

        if not red_discrimination.passed:
            return FactoryResult.blocked(
                phase="discriminate-red",
                violations=red_discrimination.violations
            )

        # Red to Green
        await self._execute_phase("red-to-green", {
            "red_phase_file": self.state.artifacts["red-phase.md"],
            "data_plane_target": self.state.artifacts.get("data-plane-target.yaml"),
            "architecture_boundaries": Path(".lsf/memory/architecture-boundaries.md")
        })

        # Discriminate Green
        green_discrimination = await self._execute_phase("discriminate-green", {
            "green_phase_file": self.state.artifacts["green-phase.md"]
        })

        if not green_discrimination.passed:
            return FactoryResult.blocked(
                phase="discriminate-green",
                violations=green_discrimination.violations
            )

        # Execute Red (generate failing tests)
        await self._execute_phase("execute-red", {
            "red_phase_file": self.state.artifacts["red-phase.md"]
        })

        # Execute Green (implement to pass tests)
        await self._execute_phase("execute-green", {
            "green_phase_file": self.state.artifacts["green-phase.md"],
            "data_plane_target": self.state.artifacts.get("data-plane-target.yaml")
        })

        # Check data plane alignment
        if "data-plane-target.yaml" in self.state.artifacts:
            data_plane_result = await self._execute_phase("check-data-plane", {
                "target": self.state.artifacts["data-plane-target.yaml"],
                "current": self.state.artifacts.get("data-plane-current.yaml")
            })

            if not data_plane_result.aligned:
                return FactoryResult.incomplete(
                    reason="Data plane misalignment",
                    required_actions=data_plane_result.migration_tasks
                )

        return FactoryResult.success(self.state)

    async def _execute_seed_path(self) -> FactoryResult:
        """Seed path: seed → extract-tests → verify"""

        # Seed Implementation
        await self._execute_phase("seed-implementation", {
            "requirements_file": self.state.artifacts["requirements.md"],
            "architecture_boundaries": Path(".lsf/memory/architecture-boundaries.md"),
            "codebase_root": Path.cwd()
        })

        # Extract Tests from implementation
        await self._execute_phase("extract-tests", {
            "implementation_files": self.state.artifacts["seeded_files"],
            "requirements_file": self.state.artifacts["requirements.md"]
        })

        # Verify tests pass
        verify_result = await self._verify_tests(
            self.state.artifacts["extracted_tests"]
        )

        if not verify_result.all_passed:
            return FactoryResult.failed(
                phase="seed-verification",
                reason="Extracted tests do not pass",
                failing_tests=verify_result.failures
            )

        # Check data plane
        if "data-plane-target.yaml" in self.state.artifacts:
            data_plane_result = await self._execute_phase("check-data-plane", {
                "target": self.state.artifacts["data-plane-target.yaml"],
                "current": self._generate_current_data_plane()
            })

            if not data_plane_result.aligned:
                return FactoryResult.incomplete(
                    reason="Data plane misalignment after seed",
                    required_actions=data_plane_result.migration_tasks
                )

        return FactoryResult.success(self.state)

    async def _execute_phase(self, phase_name: str, context: dict) -> Any:
        """Execute a single phase using its agent"""

        print(f"[FACTORY] Executing phase: {phase_name}")

        agent = self.agents[phase_name]
        result = await agent.execute(context)

        # Update state with artifacts
        self.state.artifacts.update(result.output_artifacts)
        self.state.decision_log.extend(result.decision_log)
        self.state.current_phase = phase_name

        # Persist state
        self.state.save()

        return result
```

### 3. **Tool Implementations**

Each tool the agents need:

```python
class FileReadTool:
    """Read file contents"""
    definition = {
        "name": "read_file",
        "description": "Read contents of a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"}
            },
            "required": ["path"]
        }
    }

    def execute(self, path: str) -> str:
        return Path(path).read_text()

class FileWriteTool:
    """Write file contents"""
    definition = {
        "name": "write_file",
        "description": "Write content to a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["path", "content"]
        }
    }

    def execute(self, path: str, content: str):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(content)
        return f"Written {len(content)} bytes to {path}"

class ConstitutionalValidatorTool:
    """Run constitutional compliance validation"""
    definition = {
        "name": "validate_constitutional_compliance",
        "description": "Validate artifact for constitutional compliance",
        "input_schema": {
            "type": "object",
            "properties": {
                "artifact_path": {"type": "string"},
                "constitution_path": {"type": "string", "default": "specs/constitution/constitution.md"}
            },
            "required": ["artifact_path"]
        }
    }

    def execute(self, artifact_path: str, constitution_path: str = None):
        from .constitutional_validator import ConstitutionalValidator

        validator = ConstitutionalValidator(constitution_path)
        violations = validator.validate_file(artifact_path)

        return {
            "passed": len([v for v in violations if v.severity in ['critical', 'error']]) == 0,
            "violations": [
                {
                    "principle": v.principle,
                    "severity": v.severity,
                    "location": v.location,
                    "description": v.description,
                    "suggestion": v.suggestion
                }
                for v in violations
            ]
        }

class ArchitectureBoundariesTool:
    """Query architecture boundaries"""
    definition = {
        "name": "query_architecture_boundaries",
        "description": "Query which components are allowed for a given use case",
        "input_schema": {
            "type": "object",
            "properties": {
                "use_case": {"type": "string", "description": "e.g., 'authentication', 'data modeling', 'API endpoint'"}
            },
            "required": ["use_case"]
        }
    }

    def execute(self, use_case: str) -> dict:
        boundaries_file = Path(".lsf/memory/architecture-boundaries.md").read_text()

        # Agent can read full file, but this helps focus
        # Parse boundaries and return relevant section
        # (Implementation details...)

        return {
            "allowed_components": [...],
            "decision_tree": "...",
            "examples": [...]
        }

class CodeSearchTool:
    """Search codebase for patterns"""
    definition = {
        "name": "search_code_patterns",
        "description": "Find existing code patterns in codebase",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern_type": {"type": "string", "description": "e.g., 'API view', 'model definition', 'React component'"},
                "keyword": {"type": "string"}
            },
            "required": ["pattern_type"]
        }
    }

    def execute(self, pattern_type: str, keyword: str = None):
        # Use ripgrep, ast parsing, etc. to find examples
        # Return actual code snippets for agent to copy
        pass

class DataPlaneInspectorTool:
    """Inspect current Django models"""
    definition = {
        "name": "inspect_data_plane",
        "description": "Generate current data plane state from Django models",
        "input_schema": {"type": "object", "properties": {}}
    }

    def execute(self):
        """Introspect Django models and generate data-plane-current.yaml"""
        import django
        from django.apps import apps

        django.setup()

        models_data = {}
        for model in apps.get_models():
            fields = {}
            for field in model._meta.get_fields():
                fields[field.name] = {
                    "type": field.__class__.__name__,
                    "nullable": getattr(field, 'null', False),
                }

            models_data[model.__name__] = {
                "fields": fields,
                "app": model._meta.app_label
            }

        import yaml
        return yaml.dump({"models": models_data})
```

### 4. **State Management**

```python
from dataclasses import dataclass, field
from pathlib import Path
import json
from typing import Any

@dataclass
class FactoryState:
    """Persistent state across factory run"""

    current_phase: str = "spec-to-requirements"
    path_mode: str = "TDD"  # or "SEED"
    artifacts: dict[str, Path] = field(default_factory=dict)
    decision_log: list[dict] = field(default_factory=list)
    human_spec: Path | None = None

    STATE_FILE = Path(".lsf/factory-state/current-run.json")

    def load_human_spec(self, spec_path: Path):
        self.human_spec = spec_path
        self.artifacts["human-spec.md"] = spec_path

    def save(self):
        """Persist state to disk"""
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
    def load(cls) -> 'FactoryState':
        """Resume from saved state"""
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
```

### 5. **CLI Interface**

```python
# factory_cli.py
import asyncio
import click
from pathlib import Path
from .orchestrator import SoftwareFactory, FactoryState

@click.group()
def cli():
    """LSF Software Factory - Automated software production"""
    pass

@cli.command()
@click.argument('human_spec', type=click.Path(exists=True))
@click.option('--pause-on-discrimination', is_flag=True, help='Pause for review at each quality gate')
@click.option('--debug', is_flag=True, help='Show detailed agent conversations')
def run(human_spec: str, pause_on_discrimination: bool, debug: bool):
    """Execute complete factory pipeline from human spec to working code"""

    factory = SoftwareFactory()

    if debug:
        factory.enable_debug_logging()

    result = asyncio.run(factory.run(Path(human_spec)))

    if result.success:
        click.echo(click.style("✅ Factory run completed successfully", fg="green"))
        click.echo(f"\nGenerated artifacts:")
        for name, path in result.artifacts.items():
            click.echo(f"  - {name}: {path}")
    else:
        click.echo(click.style(f"❌ Factory run blocked at phase: {result.blocked_phase}", fg="red"))
        click.echo(f"\nViolations:")
        for violation in result.violations:
            click.echo(f"  [{violation.severity}] {violation.principle}: {violation.description}")
            click.echo(f"    Fix: {violation.suggestion}")

@cli.command()
@click.option('--from-phase', help='Resume from specific phase')
def resume(from_phase: str):
    """Resume interrupted factory run"""

    state = FactoryState.load()

    if from_phase:
        state.current_phase = from_phase

    factory = SoftwareFactory()
    factory.state = state

    # Continue from current phase
    result = asyncio.run(factory.continue_run())

    # ... (output handling)

@cli.command()
@click.argument('phase_name')
@click.argument('context_file', type=click.Path(exists=True))
def run_phase(phase_name: str, context_file: str):
    """Run a single phase for testing"""

    factory = SoftwareFactory()

    context = json.loads(Path(context_file).read_text())

    result = asyncio.run(factory._execute_phase(phase_name, context))

    click.echo(json.dumps(result.output_artifacts, indent=2))

if __name__ == '__main__':
    cli()
```

---

## Key Advantages of This Approach

### 1. **Reuses Existing Knowledge**
- All `.claude/commands/*.md` are already battle-tested instructions
- No need to rewrite agent prompts from scratch
- Commands already encode constitutional principles

### 2. **Each Agent Gets Full Context for Quality**
- Not aggressively limiting context to save tokens
- Agents can read entire codebase if needed via tools
- Quality over token optimization (per your guidance)

### 3. **Maintainability**
- Update command file → agent behavior changes automatically
- Clear separation: orchestrator (Python) vs execution (Claude)
- Easy to test individual phases

### 4. **Observability**
- Decision log tracks every agent conversation
- State persistence allows resume from any point
- Debug mode shows full agent reasoning

### 5. **Constitutional Enforcement**
- Commands already include constitutional compliance sections
- Discriminators are first-class agents with validation tools
- Fail-fast prevents waste downstream

### 6. **Extensibility**
- New phases = new command file + tool registration
- Custom tools easy to add
- Can run phases manually for debugging

---

## Directory Structure

```
lsf/
├── factory/
│   ├── __init__.py
│   ├── orchestrator.py          # SoftwareFactory class
│   ├── command_agent.py         # CommandAgent wrapper
│   ├── state.py                 # FactoryState management
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── file_tools.py
│   │   ├── constitutional_validator_tool.py
│   │   ├── architecture_boundaries_tool.py
│   │   ├── code_search_tool.py
│   │   └── data_plane_tools.py
│   └── cli.py                   # Click CLI
├── .claude/commands/            # Existing command files (unchanged)
├── .lsf/
│   ├── factory-state/
│   │   └── current-run.json    # Persistent state
│   └── memory/
│       └── architecture-boundaries.md
└── specs/                       # Generated artifacts
```

---

## Usage Examples

```bash
# Full automated run
python -m factory.cli run specs/human-spec-user-auth.md

# With debugging
python -m factory.cli run specs/human-spec-user-auth.md --debug

# Resume from saved state
python -m factory.cli resume

# Resume from specific phase
python -m factory.cli resume --from-phase=red-to-green

# Test single phase
python -m factory.cli run-phase requirements-to-red context.json
```

---

## Next Steps for Implementation

1. **Core Infrastructure** (Weeks 1-2)
   - Implement `CommandAgent` wrapper
   - Build tool system (file I/O, bash, git)
   - Create `FactoryState` persistence

2. **Basic Pipeline** (Week 3)
   - Wire up spec→requirements→discriminate-layer2
   - Test with simple spec
   - Verify command files work as agent instructions

3. **TDD Path** (Week 4)
   - Add red and green phases
   - Implement execute-red and execute-green
   - Test complete TDD flow

4. **Seed Path** (Week 5)
   - Add complexity-gate decision
   - Implement seed-implementation agent
   - Add extract-tests phase

5. **Quality Assurance** (Week 6)
   - All discriminators wired up
   - Data plane checking
   - End-to-end validation
