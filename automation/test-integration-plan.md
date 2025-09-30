# Test Integration Plan for LSF Commands

## Overview
Integrate `tests/run_all_tests_parallelized.py` into the TDD workflow to ensure:
1. All existing tests pass before generating new tests (RED phase)
2. Only newly generated tests fail (RED phase validation)
3. All tests pass after implementation (GREEN phase validation)
4. Discriminators enforce test execution

---

## Current State Analysis

### Current Test Runner (`run_all_tests_parallelized.py`)
**Structure:**
- Hardcoded test paths in two groups:
  - Build tests: `build_workflows.py`, `frontend_workflows.py`
  - Runtime tests: `service_health.py`, `api_workflows.py`, `task_workflows.py`, `runtime_workflows.py`, `smoke.py`
- Also runs: React unit tests (`npm test`), Python unit tests (`pytest tests/unit/`)
- Supports parallel execution with ThreadPoolExecutor
- Docker service management for runtime tests

**Limitations:**
- Test paths are hardcoded (not dynamic)
- No concept of "new tests" vs "existing tests"
- No mechanism to track which tests were just generated

### Current Commands

#### `/execute-red` (Red Phase)
Currently:
1. Parses RED-XXX tasks from red-phase.md
2. Creates test files
3. Runs "verification to confirm all tests fail" (vague)

**Problems:**
- No baseline validation (existing tests might already be failing)
- No specific test runner integration
- No way to verify ONLY new tests fail

#### `/execute-green` (Green Phase)
Currently:
1. Parses GREEN-XXX tasks
2. Creates implementation files
3. Runs "verification to confirm all tests pass" (vague)

**Problems:**
- No specific test runner integration
- No guaranteed way to run ALL tests

#### `/discriminate-red` and `/discriminate-green`
Currently:
- Run various checks but DON'T execute tests
- Focus on static analysis (coupling, stack boundaries, etc.)

---

## Proposed Solution

### 1. Make Test Runner Dynamic

**Goal:** Allow test runner to accept new test paths dynamically without modifying hardcoded lists.

**Approach:** Modify `run_all_tests_parallelized.py` to:

```python
# Option A: Registry file approach
- Read from a test registry file: `tests/test-registry.json`
- Registry contains:
  {
    "build_tests": [...],
    "runtime_tests": [...],
    "unit_tests": [...],
    "newly_added_tests": [...]  # Track most recent additions
  }

# Option B: Auto-discovery with metadata
- Tests include metadata header:
  # TEST-METADATA: {"type": "integration", "phase": "runtime", "added_by": "RED-001"}
- Runner scans all test files and categorizes dynamically

# Option C: Command-line argument
- `--test-files file1.py file2.py` to run specific tests
- `--new-tests-only` flag to run only newly added tests
- `--exclude-new-tests` flag to run only existing tests
```

**Recommended:** **Option A (Registry file)** because:
- Explicit control over which tests run
- Clear tracking of new vs existing tests
- Easy for agents to update
- No need to scan all files

**Registry Structure:**
```json
{
  "version": "1.0",
  "last_updated": "2025-09-30T20:00:00Z",
  "baseline_tests": {
    "build": [
      "tests/integration/build_workflows.py",
      "tests/integration/frontend_workflows.py"
    ],
    "runtime": [
      "tests/integration/service_health.py",
      "tests/integration/api_workflows.py",
      "tests/integration/task_workflows.py",
      "tests/integration/runtime_workflows.py",
      "tests/e2e/smoke.py"
    ],
    "unit": {
      "python": "tests/unit/",
      "react": "src/frontend"
    }
  },
  "newly_added_tests": {
    "phase": "RED-XXX",
    "timestamp": "2025-09-30T20:30:00Z",
    "tests": [
      "tests/integration/test_new_feature.py"
    ]
  }
}
```

