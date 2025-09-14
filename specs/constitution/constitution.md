# LSF Project Constitution

## Core Principles

### I. Library-First Development
Every feature starts as a standalone library module. Libraries must be self-contained, independently testable, and well-documented. Each library must have a clear, single purpose - no organizational-only libraries allowed.

### II. CLI Interface
Every library functionality must be exposed via CLI commands. Follow text in/out protocol: stdin/args → stdout, errors → stderr. Support both JSON and human-readable output formats for all commands.

### III. Test-First Development (NON-NEGOTIABLE)
TDD is mandatory: Tests are written first → User reviews and approves → Tests fail → Then implement. The Red-Green-Refactor cycle must be strictly enforced. No code merges without passing tests.

### IV. Configuration Management Focus
Primary purpose is managing .claude and .lsf configuration folders across projects. All operations must be reversible (backup/restore capability). Configuration integrity must be preserved during all operations.

### V. Observability & Debugging
All operations must provide clear, actionable feedback. Structured logging using loguru is required. Debug mode must be available for troubleshooting. Text I/O ensures complete debuggability.

## Quality Standards

### Code Quality
- All code must pass ruff linting and mypy type checking
- Pydantic models for all data structures
- Rich console output for enhanced user experience
- Comprehensive error handling with helpful messages

### Documentation Requirements
- Every public function must have docstrings
- CLI commands must have help text
- README must be kept up-to-date with examples
- Configuration options must be documented

## Development Workflow

### Feature Development Process
1. Create epic with clear user stories
2. Write tests following TDD principles
3. Implement feature to pass tests
4. Run validation suite (format, lint, test)
5. Update documentation
6. Submit for review

### Validation Gates
- Pre-commit hooks must pass
- All tests must pass with >80% coverage
- Linting and type checking must succeed
- Documentation must be complete

## Governance

The constitution supersedes all other development practices. Any amendments require:
- Documented justification
- Team approval
- Migration plan for existing code
- Update to constitution_update_checklist.md

All pull requests and code reviews must verify constitutional compliance. Complexity must be justified with clear benefits. Use .lsf/memory/constitution.md as the source of truth for development guidance.

**Version**: 3.0.0 | **Ratified**: 2025-09-14 | **Last Amended**: 2025-09-14