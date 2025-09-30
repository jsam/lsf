# Factory Automation Implementation Plan

## Overview
Implementation of automated software factory using Claude Agent SDK based on `agent-automation-sketch.md`.

**Goal**: Reproducible, industry-grade software production through automated agent orchestration.

**Philosophy**: Minimal, focused implementation. Get one feature working end-to-end before adding complexity.

## Key Simplifications vs Original Plan

### What Changed
1. **Removed Tool Abstractions**
   - ❌ Removed: FileReadTool, FileWriteTool, BashTool, GitTool, CodeSearchTool, ArchitectureBoundariesTool
   - ✅ Kept: Only 2 tools (ConstitutionalValidatorTool, DataPlaneInspectorTool)
   - **Why**: Agents already have native bash, read, write capabilities. Tool wrappers add zero value.

2. **Simplified Orchestrator**
   - ❌ Removed: Complex state machine, agent registry, phase routing logic
   - ✅ Kept: Simple sequential execution with if/else branching
   - **Why**: No need for complex state machine to execute commands in order.

3. **Deferred Features**
   - ❌ Removed from MVP: Resume, rollback, metrics, fancy CLI, comprehensive tests
   - ✅ MVP Focus: One spec → working code
   - **Why**: Get one thing working before building infrastructure around it.

4. **Timeline**
   - Original: 6+ weeks
   - Revised: 1.5-2 weeks to MVP
   - **Why**: Removed ~70% of unnecessary complexity

### Alignment with Principles
- ✅ **Minimalism**: Stripped to bare essentials
- ✅ **Reasonable Defaults**: Use agent native capabilities
- ✅ **Context Efficiency**: No wasteful abstractions
- ✅ **Focus**: One goal: get spec → working code pipeline functional
- ✅ **Boundaries**: Clean phase separation maintained
- ✅ **Verification**: Tests still created and run

---

## Phase 1: Core Infrastructure (Foundation)

### 1.1 Project Setup
**Goal**: Bootstrap factory module with dependencies

**Tasks**:
- [ ] Create `factory/` directory structure
  - [ ] `factory/__init__.py`
  - [ ] `factory/orchestrator.py`
  - [ ] `factory/command_agent.py`
  - [ ] `factory/state.py`
  - [ ] `factory/result.py` (result types)
  - [ ] `factory/cli.py`
  - [ ] `factory/tools/__init__.py`

- [ ] Create `pyproject.toml` or update existing with factory dependencies:
  - [ ] `anthropic` (Claude SDK)
  - [ ] `pydantic` (data validation)
  - [ ] `click` (CLI framework)
  - [ ] `pyyaml` (YAML parsing)
  - [ ] `asyncio` (async support)

- [ ] Create `.lsf/factory-state/` directory for runtime state
- [ ] Add `.lsf/factory-state/` to `.gitignore`

**Verification**:
```bash
python -m factory.cli --help  # Should display help
```

**Files Created**:
- `factory/__init__.py`
- `factory/orchestrator.py`
- `factory/command_agent.py`
- `factory/state.py`
- `factory/result.py`
- `factory/cli.py`
- `factory/tools/__init__.py`
- Updated `pyproject.toml`

---

### 1.2 Result Types & Data Models
**Goal**: Define data structures for agent results, state, and violations

**Tasks**:
- [ ] Implement `factory/result.py`:
  - [ ] `AgentResult` dataclass (output_artifacts, decision_log, metadata)
  - [ ] `FactoryResult` dataclass (success, blocked_phase, violations, artifacts)
  - [ ] `DiscriminationResult` dataclass (passed, violations)
  - [ ] `ComplianceViolation` dataclass (principle, severity, location, description, suggestion)

**Verification**: Import and instantiate result types

**Files Modified**:
- `factory/result.py`

---

### 1.3 State Management
**Goal**: Persistent state tracking across factory runs

**Tasks**:
- [ ] Implement `factory/state.py`:
  - [ ] `FactoryState` dataclass with:
    - `current_phase: str`
    - `path_mode: Literal["TDD", "SEED"]`
    - `artifacts: dict[str, Path]`
    - `decision_log: list[dict]`
    - `human_spec: Path | None`
  - [ ] `save()` method → writes to `.lsf/factory-state/current-run.json`
  - [ ] `load()` classmethod → loads from disk
  - [ ] `load_human_spec()` method
  - [ ] `add_artifact()` method
  - [ ] `add_decision()` method