**Runner Changes:**
```python
# Add new methods to TestRunner class:

def load_test_registry(self):
    """Load test registry from JSON file."""
    registry_path = Path("tests/test-registry.json")
    if not registry_path.exists():
        return self._create_default_registry()
    return json.loads(registry_path.read_text())

def run_baseline_tests_only(self):
    """Run only baseline tests (exclude newly_added_tests)."""
    registry = self.load_test_registry()
    # Run baseline_tests only

def run_newly_added_tests_only(self):
    """Run only newly added tests."""
    registry = self.load_test_registry()
    # Run newly_added_tests only

def run_all_tests(self):
    """Run baseline + newly added tests."""
    registry = self.load_test_registry()
    # Run everything

# Add CLI flags:
parser.add_argument("--baseline-only", help="Run only baseline tests")
parser.add_argument("--new-only", help="Run only newly added tests")
```

---

### 2. Update `/execute-red` Command

**New Workflow:**

```markdown
# Execute Red Phase (UPDATED)

Generate failing test implementations from red phase tasks.

**Usage:** `/execute-red <red-phase.md>`

**Output:**
- Test files in appropriate directories
- Updated test-registry.json with new tests
- Verification that existing tests still pass
- Verification that ONLY new tests fail

**Implementation:**

1. **Baseline Verification (NEW)**
   - Run: `python3 tests/run_all_tests_parallelized.py --baseline-only`
   - MUST pass (all existing tests pass)
   - If fails: STOP and report "Existing tests are failing - fix before adding new tests"

2. **Parse RED-XXX tasks** from red-phase.md

3. **Execute RED-SETUP tasks** (if any)
   - Database migrations
   - Test fixtures
   - Configuration setup

4. **Generate test files**
   - For each RED-XXX task:
     - Create test file at specified location
     - Generate failing test with correct framework
     - Ensure test fails for expected reason (NotImplementedError, etc.)
   - Track all newly created test file paths

5. **Update test registry (NEW)**
   - Load `tests/test-registry.json`
   - Add new test paths to `newly_added_tests` section
   - Include metadata: phase ID, timestamp, test type
   - Write updated registry

6. **Verify new tests fail (NEW)**
   - Run: `python3 tests/run_all_tests_parallelized.py --new-only`
   - MUST fail (all new tests fail as expected)
   - If passes: ERROR "New tests should fail in RED phase"

7. **Verify existing tests still pass (NEW)**
   - Run: `python3 tests/run_all_tests_parallelized.py --baseline-only`
   - MUST pass (existing tests unaffected by new tests)
   - If fails: ERROR "New tests broke existing tests"

8. **Report RED phase summary**
   - Number of new tests created
   - Verification results
   - Next step: proceed to discriminate-red

**Constitutional Compliance:**
- **Verification**: Multiple verification steps ensure quality
- **Boundaries**: Baseline tests isolated from new tests
- **Drift Detection**: Baseline verification prevents drift

**Success Criteria:**
- ✅ Baseline tests pass (before adding new tests)
- ✅ New test files created
- ✅ New tests fail as expected
- ✅ Baseline tests still pass (after adding new tests)
```

---

### 3. Update `/execute-green` Command

**New Workflow:**

```markdown
# Execute Green Phase (UPDATED)

Generate minimal implementations from green phase tasks.

**Usage:** `/execute-green <green-phase.md>`

**Output:**
- Implementation files in appropriate directories
- All tests pass (baseline + newly added)
- data-plane-current.yaml (if applicable)

**Implementation:**

1. **Parse GREEN-XXX tasks** from green-phase.md

2. **Generate implementation files**
   - For each GREEN-XXX task:
     - Create implementation file at specified location
     - Generate minimal code using specified component
     - Apply required configuration

3. **Execute GREEN-INT integration tasks** (if any)

4. **Execute GREEN-CONFIG configuration tasks** (if any)

5. **Run ALL tests (NEW - MANDATORY)**
   - Run: `python3 tests/run_all_tests_parallelized.py`
   - MUST pass (baseline + newly added tests)
   - If fails: Report which tests failed and why
   - Agent should fix implementation until all tests pass

6. **Verify test coverage (NEW)**
   - Run: `python3 tests/run_all_tests_parallelized.py --new-only`
   - MUST pass (newly added tests now pass)
   - This confirms implementation addresses the new feature

7. **Generate data-plane-current.yaml** (if data-plane-target.yaml exists)
   - Introspect Django models
   - Generate current state

8. **Check data plane alignment** (if applicable)
   - Run: `/check-data-plane`
   - Verify target vs current alignment

9. **Promote new tests to baseline (NEW)**
   - Move tests from `newly_added_tests` to `baseline_tests` in registry
   - Clear `newly_added_tests` section
   - This makes them part of the baseline for next iteration

10. **Report GREEN phase summary**
    - Implementation files created
    - Test results (all passing)
    - Data plane status

**Constitutional Compliance:**
- **Verification**: Comprehensive test execution
- **Minimalism**: Only implement what's needed to pass tests
- **Reasonable Defaults**: Use existing components

**Success Criteria:**
- ✅ Implementation files created
- ✅ ALL tests pass (baseline + new)
- ✅ New tests promoted to baseline
- ✅ Data plane aligned (if applicable)
```

