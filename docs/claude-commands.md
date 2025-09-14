# Claude Commands Reference

## Overview

LSF provides a comprehensive set of Claude commands that implement the complete test-spec-driven development workflow. These commands are designed to work with Claude Code and other AI agents to provide systematic, high-quality development processes.

All commands are located in `.claude/commands/` and follow the LSF constitutional framework for consistent, reliable development practices.

## Development Workflow Commands

The LSF workflow follows a systematic progression through these phases:

```
/init → /epic → /breakdown → /test → /implement → /review → /refactor
```

### Core Workflow Commands

---

## `/init` - Project Constitution Setup

**Purpose**: Initialize project constitution and governance structure for single-agent TDD workflow development.

**Usage**: `/init [project-name] [constitution-version] [custom-principles]`

**What it does**:
1. Sets up `specs/constitution/` directory structure
2. Creates constitutional framework from template
3. Establishes governance and compliance tracking
4. Initializes amendment process documentation

**Inputs**:
- **Project name**: Defaults to repository name if not provided
- **Constitution version**: Defaults to 3.0.0 (Single-Agent TDD Workflow)
- **Custom principles**: Optional additional constitutional principles

**Outputs**:
- `specs/constitution/constitution.md` - Project constitutional framework
- `specs/constitution/constitution_update_checklist.md` - Governance checklist
- `specs/constitution/amendments/` - Directory for future amendments
- Governance report with framework status

**Example**:
```
/init MyProject 3.1.0 "Additional principle: API-first development"
```

---

## `/epic` - Feature Specification Creation

**Purpose**: Create or update feature epic with human-readable requirements (the what and why).

**Usage**: `/epic [feature-description]`

**What it does**:
1. Creates feature branch for the epic
2. Generates structured epic document using template
3. Focuses on user value and business requirements
4. Prepares foundation for technical breakdown

**Template Structure**:
- **Overview**: Feature summary and business context
- **User Stories**: Clear "As a...I want...So that" statements
- **Functional Requirements**: Testable and measurable requirements
- **Success Criteria**: Specific, time-bound outcomes
- **Constraints**: Business and technical limitations

**Outputs**:
- `specs/[branch-name]/epic.md` - Structured feature specification
- Feature branch creation
- Readiness confirmation for `/breakdown` phase

**Example**:
```
/epic "User authentication system with OAuth2 support and role-based access control"
```

---

## `/breakdown` - Technical Architecture Planning

**Purpose**: Transform epic into actionable technical plan and ordered task list with TDD workflow integration.

**Usage**: `/breakdown [technical-context]`

**What it does**:
1. Analyzes epic requirements and user stories
2. Creates technical architecture decisions
3. Defines system boundaries and interfaces
4. Generates ordered, executable task list with dependencies

**Constitutional Requirements**:
- Follows constitutional principles from `.lsf/memory/constitution.md`
- Ensures single-agent sequential execution feasibility
- Enforces TDD workflow (tests before implementation)
- Maintains clear Definition of Done for each task

**Outputs**:
- `breakdown.md` - Technical architecture and design decisions
- `stories.md` - User stories broken down from epic
- `boundaries/` - API and interface definitions
- `tasks.md` - Ordered task list with stable IDs (P1-001, P1-002, etc.)

**Task Structure**:
- **Stable IDs**: Sequential numbering with dependencies
- **TDD Enforcement**: Tests required before implementation
- **Single-Agent Support**: Tasks designed for individual completion
- **Traceability**: Clear mapping to requirements and acceptance criteria

**Example**:
```
/breakdown "Using FastAPI framework with PostgreSQL database, following microservices architecture"
```

---

## `/test` - Test Suite Generation (TDD Red Phase)

**Purpose**: Generate comprehensive failing test suite that encodes acceptance criteria with traceability to tasks.

**Usage**: `/test [test-generation-context]`

**What it does**:
1. Analyzes breakdown, tasks, and epic for test requirements
2. Creates structured test suite under `test/` directory
3. Generates failing tests for TDD Red phase
4. Maps tests to specific task IDs for traceability

**Test Structure**:
- `test/contract/` - API contract tests
- `test/integration/` - Cross-component integration tests  
- `test/unit/` - Component-specific unit tests

**Test Generation Rules**:
- **User Story** → Integration test scenario
- **API Endpoint** → Contract test
- **Component/Entity** → Unit test suite
- **Acceptance Criterion** → Specific test case
- **TDD Red Requirement** → Tests must fail initially

**Outputs**:
- Comprehensive test suite with failing tests
- `test-plan.md` - Testing strategy and coverage matrix
- Test-to-task traceability documentation
- Test execution and failure analysis guidelines

**Example**:
```
/test "Focus on API endpoints for user management and OAuth2 integration flows"
```

---

## `/implement` - TDD Implementation Loop

**Purpose**: Execute single-agent implementation using TDD loop with automatic quality checks.

**Usage**: `/implement [task-selector] [options]`

**Task Selection**:
- **Single ID**: `P1-003`
- **Multiple IDs**: `P1-001,P1-003,P1-005`
- **Range**: `P1-001:P1-010`

**What it does**:
1. Validates task selection and dependencies
2. Executes TDD loop for each task:
   - **Red Phase**: Verify tests fail initially
   - **Green Phase**: Implement minimum code to pass tests
   - **Refactor Phase**: Improve code while keeping tests green
3. Runs quality gates and constitutional compliance checks
4. Commits changes with traceability to tasks