**Verification**:
```python
state = FactoryState()
state.load_human_spec(Path("test.md"))
state.save()
loaded = FactoryState.load()
assert loaded.human_spec == Path("test.md")
```

**Files Modified**:
- `factory/state.py`

---

### 1.4 Command Agent Wrapper
**Goal**: Wrap Claude API to execute commands as agents

**Tasks**:
- [ ] Implement `factory/command_agent.py`:
  - [ ] `CommandAgent` class with:
    - `__init__(command_name: str, tools: list[Tool])`
    - `execute(context: dict) -> AgentResult`
    - `_build_context_message(context: dict) -> str`
    - `_execute_tools(tool_uses) -> list[ToolResult]`
    - `_extract_artifacts(response) -> dict[str, Path]`
    - `_extract_decisions(messages) -> list[dict]`
  - [ ] Load command file from `.claude/commands/{command_name}.md`
  - [ ] Use command content as system prompt
  - [ ] Implement tool execution loop (while stop_reason == "tool_use")
  - [ ] Handle streaming responses (optional)

**Verification**:
```python
agent = CommandAgent("spec-to-requirements", [])
# Mock execution with dummy context
```

**Files Modified**:
- `factory/command_agent.py`

---

## Phase 2: Factory-Specific Tools (2 Tools Only)

**Note**: Agents have native bash, read, write capabilities. We only build tools for factory-specific operations that wrap complex logic.

### 2.1 Constitutional Validator Tool
**Goal**: Wrap existing constitutional validator as agent tool

**Tasks**:
- [ ] Create `factory/tools/constitutional_validator_tool.py`:
  - [ ] `ConstitutionalValidatorTool` class:
    - `definition` dict
    - `execute(artifact_path: str, constitution_path: str = None) -> dict`
    - Import and use `.lsf/scripts/python/constitutional_validator.py`
    - Return dict with `passed` and `violations` list

**Verification**:
```python
tool = ConstitutionalValidatorTool()
result = tool.execute("test-artifact.md")
assert "passed" in result
assert "violations" in result
```

**Files Created**:
- `factory/tools/constitutional_validator_tool.py`

---

### 2.2 Data Plane Tools
**Goal**: Inspect Django models and manage data plane state

**Tasks**:
- [ ] Create `factory/tools/data_plane_tools.py`:
  - [ ] `DataPlaneInspectorTool` class:
    - `definition` dict
    - `execute() -> str` (returns YAML string)
    - Introspect Django models using `django.apps.get_models()`
    - Generate `data-plane-current.yaml` structure
  - [ ] `DataPlaneCompareTool` class:
    - `definition` dict
    - `execute(target_path: str, current_path: str) -> dict`
    - Compare target vs current
    - Return diff: missing_models, missing_fields, missing_relations

**Verification**:
```bash
cd src && python -c "import django; django.setup(); from factory.tools.data_plane_tools import DataPlaneInspectorTool; tool = DataPlaneInspectorTool(); print(tool.execute())"
```

**Files Created**:
- `factory/tools/data_plane_tools.py`

---

### 2.3 Tool Registration
**Goal**: Export factory tools for use in agents

**Tasks**:
- [ ] Update `factory/tools/__init__.py`:
  - [ ] Import tool classes
  - [ ] Export: `FACTORY_TOOLS = [ConstitutionalValidatorTool(), DataPlaneInspectorTool()]`
  - [ ] Export: `DISCRIMINATOR_TOOLS = [ConstitutionalValidatorTool()]`
  - [ ] Export: `EXECUTOR_TOOLS = [DataPlaneInspectorTool()]`

**Verification**:
```python
from factory.tools import FACTORY_TOOLS
assert len(FACTORY_TOOLS) == 2
```

**Files Modified**:
- `factory/tools/__init__.py`

**Note**: Agents use native capabilities for:
- File I/O: `read_file()`, `write_file()`
- Shell: `bash("command")`
- Code search: `bash("rg pattern")`
- Git: `bash("git commit")`

---

## Phase 3: Orchestrator Core

**Philosophy**: Simple sequential execution with checkpoints. No complex state machine.

### 3.1 Basic Orchestrator Structure
**Goal**: Simple sequential command execution

