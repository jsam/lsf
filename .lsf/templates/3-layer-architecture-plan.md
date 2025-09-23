# LSF 3-Layer Implementation Plan

## LSF 3-Layer Architecture Plan

### Layer Structure

```
Layer 1: Human Spec (human-spec.md)
├── High-level feature description
├── User scenarios and outcomes
└── Success criteria

Layer 2: Agent Spec (agent-derived)
├── requirements.md - Technical requirements extraction
└── test-cases.md - TDD test specifications

Layer 3: Implementation (agent-executed)
├── red-phase.md - Failing tests implementation
└── green-phase.md - Passing implementation tasks
```

### Layer 1: Human-Centric Specification

**File**: `human-spec.md`
**Purpose**: High-level feature description for human stakeholders
**Content**:
- Feature overview and user scenarios
- Success criteria and acceptance definition
- Business constraints and dependencies

**Principles Applied**:
- **Boundaries**: Pure human-centric content, no technical details
- **Minimalism**: Essential feature description only
- **Reasonable Defaults**: Standard user story format

### Layer 2: Agent Specification Derivation

**Input**: `human-spec.md`
**Process**: Agent parses human spec and generates technical artifacts

#### 2A: requirements.md
**Purpose**: Technical requirements for software production
**Content**:
```markdown
# Requirements Extract
- Functional requirements (testable)
- Technical constraints
- Integration points
- Data requirements
- Performance criteria
```

**Principles Applied**:
- **Context Efficiency**: Only technical requirements, no business context
- **Agent-centric**: Structured for agent consumption
- **Focus**: Pure software factory requirements

#### 2B: test-cases.md
**Purpose**: TDD test specifications
**Content**:
```markdown
# Test Case Specifications
- Integration test scenarios
- Unit test cases (algorithms only)
- Contract validations
- Success/failure criteria
```

**Principles Applied**:
- **Verification**: Defines verification strategy upfront
- **Boundaries**: Clear test boundaries (integration/unit/e2e)
- **Minimalism**: Only tests that provide value

### Layer 3: TDD Implementation Phases

#### 3A: red-phase.md
**Purpose**: Failing test implementation tasks
**Content**:
```markdown
# Red Phase Tasks
- [ ] Task ID: Write failing test X
- [ ] Task ID: Implement test infrastructure Y
- [ ] Verification: Run test, confirm failure
```

**Principles Applied**:
- **Agent-centric**: Executable task format
- **Verification**: Each task includes verification command
- **Drift Detection**: Links back to original requirements

#### 3B: green-phase.md
**Purpose**: Implementation tasks to make tests pass
**Content**:
```markdown
# Green Phase Tasks
- [ ] Task ID: Implement feature X to pass test Y
- [ ] Task ID: Integrate component Z
- [ ] Verification: Run test suite, confirm pass
```

**Principles Applied**:
- **Verification**: Built-in test execution
- **Minimalism**: Minimal implementation to pass tests
- **Focus**: Pure implementation without over-engineering

### Implementation Strategy

**Phase 1: Template Creation**
- Create `human-spec.md` template (minimal)
- Create agent derivation logic for Layer 2
- Create TDD phase templates for Layer 3

**Phase 2: Agent Pipeline**
- Agent reads Layer 1 → generates Layer 2
- Agent reads Layer 2 → generates Layer 3
- Each layer validates against agentic principles

**Phase 3: Execution Integration**
- Red phase tasks execute with existing test runners
- Green phase tasks verify with parallelized test suite
- Drift detection checks against original human spec

### Principle Compliance

**Context Efficiency**: Each layer contains only relevant information for its consumer
**Minimalism**: 3 layers instead of current complex template hierarchy
**Agent-centric**: Layers 2-3 optimized for agent execution
**Focus**: No business content beyond Layer 1
**Boundaries**: Clean separation: Human → Agent → Implementation
**Drift Detection**: Systematic requirement traceability across layers
**Verification**: Built-in test execution at each phase
**Reasonable Defaults**: Standard TDD red/green cycle structure

This architecture eliminates business/stakeholder mixing while maintaining clear human input → agent execution flow aligned with agentic TDD principles.

## LSF 3-Layer Implementation Plan

### File Structure Extension

```
.lsf/
├── commands/
│   ├── spec.sh           # /spec - Create Layer 1 human spec
│   ├── derive.sh         # /derive - Generate Layer 2 from Layer 1
│   ├── red.sh            # /red - Generate red phase tasks
│   ├── green.sh          # /green - Generate green phase tasks
│   └── verify.sh         # /verify - Run verification checks
├── templates/
│   ├── human-spec-template.md
│   ├── requirements-template.md
│   ├── test-cases-template.md
│   ├── red-phase-template.md
│   └── green-phase-template.md
└── scripts/
    ├── derive-agent.py   # Layer 1 → Layer 2 conversion
    ├── tdd-generator.py  # Layer 2 → Layer 3 conversion
    └── drift-checker.py  # Requirement traceability validation
```

### Command Implementation Tasks