**Quality Assurance**:
- Full test suite regression detection
- Constitutional compliance validation
- Code quality metrics and standards
- Automatic corrective task generation for issues

**Outputs**:
- Implemented features with passing tests
- Updated `tasks.md` with completion status
- Implementation report with metrics
- Quality gate results and recommendations

**Example**:
```
/implement P1-001:P1-005 --mode sequential --quality-gates auto
```

---

## `/review` - Quality Assurance and Architectural Review

**Purpose**: Perform comprehensive quality assurance with constitutional compliance checking.

**Usage**: `/review [scope] [options]`

**Review Modes**:
- **Full Review** (default): Comprehensive analysis of entire feature
- **Incremental Review** (`--scope changed`): Focus on current changes only

**What it does**:
1. **Scope Analysis**: Verify changes align with epic and tasks
2. **Architecture Review**: Check conformance to breakdown design
3. **Quality Assessment**: Static analysis, security, performance
4. **Traceability Validation**: Requirements → tasks → tests → code
5. **Constitutional Compliance**: Adherence to governance principles

**Quality Dimensions**:
- Code complexity and maintainability
- Security and performance considerations
- Error handling and logging adequacy
- Documentation completeness
- Test coverage and quality

**Outputs**:
- `review_report.md` - Structured findings by severity
- Categorized issues (critical, major, minor)
- Specific recommendations and fix guidance
- Corrective tasks appended to `tasks.md`

**Review Outcomes**:
- **Pass**: Quality standards met, approve progression
- **Conditional Pass**: Minor issues, can proceed with monitoring
- **Fail**: Critical issues, implementation must be corrected
- **Auto-fix Applied**: Safe fixes implemented automatically

**Example**:
```
/review --scope full --auto-fix true
```

---

## `/refactor` - Code Structure Improvement

**Purpose**: Improve internal code structure without changing observable behavior while keeping tests green.

**Usage**: `/refactor [scope] [techniques] [options]`

**Refactoring Techniques**:
- **Code Structure**: Extract methods, simplify conditions, remove duplication
- **Architecture**: Strengthen boundaries, reduce coupling, improve cohesion
- **Performance**: Optimize data structures, improve I/O patterns, add caching

**Safety Levels**:
- **Conservative**: Minimal risk, basic improvements
- **Moderate**: Balanced risk/reward, structural improvements
- **Aggressive**: Higher risk, significant architecture changes

**What it does**:
1. Establishes baseline (green tests, code metrics)
2. Applies refactoring techniques incrementally
3. Runs tests after each change (mandatory green status)
4. Validates metrics improvements
5. Documents rationale and impact

**Refactoring Process**:
- Make small, focused changes one at a time
- Run tests after each change to maintain green status
- Commit each successful refactoring step
- Roll back immediately if tests fail
- Document significant changes

**Outputs**:
- Improved code structure with preserved functionality
- Before/after metrics comparison
- Refactoring report with impact analysis
- Maintenance recommendations

**Example**:
```
/refactor src/auth/ extract_method,remove_duplication --safety moderate
```

---

## Workflow Integration

### Typical Development Sequence

1. **Project Setup**: `/init` - Establish constitutional framework
2. **Feature Planning**: `/epic` - Define business requirements
3. **Technical Design**: `/breakdown` - Create architecture and tasks  
4. **Test Creation**: `/test` - Generate failing test suite (Red phase)
5. **Implementation**: `/implement` - TDD loop execution (Green/Refactor phases)
6. **Quality Assurance**: `/review` - Validate quality and compliance
7. **Code Improvement**: `/refactor` - Optimize structure and maintainability

### Command Dependencies

```
/init (standalone)
  ↓
/epic → /breakdown → /test → /implement → /review → /refactor
                              ↑              ↓
                              ←──────────────
                           (iterative cycle)
```

### Error Handling

All commands include comprehensive error handling for:
- **Input Validation**: Invalid arguments or missing context
- **Dependency Violations**: Commands run out of sequence
- **Constitutional Compliance**: Violations of governance principles
- **Quality Gate Failures**: Code quality standards not met
- **Test Failures**: TDD requirements not satisfied

### Integration with Scripts

Each command integrates with corresponding bash scripts in `.lsf/scripts/bash/`:
- `init.sh` - Constitution setup automation
- `epic.sh` - Branch and file management
- `breakdown.sh` - Technical analysis and task generation
- `test-generation.sh` - Test suite creation
- `implement-single.sh` - TDD implementation workflow
- `review-qa.sh` - Quality assurance automation
- `refactor.sh` - Refactoring safety and metrics

## Best Practices

### Command Usage Guidelines

1. **Follow Sequence**: Commands are designed to work in sequence
2. **Validate Input**: Provide clear, specific context for each command
3. **Review Output**: Check generated files and reports carefully
4. **Constitutional Compliance**: Ensure adherence to governance principles
5. **Test-First**: Maintain TDD discipline throughout workflow

### AI Agent Collaboration

- **Clear Context**: Provide specific, actionable input for each command
- **Iterative Process**: Use commands iteratively for complex features
- **Quality Focus**: Leverage automated quality gates and reviews
- **Documentation**: Maintain traceability through all workflow stages

### Constitutional Alignment

All commands enforce constitutional principles:
- **Test-First Development**: Non-negotiable TDD requirements
- **Quality Standards**: Automated validation and compliance
- **Observability**: Comprehensive logging and traceability
- **Governance**: Amendment processes and approval workflows