**Tasks**:
- [ ] Implement `factory/orchestrator.py`:
  - [ ] `SoftwareFactory` class with:
    - `__init__()`
    - `state: FactoryState`
  - [ ] `_create_agent(command_name: str, tools: list) -> CommandAgent` method
    - Load command file
    - Create agent with tools
    - No pre-initialization of all agents
  - [ ] `_execute_phase(phase_name: str, context: dict) -> dict` method
    - Create agent for this phase
    - Execute agent
    - Save checkpoint to state
    - Return phase result

**Verification**:
```python
factory = SoftwareFactory()
# Should be able to execute single phase
```

**Files Modified**:
- `factory/orchestrator.py`

**Simplifications**:
- No pre-initialized agent registry
- Agents created on-demand per phase
- Simple tool assignment: discriminators get validator, executors get data plane, rest get nothing

---

### 3.2 Main Run Method (Sequential Execution)
**Goal**: Execute complete pipeline as sequence of phases

**Tasks**:
- [ ] Implement in `factory/orchestrator.py`:
  - [ ] `async run(human_spec_path: Path) -> dict` method:

    ```python
    # Simple sequential execution:
    1. Load spec
    2. spec-to-requirements
    3. discriminate-layer2 (if fails, stop)
    4. complexity-gate (decides TDD vs SEED)
    5a. TDD Path:
        - requirements-to-red
        - discriminate-red (if fails, stop)
        - red-to-green
        - discriminate-green (if fails, stop)
        - execute-red
        - execute-green
    5b. Seed Path:
        - seed-implementation
        - extract-tests
        - verify tests
    6. check-data-plane (if exists)
    7. Return success/failure
    ```

  - [ ] Each phase: call `_execute_phase()`, check result, continue or stop
  - [ ] Save checkpoint after each phase
  - [ ] Log progress to stdout

**Verification**: Can run full pipeline (will test with mock)

**Files Modified**:
- `factory/orchestrator.py`

**Simplifications**:
- No separate `_execute_tdd_path()` or `_execute_seed_path()` methods
- Just linear if/else in main `run()` method
- Fail-fast: any discrimination failure stops pipeline immediately

---

### 3.3 Resume Capability (Optional - defer to Phase 8)
**Goal**: Resume interrupted factory runs

**Tasks** (defer until MVP working):
- [ ] Implement in `factory/orchestrator.py`:
  - [ ] `async resume() -> dict` method:
    - Load state from disk
    - Look at last successful phase checkpoint
    - Continue from next phase
    - Simple linear continuation

**Note**: Not required for MVP. Add after getting one feature working end-to-end.

---

## Phase 4: CLI Interface (Minimal)

### 4.1 Basic CLI Command
**Goal**: Simple CLI to run factory

**Tasks**:
- [ ] Implement `factory/cli.py`:
  - [ ] `@click.group()` main CLI group
  - [ ] `run` command:
    - Takes `human_spec` path argument
    - Option: `--debug` (show agent conversations)
    - Calls `factory.run()`
    - Print results (simple text output)
    - Exit code 0 for success, 1 for failure

**Verification**:
```bash
python -m factory.cli run specs/human-spec-test.md
# Should execute pipeline and print results
```

**Files Modified**:
- `factory/cli.py`

**Defer to Later**:
- Fancy output formatting (colors, spinners)
- `resume` command
- `status` command
- `run-phase` command

**MVP**: Just get one command working that runs a spec end-to-end.

---

## Phase 5: MVP Testing

**Philosophy**: Get one real feature working. Tests are about validating the real pipeline, not unit testing every component.

### 5.1 Manual Smoke Test
**Goal**: Run factory on real simple spec by hand

**Tasks**:
- [ ] Create `specs/human-spec-health-check.md`:
  - Single outcome: "System provides health check endpoint"
  - Simple GET /health endpoint returning {"status": "ok"}
- [ ] Run manually:
  ```bash
  python -m factory.cli run specs/human-spec-health-check.md
  ```
- [ ] Verify each phase completes:
  - [ ] spec-to-requirements generates files
  - [ ] discriminate-layer2 passes
  - [ ] complexity-gate makes decision
  - [ ] Red/Green phases or Seed path completes
  - [ ] Tests are created and pass
  - [ ] Implementation works

**Success Criteria**: Factory produces working code without manual intervention

**Files Created**:
- `specs/human-spec-health-check.md`

**Defer**: Automated tests until pipeline proven to work

---

## Phase 6: Iteration & Refinement (After MVP Works)

**Note**: Only do this after Phase 5 smoke test succeeds