---

### 4. Update Discriminators

#### `/discriminate-red` (Updated)

**Add test execution verification:**

```markdown
# Red Phase Discrimination (UPDATED)

**Implementation:**

1. Run coupling-check to validate proper test failure patterns
2. Run stack-check to enforce pytest/Vitest boundaries
3. Run hallucination-check to verify test target validity

4. **Run test verification (NEW - MANDATORY)**
   - Execute: `python3 tests/run_all_tests_parallelized.py --baseline-only`
   - MUST pass
   - If fails: BLOCK with "Baseline tests failing"

   - Execute: `python3 tests/run_all_tests_parallelized.py --new-only`
   - MUST fail
   - If passes: BLOCK with "New tests should fail in RED phase"

5. Aggregate results into single PASS/BLOCKED decision
6. Output structured report for agent consumption

**Success Criteria for PASS:**
- All static checks pass (coupling, stack, hallucination)
- Baseline tests pass
- New tests fail as expected
```

#### `/discriminate-green` (Updated)

**Add test execution verification:**

```markdown
# Green Phase Discrimination (UPDATED)

**Implementation:**

1. Run all 8 discriminators in priority order (existing checks)
2. Stop on first CRITICAL/ERROR violation (fail-fast)
3. Collect all WARNING violations for review

4. **Run comprehensive test verification (NEW - MANDATORY)**
   - Execute: `python3 tests/run_all_tests_parallelized.py`
   - MUST pass (all tests: baseline + new)
   - If fails: BLOCK with "Tests failing after implementation"
   - Report which specific tests failed

5. Aggregate into single PASS/BLOCKED/WARNING decision
6. Output comprehensive structured report

**Success Criteria for PASS:**
- All 8 discriminators pass (or warnings only)
- ALL tests pass
```

---

## Implementation Checklist

### Phase 1: Modify Test Runner
- [ ] Create default `tests/test-registry.json` with current baseline tests
- [ ] Add `load_test_registry()` method to TestRunner
- [ ] Add `run_baseline_tests_only()` method
- [ ] Add `run_newly_added_tests_only()` method
- [ ] Update `main()` to support `--baseline-only` and `--new-only` flags
- [ ] Add registry update utility method `update_registry(new_tests, mode='add'|'promote')`
- [ ] Test manually: run baseline, run new, run all

### Phase 2: Update `/execute-red` Command
- [ ] Update `.claude/commands/execute-red.md` with new workflow
- [ ] Add step 1: Baseline verification
- [ ] Add step 5: Update test registry
- [ ] Add step 6: Verify new tests fail
- [ ] Add step 7: Verify baseline tests still pass
- [ ] Update success criteria

### Phase 3: Update `/execute-green` Command
- [ ] Update `.claude/commands/execute-green.md` with new workflow
- [ ] Add step 5: Run ALL tests (mandatory)
- [ ] Add step 6: Verify test coverage
- [ ] Add step 9: Promote new tests to baseline
- [ ] Update success criteria

### Phase 4: Update Discriminators
- [ ] Update `.claude/commands/discriminate-red.md`:
  - Add test verification step (baseline pass, new fail)
- [ ] Update `.claude/commands/discriminate-green.md`:
  - Add comprehensive test verification step (all pass)

