# Layer 3 Implementation Plan

## Option Analysis: Single vs Dual Prompt

**Option A: Single Prompt for Both Files**
- **Pros**: Ensures coordination between red/green phases, atomic operation
- **Cons**: Larger context consumption, complex instruction set

**Option B: Separate Prompts**
- **Pros**: Clear separation of concerns, smaller context per operation
- **Cons**: Risk of misalignment between phases

**Recommendation: Option B (Separate Prompts)** - Better aligned with boundaries principle

## Layer 3A: Red Phase Generation

**Input Files:**
- requirements.md (Layer 2)
- test-cases.md (Layer 2)

**Task:**
Generate failing test implementation tasks that verify requirements

**Prompt Structure:**
```markdown
# Red Phase Derivation Instruction

## Input Analysis
- Parse all REQ-XXX from requirements.md
- Parse all TEST-XXX from test-cases.md
- Verify REQ↔TEST linkage completeness

## Task Generation Rules
For each TEST-XXX:
1. Create task to implement failing test
2. Reference existing test infrastructure patterns
3. Include exact verification command
4. Ensure test FAILS initially (red phase)

## Output Format
RED-XXX: Write failing test [TEST-XXX]
- Requirement: [REQ-XXX→OUT-XXX]
- Test Type: [Integration|Contract|Load|Unit]
- Implementation: [EXACT test code location]
- Verify Failure: `pytest [specific test] --expect-fail`
```

## Layer 3B: Green Phase Generation

**Input Files:**
- red-phase.md (Layer 3A output)
- requirements.md (Layer 2)
- architecture-boundaries-v3.md (component constraints)

**Task:**
Generate implementation tasks to make red tests pass

**Prompt Structure:**
```markdown
# Green Phase Derivation Instruction

## Input Analysis
- Parse all RED-XXX tasks from red-phase.md
- Extract requirement details from requirements.md
- Map to existing components from architecture-boundaries-v3.md

## Task Generation Rules
For each RED-XXX:
1. Identify required implementation to pass test
2. Use existing components only (enforce boundaries)
3. Create minimal implementation tasks
4. Include verification that test now passes

## Output Format
GREEN-XXX: Implement [REQ-XXX] to pass [TEST-XXX]
- Component: [EXISTING component from architecture-boundaries-v3.md]
- Implementation: [MINIMAL code to pass test]
- Verify Success: `pytest [specific test] --expect-pass`
```

## Template Structures

### red-phase-template.md:
```markdown
# Red Phase: Failing Test Implementation

RED-001: Write failing test [TEST-XXX]
- Requirement: [REQ-XXX→OUT-XXX]
- Test File: tests/[category]/test_[feature].py
- Function: def test_[scenario]()
- Verify Failure: `pytest tests/[path]::test_[name] --tb=short`

RED-002: Setup test infrastructure for [FEATURE]
- Database: Create test fixtures for [MODEL]
- Mock: External dependencies [SERVICES]
- Verify Setup: `pytest tests/[path] --collect-only`
```

### green-phase-template.md:
```markdown
# Green Phase: Implementation to Pass Tests

GREEN-001: Implement [REQ-XXX] using [COMPONENT]
- File: src/[app]/[module].py
- Function: [FUNCTION_NAME]
- Component: [DJANGO/REACT component from boundaries]
- Verify Pass: `pytest tests/[path]::test_[name]`

GREEN-002: Integrate [COMPONENT] with [EXISTING_SYSTEM]
- Configuration: Update settings/config
- Integration: Wire components together
- Verify Integration: `tests/run_all_tests_parallelized.py`
```

## Key Design Decisions

1. **Traceability Maintained**: RED/GREEN tasks reference back to TEST/REQ/OUT chain
2. **Component Enforcement**: Green phase must use architecture-boundaries-v3.md
3. **Verification Built-in**: Every task has explicit test command
4. **Minimal Implementation**: Green phase focuses on passing test, not over-engineering
5. **Existing Infrastructure**: Red phase reuses test patterns, green phase reuses components

## Validation Rules

### Red Phase:
- Every TEST-XXX → exactly one RED-XXX task
- All test infrastructure setup tasks included
- All verification commands are runable

### Green Phase:
- Every RED-XXX → corresponding GREEN-XXX implementation
- All components referenced exist in architecture-boundaries-v3.md
- No custom implementations without boundary justification

## Implementation Approach

This approach maintains clean separation while ensuring coordinated TDD workflow:

1. **Layer 3A (Red)**: Focus purely on test implementation
2. **Layer 3B (Green)**: Focus purely on minimal implementation to pass tests
3. **Boundaries Enforced**: Green phase locked to existing components
4. **Verification Integrated**: Every task self-verifies success/failure
5. **Traceability Preserved**: Full chain from user outcome to implementation task