### 6.1 Test Second Feature
**Goal**: Verify reproducibility

**Tasks**:
- [ ] Create second simple spec (e.g., simple POST endpoint)
- [ ] Run factory
- [ ] Verify it works again
- [ ] Document any issues found
- [ ] Fix issues
- [ ] Re-run until reliable

**Success Criteria**: Factory can produce 2 different simple features reliably

---

### 6.2 Test More Complex Feature
**Goal**: Test with data models

**Tasks**:
- [ ] Create spec with data model (e.g., simple CRUD resource)
- [ ] Run factory
- [ ] Verify data-plane-target.yaml generated
- [ ] Verify migrations created
- [ ] Verify tests pass
- [ ] Document issues
- [ ] Fix and iterate

**Success Criteria**: Factory can handle features requiring data models

---

## Phase 7: Polish (After Reliable MVP)

### 7.1 Basic Documentation
**Goal**: Document what exists

**Tasks**:
- [ ] Create `automation/factory-readme.md`:
  - [ ] How to run factory
  - [ ] What each phase does
  - [ ] How to debug when it fails
  - [ ] Known limitations

**Defer to later**:
- Comprehensive user guides
- Developer documentation
- FAQ

---

### 7.2 Error Handling Improvements
**Goal**: Better error messages

**Tasks**:
- [ ] Add try/catch around phase execution
- [ ] Print clear error messages when agent fails
- [ ] Log agent conversations to `.lsf/factory-state/factory.log`
- [ ] Print helpful debugging hints

**Keep it simple**: Just catch exceptions and print useful info

---

## Phase 8: Future Enhancements (Defer)

These are explicitly **not** part of MVP. Do these only after factory reliably produces 5+ different features.

### 8.1 Resume Capability
- Load state and continue from checkpoint

### 8.2 Incremental Updates & Maintenance
- Adjust existing spec → re-run TDD path
- Smart diff detection

### 8.3 Better CLI
- Colored output
- Progress indicators
- Status command
- Metrics tracking

### 8.4 Performance Optimization
- Parallel agent execution
- Context caching
- Streaming responses

### 8.5 Configuration System
- Configurable model, timeouts, etc.
- `.lsf/factory-config.yaml`

---

## Success Criteria

### Minimal Viable Product (MVP)
**Target**: Get ONE feature working end-to-end

- [ ] CLI command exists: `python -m factory.cli run <spec>`
- [ ] Factory can execute all phases in sequence
- [ ] One simple spec (health check endpoint) produces:
  - [ ] Working implementation
  - [ ] Passing tests
  - [ ] No manual intervention required
- [ ] Both TDD and Seed paths work (test at least once each)
- [ ] Discriminators can block progress on violations
- [ ] State checkpoints saved after each phase

**That's it for MVP.** Everything else is refinement.

### Production Ready (Later)
- [ ] 5+ different features implemented successfully
- [ ] Both simple and complex (with data models) features work
- [ ] Documented
- [ ] Reliable error handling
- [ ] Resume capability

---

## Implementation Order Priority

**Phase 1** (Days 1-2): Core Infrastructure
- Project setup, dependencies, file structure
- Result types, state management

**Phase 2** (Day 3): Factory-Specific Tools
- Constitutional validator tool
- Data plane inspector tool
- That's it

**Phase 3** (Days 4-5): Orchestrator Core
- Simple sequential execution
- Phase execution with checkpoints
- TDD and Seed path branching

**Phase 4** (Day 5): CLI
- Basic `run` command
- Simple output

**Phase 5** (Days 6-7): MVP Testing
- Create health check spec
- Run factory end-to-end
- Fix issues until it works
- **MILESTONE: MVP Complete**

**Phase 6** (Days 8-10): Iteration
- Test second feature
- Test feature with data models
- Fix issues, improve reliability

**Phase 7** (Day 11): Polish
- Basic docs
- Error handling improvements

**Phase 8**: Future (after MVP proven)

**Total MVP Timeline: ~1.5-2 weeks** (not 6 weeks)

---

## Development Guidelines

1. **Constitutional Compliance**: Every component must respect factory principles
2. **Test-Driven**: Write tests before implementation where possible
3. **Incremental**: Each task should be independently testable
4. **Documentation**: Update docs as features are built
5. **Quality Over Speed**: Focus on correctness and maintainability
6. **Agent-Centric**: Remember the agents are the users of these APIs