### Phase 5: Testing
- [ ] Create test scenario: simple feature spec
- [ ] Run through execute-red → verify it works
- [ ] Run through discriminate-red → verify blocking works
- [ ] Run through execute-green → verify it works
- [ ] Run through discriminate-green → verify blocking works
- [ ] Verify registry updates correctly
- [ ] Verify promotion works

---

## Edge Cases & Error Handling

### 1. Registry File Missing
- Auto-create with current baseline tests on first run
- Log warning but continue

### 2. Registry File Corrupted
- Fail with clear error
- Suggest manual fix or restore from backup

### 3. Baseline Tests Already Failing
- **execute-red**: STOP immediately, report failures
- Agent must fix before continuing
- Constitutional principle: **Drift Detection**

### 4. New Tests Pass in RED Phase
- **execute-red**: STOP, report error
- Tests must fail before implementation
- Constitutional principle: **Verification**

### 5. Tests Fail in GREEN Phase
- **execute-green**: Report failures, let agent iterate
- Agent should fix implementation until tests pass
- Don't auto-promote if tests fail

### 6. Docker Services Not Running
- Test runner already handles this (starts services)
- If can't start: fail gracefully with clear message

### 7. Test File Already Exists
- **execute-red**: Check if file exists before generating
- If exists: skip or warn
- Don't overwrite without confirmation

---

## Benefits of This Approach

### 1. **Reproducible Quality**
- Every RED phase verifies baseline integrity
- Every GREEN phase verifies complete test coverage
- No ambiguity about test status

### 2. **Fail-Fast**
- Baseline failures caught immediately (before wasting tokens)
- Invalid RED phase caught by discriminator (tests passing)
- Invalid GREEN phase caught by discriminator (tests failing)

### 3. **Constitutional Compliance**
- **Verification**: Tests actually run, not just generated
- **Drift Detection**: Baseline prevents regression
- **Boundaries**: Clear separation of new vs existing tests
- **Focus**: Automated quality gates

### 4. **Clear Feedback Loop**
- Agent knows exactly which tests failed
- Agent knows what to fix
- Discriminators provide automated review

### 5. **Scalability**
- Registry approach scales to hundreds of tests
- Parallel execution keeps runtime reasonable
- Baseline vs new separation prevents slowdown

---

## Alternative Approaches Considered

### ❌ Alternative 1: No Registry, Use Git Diff
**Idea:** Detect new tests by checking git diff

**Problems:**
- Requires clean git state
- Fragile (what if tests modified, not added?)
- Hard to track across multiple iterations

### ❌ Alternative 2: Marker Comments in Tests
**Idea:** Add `# NEWLY_ADDED` comments to new tests

**Problems:**
- Easy to forget or remove
- Pollutes test code
- Hard to query programmatically

### ❌ Alternative 3: Separate Test Suites
**Idea:** `tests/baseline/` vs `tests/new/`

**Problems:**
- Confusing directory structure
- Hard to promote tests
- Unclear where tests "live"

### ✅ Chosen: Registry File
- Clean separation of concerns
- Easy to query and update
- Scales well
- Clear promotion path

---

## Migration Path

### Step 1: Create Initial Registry
Generate `tests/test-registry.json` with current state:
```bash
# List all existing test files
find tests/ -name "test_*.py" -o -name "*_test.py"

# Create registry with these as baseline
```

### Step 2: Update Test Runner
Modify `run_all_tests_parallelized.py` with new methods

### Step 3: Update Commands
Update all 4 command files (.claude/commands/*.md)

### Step 4: Validate
Run full TDD cycle manually to verify

### Step 5: Document
Update factory instructions and user guides

---

## Success Metrics

After implementation, verify:
- [ ] RED phase enforces baseline integrity
- [ ] RED phase generates failing tests
- [ ] Discriminate-red catches invalid RED phases
- [ ] GREEN phase makes all tests pass
- [ ] Discriminate-green catches invalid GREEN phases
- [ ] Registry correctly tracks new vs baseline tests
- [ ] Promotion works correctly
- [ ] Error messages are clear and actionable
- [ ] No false positives/negatives in discriminators