#### Task 1: /spec Command
**File**: `.lsf/commands/spec.sh`
**Purpose**: Create Layer 1 human specification
**Function**:
```bash
# Usage: /spec "feature description"
# Creates: human-spec.md from template
# Validates: Human-readable format only
```

#### Task 2: /derive Command
**File**: `.lsf/commands/derive.sh`
**Purpose**: Generate Layer 2 from Layer 1
**Function**:
```bash
# Usage: /derive
# Input: human-spec.md
# Output: requirements.md + test-cases.md
# Agent: derive-agent.py
```

#### Task 3: /red Command
**File**: `.lsf/commands/red.sh`
**Purpose**: Generate red phase implementation tasks
**Function**:
```bash
# Usage: /red
# Input: requirements.md + test-cases.md
# Output: red-phase.md
# Agent: tdd-generator.py --phase=red
```

#### Task 4: /green Command
**File**: `.lsf/commands/green.sh`
**Purpose**: Generate green phase implementation tasks
**Function**:
```bash
# Usage: /green
# Input: red-phase.md + test results
# Output: green-phase.md
# Agent: tdd-generator.py --phase=green
```

#### Task 5: /verify Command
**File**: `.lsf/commands/verify.sh`
**Purpose**: Run verification and drift detection
**Function**:
```bash
# Usage: /verify [layer]
# Validates: Layer compliance + drift detection
# Uses: existing test runners + drift-checker.py
```

### Template Creation Tasks

#### Task 6: Human Spec Template
**File**: `.lsf/templates/human-spec-template.md`
**Content**:
```markdown
# Feature: [NAME]
## Description
[High-level feature description]
## User Scenarios
[User stories and outcomes]
## Success Criteria
[Acceptance definition]
```

#### Task 7: Requirements Template
**File**: `.lsf/templates/requirements-template.md`
**Content**:
```markdown
# Technical Requirements
## Functional Requirements
- REQ-001: [Testable requirement]
## Technical Constraints
- TECH-001: [Implementation constraint]
## Integration Points
- INT-001: [External dependency]
```

#### Task 8: Test Cases Template
**File**: `.lsf/templates/test-cases-template.md`
**Content**:
```markdown
# TDD Test Specifications
## Integration Tests
- INT-T001: [Test scenario]
## Unit Tests
- UNIT-T001: [Algorithm test]
## Contract Tests
- CONTRACT-T001: [API validation]
```

#### Task 9: Red Phase Template
**File**: `.lsf/templates/red-phase-template.md`
**Content**:
```markdown
# Red Phase: Failing Tests
## Tasks
- [ ] RED-001: Write failing test [TEST-ID]
  - Verify: `pytest [test] --should-fail`
- [ ] RED-002: Setup test infrastructure
  - Verify: `test runner executes`
```

#### Task 10: Green Phase Template
**File**: `.lsf/templates/green-phase-template.md`
**Content**:
```markdown
# Green Phase: Implementation
## Tasks
- [ ] GREEN-001: Implement [REQUIREMENT-ID]
  - Verify: `pytest [test] --should-pass`
- [ ] GREEN-002: Integration verification
  - Verify: `tests/run_all_tests_parallelized.py`
```

### Agent Script Tasks

#### Task 11: Derivation Agent
**File**: `.lsf/scripts/derive-agent.py`
**Purpose**: Convert Layer 1 → Layer 2
**Function**:
- Parse human-spec.md
- Extract technical requirements
- Generate test specifications
- Apply agent-centric formatting

#### Task 12: TDD Generator
**File**: `.lsf/scripts/tdd-generator.py`
**Purpose**: Generate Layer 3 phases
**Function**:
- Parse requirements.md + test-cases.md
- Generate red/green phase tasks
- Include verification commands
- Link to existing test infrastructure

#### Task 13: Drift Checker
**File**: `.lsf/scripts/drift-checker.py`
**Purpose**: Validate requirement traceability
**Function**:
- Map Layer 1 requirements → Layer 2 → Layer 3
- Detect implementation drift
- Validate test coverage alignment

### Integration Tasks

#### Task 14: Command Registration
**File**: Update existing LSF command system
**Action**: Register new /spec, /derive, /red, /green, /verify commands

#### Task 15: Test Runner Integration
**File**: Integrate with existing parallelized test runner
**Action**: Link green phase verification to `run_all_tests_parallelized.py`

#### Task 16: Workflow Validation
**File**: End-to-end workflow testing
**Action**: Validate Layer 1 → 2 → 3 → Implementation pipeline

### Principle Compliance per Task

**Context Efficiency**: Templates contain only essential information per layer
**Minimalism**: 5 commands, 5 templates, 3 agents - minimal necessary structure
**Agent-centric**: Layers 2-3 optimized for agent parsing and execution
**Focus**: No business logic beyond Layer 1 human spec
**Boundaries**: Clear separation: Commands → Templates → Agents → Verification
**Drift Detection**: Built into /verify command and drift-checker.py
**Verification**: Each phase includes test execution verification
**Reasonable Defaults**: Extends existing LSF patterns and test infrastructure

This implementation extends LSF with minimal complexity while maintaining clean layer separation and full agentic principle compliance.