# Detailed Test Integration Plan - Constitutional Analysis

## Constitutional Alignment Analysis

### Principle-by-Principle Review

#### 1. Context Efficiency
**Current Problem:**
- Test runner has ~250 lines with hardcoded paths
- Agents would need to read entire file to understand what tests exist
- Registry scattered across Python code (implicit)

**Solution:**
- Single source of truth: `tests/test-registry.json` (~20 lines)
- Agent reads 20 lines vs 250 lines (92% reduction)
- Explicit state vs implicit code scanning

**Tradeoff:**
- +1 file to maintain
- BUT: Much lower cognitive load for agents

**Decision:** Registry approach wins on context efficiency

---

#### 2. Minimalism
**Question:** Is a registry file the simplest solution?

**Alternatives Considered:**

| Approach | Complexity Score | Agent Cognitive Load | Failure Modes |
|----------|-----------------|---------------------|---------------|
| **A. Registry JSON** | Low (2/10) | Low (agent edits JSON) | JSON syntax errors |
| B. Pytest markers | Medium (5/10) | Medium (must add decorators) | Only works for pytest tests |
| C. File naming convention | Low (3/10) | Medium (must remember pattern) | Easy to forget |
| D. Git-based detection | Medium (6/10) | High (must understand git state) | Requires clean working tree |
| E. Edit Python file directly | High (8/10) | High (must understand Python AST) | Syntax errors break runner |

**Analysis:**
- Registry JSON has lowest combined complexity + cognitive load
- Fewest failure modes
- Works across all test types (pytest, standalone Python, React/npm)

**Constitutional Verdict:** Registry is the MINIMAL solution that works reliably

---

#### 3. Reasonable Defaults
**Existing Pattern:** Test runner already exists with working logic

**Proposed Change:**
```python
# Minimal modification - add ONE feature: read from registry
def load_test_registry(self):
    registry_path = Path("tests/test-registry.json")
    if not registry_path.exists():
        return self._get_default_registry()  # Uses existing hardcoded lists
    return json.loads(registry_path.read_text())
```

**Impact:**
- Backward compatible (no registry = uses defaults)
- Doesn't break existing test execution
- Incremental enhancement, not rewrite

**Constitutional Verdict:** Follows reasonable defaults principle

---

#### 4. Agent-Centric Content
**Question:** What format is optimal for agents?

**Registry Format Analysis:**

```json
// Option A: Minimal (CHOSEN)
{
  "baseline": ["tests/integration/api_workflows.py"],
  "new": ["tests/integration/test_feature_x.py"]
}

// Option B: Verbose (REJECTED - violates minimalism)
{
  "version": "1.0",
  "last_updated": "2025-09-30T20:00:00Z",
  "metadata": {...},
  "baseline_tests": {
    "build": [...],
    "runtime": [...]
  },
  "newly_added_tests": {...}
}
```

**Why Option A wins:**
- Agent only needs to know: "Is this test baseline or new?"
- Timestamps, versions, categorization are YAGNI (You Aren't Gonna Need It)
- JSON path simpler: `.baseline` vs `.baseline_tests.runtime[0]`

**Command File Format:**
Current markdown with clear sections is GOOD for agents:
- Claude parses markdown well
- Clear imperative instructions
- Numbered steps = sequential execution

**Test Output Format:**
ADD structured output option:
```python
--json-output: Returns {"passed": 10, "failed": 2, "results": [...]}
```

Why: Discriminator agents need to parse results deterministically

**Constitutional Verdict:**
- Minimal JSON registry ✅
- Markdown commands ✅
- Add JSON output flag ✅

---

#### 5. Focus
**Goal:** Efficient software production

**This plan contributes by:**
1. Automating test verification (no manual QA)
2. Fail-fast gates (catch issues early, save tokens)
3. Clear pass/fail criteria (no ambiguity)
4. Reproducible quality (same inputs → same outputs)

**Does NOT add:**
- Reporting dashboards (business metric, not factory concern)
- Test coverage analysis (nice-to-have, not essential)
- Performance benchmarking (different concern)

**Constitutional Verdict:** Plan stays focused on factory needs

---

#### 6. Boundaries
**Critical Question:** Who does what?

**Proposed Boundaries:**

```
┌─────────────────────────────────────────────────────┐
│ execute-red                                          │
│ - Generate test files                                │
│ - Update registry (add to "new")                     │
│ - Run verification (baseline pass, new fail)         │
│ - STOP on verification failure                       │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ discriminate-red                                     │
│ - Static checks (coupling, stack, hallucination)     │
│ - ALSO run test verification (redundant is OK!)      │
│ - BLOCK on any failure                               │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ execute-green                                        │
│ - Generate implementation files                      │
│ - Run ALL tests, iterate until pass                  │
│ - Update registry (promote "new" → "baseline")       │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ discriminate-green                                   │
│ - Static checks (all 8 discriminators)               │
│ - ALSO run test verification (belt-and-suspenders)   │
│ - BLOCK on any failure                               │
└─────────────────────────────────────────────────────┘
```

**Why both execute AND discriminate run tests:**
- execute-* provides immediate feedback (agent can iterate)
- discriminate-* provides quality gate (blocks bad artifacts)
- Redundancy prevents defects slipping through
- For "industry grade software", double verification is warranted

**Clean Separation:**
- execute-* = generative actions (create files, run tests)
- discriminate-* = validation actions (check quality, block if bad)
- No overlap in responsibilities, only in verification methods

**Constitutional Verdict:** Boundaries are clean and justified

---

#### 7. Drift Detection
**Threat:** Baseline tests start failing over time (drift)

**Protection Mechanism:**
```
execute-red Step 1: ALWAYS verify baseline tests pass
│
├─ If pass: Proceed (baseline is clean)
│
└─ If fail: STOP IMMEDIATELY
   Report: "Baseline tests failing - codebase has drifted"
   Action: Human must fix before factory can continue
```

**Why this matters:**
- Factory assumes clean starting state
- If baseline broken, new tests might fail for wrong reasons
- Saves wasted tokens on doomed factory run

**Iterative Extension Scenario:**
```
Run 1: Add Feature A
  - baseline: [] (empty)
  - new: [test_feature_a.py]
  - After GREEN: baseline: [test_feature_a.py], new: []

Run 2: Add Feature B (same codebase)
  - baseline: [test_feature_a.py]
  - new: [test_feature_b.py]
  - Execute-red verifies test_feature_a still passes (drift check!)
  - After GREEN: baseline: [test_feature_a, test_feature_b], new: []

Run 3: Add Feature C
  - baseline: [test_feature_a, test_feature_b]
  - new: [test_feature_c.py]
  - Execute-red verifies A+B still pass
  - This catches regressions from Feature C implementation
```

**Constitutional Verdict:** Explicit drift detection at every iteration

---

#### 8. Verification
**Multi-Level Verification Strategy:**

**Level 1: Immediate (execute-red)**
```bash
# Agent runs these commands during execute-red:
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
# Expected: {"passed": N, "failed": 0}

python3 tests/run_all_tests_parallelized.py --new-only --json-output
# Expected: {"passed": 0, "failed": M}
```

**Level 2: Quality Gate (discriminate-red)**
```bash
# Discriminator runs same commands
# If results don't match expectations: BLOCK
# Double-checks execute-red didn't lie
```

**Level 3: Implementation Verification (execute-green)**
```bash
# After generating implementation:
python3 tests/run_all_tests_parallelized.py --json-output
# Expected: {"passed": N+M, "failed": 0}

# Agent iterates if failures detected
# Max iterations: Let Claude decide (it will naturally give up after 3-5 tries)
```

**Level 4: Final Gate (discriminate-green)**
```bash
# Final verification before promoting tests
# All 8 discriminators + test execution
# Last chance to catch issues
```

**Why 4 levels:**
- Immediate feedback (Level 1 & 3)
- Quality gates (Level 2 & 4)
- Prevents bad artifacts from propagating
- Aligns with "industry grade software" goal

**Constitutional Verdict:** Comprehensive verification throughout pipeline

---

## Simplified Registry Design

### Minimal Schema

```json
{
  "baseline": [
    "tests/integration/build_workflows.py",
    "tests/integration/frontend_workflows.py",
    "tests/integration/service_health.py",
    "tests/integration/api_workflows.py",
    "tests/integration/task_workflows.py",
    "tests/integration/runtime_workflows.py",
    "tests/e2e/smoke.py"
  ],
  "new": []
}
```

**That's it.** No metadata, no timestamps, no versioning.

**Rationale:**
- Agent only needs to know: baseline vs new
- Promotion is simple: `new` → `baseline`
- File creation date available from filesystem if needed
- YAGNI applies to all other fields

### Registry Operations

**Operation 1: Add New Tests (execute-red)**
```python
registry = json.loads(Path("tests/test-registry.json").read_text())
registry["new"].append("tests/integration/test_feature_x.py")
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

**Operation 2: Promote Tests (execute-green)**
```python
registry = json.loads(Path("tests/test-registry.json").read_text())
registry["baseline"].extend(registry["new"])
registry["new"] = []
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

**Operation 3: Query (test runner)**
```python
registry = json.loads(Path("tests/test-registry.json").read_text())
baseline_tests = registry["baseline"]
new_tests = registry["new"]
```

**Error Handling:**
- File missing: Create with current hardcoded tests as baseline
- JSON malformed: Fail with clear error, don't guess
- Empty lists: Valid state (no tests yet)

---

## Test Runner Modifications

### Minimal Change Principle

**Current State:** 250 lines, hardcoded test paths

**Proposed Change:** +50 lines, registry support

**New Methods:**

```python
def load_test_registry(self, registry_path="tests/test-registry.json"):
    """Load test registry from JSON file."""
    path = Path(registry_path)
    if not path.exists():
        return self._create_default_registry()

    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid registry JSON: {e}")
        sys.exit(1)

def _create_default_registry(self):
    """Return default registry with current hardcoded tests."""
    return {
        "baseline": [
            "tests/integration/build_workflows.py",
            "tests/integration/frontend_workflows.py",
            # ... all current hardcoded tests
        ],
        "new": []
    }

def run_baseline_tests_only(self, registry):
    """Run only baseline tests from registry."""
    baseline_tests = registry["baseline"]
    # Categorize into build vs runtime
    build = [t for t in baseline_tests if "build" in t or "frontend" in t]
    runtime = [t for t in baseline_tests if t not in build]

    # Use existing parallel execution logic
    return self.run_tests_parallel(build, runtime)

def run_new_tests_only(self, registry):
    """Run only newly added tests from registry."""
    new_tests = registry["new"]
    # Categorize into build vs runtime
    build = [t for t in new_tests if "build" in t or "frontend" in t]
    runtime = [t for t in new_tests if t not in build]

    return self.run_tests_parallel(build, runtime)

def output_json(self, results):
    """Output results in JSON format for agent consumption."""
    passed = sum(1 for _, success, _ in results if success)
    failed = sum(1 for _, success, _ in results if not success)

    return json.dumps({
        "passed": passed,
        "failed": failed,
        "total": passed + failed,
        "results": [
            {
                "name": name,
                "success": success,
                "output": output[:200]  # Truncate for brevity
            }
            for name, success, output in results
        ]
    }, indent=2)
```

**New CLI Flags:**

```python
parser.add_argument("--test-registry", default="tests/test-registry.json",
                   help="Path to test registry JSON file")
parser.add_argument("--baseline-only", action="store_true",
                   help="Run only baseline tests from registry")
parser.add_argument("--new-only", action="store_true",
                   help="Run only newly added tests from registry")
parser.add_argument("--json-output", action="store_true",
                   help="Output results in JSON format for agent parsing")
```

**Backward Compatibility:**
- No flags: Uses registry if exists, else defaults (current behavior)
- Existing scripts continue to work unchanged

---

## Command File Specifications

### execute-red.md (Updated)

```markdown
# Execute Red Phase

Generate failing test implementations from red phase tasks.

**Usage:** `/execute-red <red-phase.md>`

**Prerequisites:**
- red-phase.md exists and contains RED-XXX tasks
- Test registry at tests/test-registry.json (created if missing)

**Implementation Steps:**

## 1. Baseline Integrity Check
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: STOP with error "Baseline tests failing - fix before proceeding"
- If `passed == 0`: STOP with error "No baseline tests found"
- If `passed > 0 && failed == 0`: PROCEED

**Rationale:** Drift detection - ensure starting state is clean

## 2. Parse RED-XXX Tasks
- Read red-phase.md
- Extract all RED-XXX task blocks
- For each task, identify:
  - Test file path
  - Test framework (pytest, vitest, standalone)
  - Expected failure reason

## 3. Execute RED-SETUP Tasks
- Identify RED-SETUP tasks (infrastructure)
- Execute in order:
  - Database migrations: `cd src && python manage.py migrate`
  - Test fixtures: Create fixture files
  - Configuration: Update settings files

## 4. Generate Test Files
For each RED-XXX task:
- Create test file at specified path
- Generate test code that:
  - Imports required modules
  - Defines test function/class
  - Raises NotImplementedError or calls undefined function
  - Will fail when run
- Use existing test patterns from codebase (grep for similar tests)

## 5. Update Test Registry
```python
registry = json.loads(Path("tests/test-registry.json").read_text())
for test_path in newly_generated_tests:
    registry["new"].append(test_path)
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

## 6. Verify New Tests Fail
```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `passed > 0`: STOP with error "New tests should fail in RED phase"
- If `failed == 0`: STOP with error "No new tests were run"
- If `failed > 0 && passed == 0`: PROCEED

**Rationale:** Ensures tests are actually failing before implementation

## 7. Verify Baseline Unchanged
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: STOP with error "New tests broke existing tests"
- If `passed > 0 && failed == 0`: PROCEED

**Rationale:** Ensures new tests don't have side effects on baseline

## 8. Report Summary
Output:
- Number of new tests created: N
- Test files: [list of paths]
- Baseline integrity: ✅ PASS
- New tests failing: ✅ PASS (expected)
- Ready for discriminate-red phase

**Success Criteria:**
- ✅ Baseline tests pass (before adding new tests)
- ✅ N new test files created
- ✅ Registry updated with new tests
- ✅ New tests fail as expected
- ✅ Baseline tests still pass (after adding new tests)

**Failure Modes:**
- ❌ Baseline failing → Human intervention required
- ❌ New tests pass → Test generation error
- ❌ New tests broke baseline → Side effect detected
```

---

### execute-green.md (Updated)

```markdown
# Execute Green Phase

Generate minimal implementations from green phase tasks.

**Usage:** `/execute-green <green-phase.md>`

**Prerequisites:**
- green-phase.md exists and contains GREEN-XXX tasks
- Test registry contains new tests from RED phase
- All baseline tests pass

**Implementation Steps:**

## 1. Parse GREEN-XXX Tasks
- Read green-phase.md
- Extract all GREEN-XXX task blocks
- For each task, identify:
  - Implementation file path
  - Component to use (from architecture boundaries)
  - Minimal functionality required

## 2. Generate Implementation Files
For each GREEN-XXX task:
- Create implementation file at specified path
- Generate minimal code that:
  - Uses existing components (Django models, React components, etc.)
  - Implements ONLY what's needed to pass tests
  - Follows existing codebase patterns
- Use architecture boundaries to select components
- Copy patterns from similar existing code (grep for examples)

## 3. Execute GREEN-INT Tasks (if any)
- Integration tasks (connecting components)
- URL routing updates
- Settings configuration

## 4. Execute GREEN-CONFIG Tasks (if any)
- Configuration file updates
- Environment variable setup
- Static file handling

## 5. Run ALL Tests (MANDATORY)
```bash
python3 tests/run_all_tests_parallelized.py --json-output
```

**Parse JSON output:**
- If `failed > 0`:
  - Analyze failures: Read output from failed tests
  - Identify root cause: Implementation bug, missing dependency, etc.
  - Fix implementation: Update generated code
  - Re-run tests: Repeat until `failed == 0`
  - Max iterations: Let agent decide (typically 3-5 attempts)
  - If still failing after reasonable attempts: STOP and report failure

- If `passed > 0 && failed == 0`: PROCEED

**Iteration Example:**
```
Iteration 1: 12 passed, 3 failed
  Analysis: Missing import statement in api_views.py
  Fix: Add import
Iteration 2: 14 passed, 1 failed
  Analysis: Incorrect URL pattern
  Fix: Update urls.py
Iteration 3: 15 passed, 0 failed
  PROCEED
```

**Rationale:** Implementation must pass all tests before promotion

## 6. Verify Test Coverage
```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: STOP with error "New tests still failing"
- If `passed > 0 && failed == 0`: PROCEED

**Rationale:** Confirms new feature is implemented correctly

## 7. Generate Data Plane Current State (if applicable)
```bash
# If data-plane-target.yaml exists in specs/
cd src && python -c "
import django
django.setup()
from django.apps import apps
# ... introspect models
# Write to specs/data-plane-current.yaml
"
```

## 8. Check Data Plane Alignment (if applicable)
```bash
# If data-plane-target.yaml exists
python3 .lsf/scripts/python/compare_data_plane.py \
  specs/data-plane-target.yaml \
  specs/data-plane-current.yaml
```

**If misaligned:** Report differences but don't block (migrations might be pending)

## 9. Promote New Tests to Baseline
```python
registry = json.loads(Path("tests/test-registry.json").read_text())
registry["baseline"].extend(registry["new"])
registry["new"] = []
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

**Rationale:** Tests now part of baseline for next iteration

## 10. Report Summary
Output:
- Implementation files created: N
- All tests passing: ✅ (baseline + new)
- Tests promoted to baseline: M tests
- Data plane status: ✅ ALIGNED (if applicable)
- Ready for discriminate-green phase

**Success Criteria:**
- ✅ Implementation files created
- ✅ ALL tests pass (baseline + new)
- ✅ New tests promoted to baseline
- ✅ Registry updated
- ✅ Data plane aligned (if applicable)

**Failure Modes:**
- ❌ Tests still failing after iterations → Implementation incomplete
- ❌ Data plane misaligned → Missing migrations
```

---

### discriminate-red.md (Updated)

```markdown
# Red Phase Discrimination

Validate red phase artifacts for constitutional compliance before implementation.

**Usage:** `/discriminate-red <red-phase.md>`

**Purpose:** Quality gate - blocks progression if RED phase invalid

**Implementation:**

## 1. Static Checks (Existing)
Run in order, fail-fast on CRITICAL/ERROR:

### Check 1: Test-Code Coupling
```bash
python3 .lsf/scripts/python/coupling_check.py specs/red-phase.md
```
- Validates: Tests fail for correct reasons
- Block on: Tests coupled to implementation details

### Check 2: Stack Contamination
```bash
python3 .lsf/scripts/python/stack_check.py specs/red-phase.md
```
- Validates: pytest for backend, Vitest for frontend
- Block on: Wrong test framework for stack layer

### Check 3: Hallucination Prevention
```bash
python3 .lsf/scripts/python/hallucination_check.py specs/red-phase.md
```
- Validates: Test targets will exist after GREEN phase
- Block on: Tests for non-existent components

## 2. Dynamic Verification (NEW - MANDATORY)

### Verification 1: Baseline Integrity
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK with "Baseline tests failing"
- Include failed test names in violation report

### Verification 2: New Tests Fail
```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `passed > 0`: BLOCK with "New tests passing in RED phase (should fail)"
- Include passing test names in violation report

### Verification 3: Isolation Check
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output (2nd run):**
- If `failed > 0`: BLOCK with "New tests broke baseline tests"
- Include broken test names in violation report

## 3. Aggregate Results

**PASS Criteria:**
- All static checks pass (no CRITICAL/ERROR)
- Baseline tests pass (before and after)
- New tests fail as expected
- Warnings allowed but reported

**BLOCK Criteria:**
- Any CRITICAL or ERROR from static checks
- Any baseline test failing
- Any new test passing
- Any baseline test broken by new tests

## 4. Output Structured Report

```json
{
  "result": "PASS" | "BLOCKED",
  "static_checks": {
    "coupling": {"passed": true, "violations": []},
    "stack": {"passed": true, "violations": []},
    "hallucination": {"passed": true, "violations": []}
  },
  "dynamic_verification": {
    "baseline_integrity": {
      "passed": true,
      "baseline_tests_passed": 12,
      "baseline_tests_failed": 0
    },
    "new_tests_fail": {
      "passed": true,
      "new_tests_passed": 0,
      "new_tests_failed": 5
    },
    "isolation": {
      "passed": true,
      "baseline_tests_passed": 12,
      "baseline_tests_failed": 0
    }
  },
  "summary": "All checks passed. Ready for GREEN phase."
}
```

**Constitutional Alignment:**
- **Verification**: Executes actual tests, not just static analysis
- **Boundaries**: Clear separation - discriminate validates, doesn't generate
- **Drift Detection**: Baseline check catches regressions
```

---

### discriminate-green.md (Updated)

```markdown
# Green Phase Discrimination

Validate green phase artifacts for constitutional compliance before finalization.

**Usage:** `/discriminate-green <green-phase.md>`

**Purpose:** Final quality gate - ensures implementation is production-ready

**Implementation:**

## 1. Static Checks (Existing - All 8)

Run in priority order, fail-fast on CRITICAL/ERROR:

1. Hallucination Prevention
2. Stack Contamination
3. Incomplete Implementation
4. Context Drift
5. Test-Code Coupling
6. Pattern Consistency
7. Dependency Explosion
8. Over-Engineering

*(Existing discriminator scripts - not changing)*

## 2. Comprehensive Test Verification (NEW - MANDATORY)

### Verification 1: All Tests Pass
```bash
python3 tests/run_all_tests_parallelized.py --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK with "Implementation incomplete - tests failing"
- Include failed test names and output in violation report
- Agent should return to execute-green to fix

### Verification 2: Feature Coverage
```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK with "New feature tests failing"
- If `passed == 0`: BLOCK with "No new tests executed"

### Verification 3: No Regressions
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK with "Implementation broke existing tests"
- This should be redundant (caught in Verification 1) but belt-and-suspenders

## 3. Data Plane Verification (if applicable)

```bash
# If data-plane-target.yaml exists
python3 .lsf/scripts/python/compare_data_plane.py \
  specs/data-plane-target.yaml \
  specs/data-plane-current.yaml \
  --json-output
```

**Parse JSON output:**
- If `aligned == false`: WARNING (not blocking) - report differences
- Migrations might be pending, don't block on this

## 4. Aggregate Results

**PASS Criteria:**
- All 8 static discriminators pass (no CRITICAL/ERROR)
- ALL tests pass (baseline + new)
- Data plane aligned or acceptable differences

**BLOCK Criteria:**
- Any CRITICAL or ERROR from static checks
- Any test failing
- Unacceptable data plane misalignment

**WARNING Criteria:**
- Minor data plane differences
- Pending migrations
- Style violations (non-blocking)

## 5. Output Comprehensive Report

```json
{
  "result": "PASS" | "BLOCKED" | "WARNING",
  "static_checks": {
    "hallucination": {"passed": true},
    "stack": {"passed": true},
    // ... all 8
  },
  "dynamic_verification": {
    "all_tests": {
      "passed": true,
      "total_passed": 17,
      "total_failed": 0
    },
    "feature_coverage": {
      "passed": true,
      "new_tests_passed": 5
    },
    "no_regressions": {
      "passed": true,
      "baseline_tests_passed": 12
    }
  },
  "data_plane": {
    "aligned": true,
    "differences": []
  },
  "summary": "All checks passed. Implementation ready for production."
}
```

**Constitutional Alignment:**
- **Verification**: Comprehensive - static + dynamic
- **Quality**: Industry-grade software requires all checks passing
- **Fail-Fast**: First failure blocks entire pipeline
```

---

## Edge Cases & Failure Handling

### 1. Registry File Corruption

**Scenario:** JSON file has syntax errors

**Detection:**
```python
try:
    registry = json.loads(path.read_text())
except json.JSONDecodeError as e:
    print(f"FATAL: Registry corrupted at {path}")
    print(f"Error: {e}")
    sys.exit(1)
```

**Recovery:** Manual fix required (factory cannot proceed with corrupted registry)

**Prevention:** Atomic writes, backup before modification

---

### 2. Baseline Tests Already Failing

**Scenario:** Codebase has regressions, baseline broken

**Detection:** execute-red Step 1 catches this

**Action:**
```
STOP factory run
Report to user: "Baseline integrity check failed"
List failing tests: ["test_api_workflows.py::test_user_creation"]
Message: "Fix baseline tests before running factory"
```

**Why STOP:**
- Can't distinguish new failures from existing failures
- Wastes tokens trying to fix pre-existing issues
- Violates **Drift Detection** principle

---

### 3. New Tests Pass in RED Phase

**Scenario:** Agent generated tests that pass immediately (no NotImplementedError)

**Detection:** execute-red Step 6

**Action:**
```
STOP factory run
Report to agent: "RED phase violation - tests should fail"
List passing tests: ["tests/integration/test_feature_x.py::test_new_endpoint"]
Suggestion: "Add NotImplementedError or call undefined function in tests"
```

**Why STOP:**
- Violates TDD principle
- Tests might be testing wrong thing
- Blocks discriminate-red (will also catch this)

---

### 4. Tests Fail After Multiple GREEN Iterations

**Scenario:** Agent tries 5+ times to fix implementation, tests still failing

**Detection:** execute-green Step 5 (agent self-monitors)

**Action:**
```
STOP GREEN phase (agent decision)
Report to factory: "Implementation failed after N iterations"
Failing tests: [...]
Last error: "..."
```

**Factory Response:**
```
Mark factory run as FAILED
Save state (partial implementation exists)
Report to user: "Implementation incomplete - manual intervention needed"
```

**Why allow iterations:**
- Small fixes (typos, imports) should auto-correct
- Agent is smart enough to try a few approaches

**Why eventually stop:**
- Prevents infinite loops
- Some failures require human insight
- Constitutional **Minimalism**: Don't over-engineer agent fixes

---

### 5. Docker Services Won't Start

**Scenario:** `docker compose up` fails

**Detection:** Test runner already handles this

**Current Behavior:**
```python
if not runner.start_services():
    print("❌ Failed to start services for runtime tests")
    return 1
```

**Factory Impact:**
- execute-red / execute-green will report test runner exit code 1
- Discriminators will see test failures
- Factory will BLOCK

**User Action Required:** Fix Docker environment

---

### 6. Test Takes Too Long (Timeout)

**Scenario:** Test hangs for >300 seconds

**Detection:** Test runner timeout mechanism

**Action:**
```python
try:
    result = subprocess.run(cmd, timeout=timeout)
except subprocess.TimeoutExpired:
    return 1, "", f"Command timed out after {timeout} seconds"
```

**Factory Response:**
- Treat as test failure
- Report to agent: "Test timed out"
- Agent can adjust test or increase timeout

---

### 7. Registry Promotion Fails Mid-Operation

**Scenario:** Disk full, write fails during promotion

**Current Risk:**
```python
# Risky: Not atomic
registry["baseline"].extend(registry["new"])
registry["new"] = []
Path("tests/test-registry.json").write_text(...)  # Fails here
# Now registry is in inconsistent state
```

**Better Implementation:**
```python
# Atomic write pattern
import tempfile
import shutil

# Prepare new registry
new_registry = registry.copy()
new_registry["baseline"].extend(new_registry["new"])
new_registry["new"] = []

# Write to temp file first
temp_path = Path(tempfile.mktemp(suffix=".json"))
temp_path.write_text(json.dumps(new_registry, indent=2))

# Atomic move (os.rename is atomic on POSIX)
shutil.move(str(temp_path), "tests/test-registry.json")
```

**Constitutional Alignment:**
- **Verification**: Atomic operations prevent corruption
- **Reasonable Defaults**: Standard tempfile pattern

---

## Iterative Extension Scenarios

### Scenario 1: Add Feature to Existing Codebase

**Starting State:**
```json
{
  "baseline": [
    "tests/integration/test_feature_a.py",
    "tests/integration/test_feature_b.py"
  ],
  "new": []
}
```

**Factory Run: Add Feature C**

1. execute-red:
   - Baseline check: tests A+B pass ✅
   - Generate: test_feature_c.py
   - Registry: `"new": ["tests/integration/test_feature_c.py"]`
   - Verify: test C fails ✅, tests A+B still pass ✅

2. execute-green:
   - Implement feature C
   - All tests pass ✅ (A+B+C)
   - Promote: `"baseline": [A, B, C], "new": []`

**End State:**
```json
{
  "baseline": [
    "tests/integration/test_feature_a.py",
    "tests/integration/test_feature_b.py",
    "tests/integration/test_feature_c.py"
  ],
  "new": []
}
```

---

### Scenario 2: Modify Existing Feature

**User Request:** "Modify Feature A to add new capability"

**Factory Run:**

1. spec-to-requirements:
   - New REQ-XXX references Feature A enhancement

2. requirements-to-red:
   - Might ADD new tests for new capability
   - Might MODIFY existing test_feature_a.py (edge case!)

**Challenge:** How do we handle test modification vs addition?

**Solution for MVP:**
- Treat as NEW test (duplicate test file)
- Original test_feature_a.py stays in baseline
- New test_feature_a_enhanced.py in "new"
- After GREEN: both in baseline
- Future enhancement: Detect duplicates, merge tests

**Constitutional Alignment:**
- **Minimalism**: Don't over-engineer test merging yet
- **Verification**: Both old and new tests must pass

---

### Scenario 3: Fix Regression (Baseline Test Failing)

**Starting State:**
```json
{
  "baseline": [
    "tests/integration/test_feature_a.py",  // This one is failing
    "tests/integration/test_feature_b.py"
  ],
  "new": []
}
```

**Factory Run Attempt:**

1. execute-red Step 1:
   - Baseline check: test A fails ❌
   - STOP: "Baseline integrity check failed"

**User Action Required:**
```
Option 1: Fix manually
  - Debug why test A is failing
  - Fix code
  - Verify tests pass
  - Re-run factory

Option 2: Remove from baseline (risky!)
  - Edit registry: remove test_feature_a.py
  - Factory can proceed
  - But you lose test coverage

Option 3: Update spec to include fix
  - Add to spec: "Fix Feature A regression"
  - Factory generates new test + fix
```

**Recommended:** Option 1 (manual fix)

**Constitutional Alignment:**
- **Drift Detection**: Factory refuses to proceed with broken baseline
- **Verification**: Must maintain quality bar

---

## Constitutional Compliance Summary

| Principle | How Plan Addresses It |
|-----------|----------------------|
| **Context Efficiency** | Registry JSON is 20 lines vs 250 lines of Python. Agents read minimal data. |
| **Minimalism** | Registry is simplest solution (vs pytest markers, git, file naming). Only 2 fields. |
| **Reasonable Defaults** | Test runner enhancement, not rewrite. Backward compatible. Uses existing patterns. |
| **Agent-Centric** | JSON for data, markdown for instructions. Structured output (--json-output flag). |
| **Focus** | Pure software production concern. No business metrics, dashboards, or reporting. |
| **Boundaries** | Clean: execute=generate, discriminate=validate. No overlap except verification (justified). |
| **Drift Detection** | Baseline check at every RED phase. Catches regressions before wasting tokens. |
| **Verification** | 4-level verification: immediate + gates. Tests actually run, not just generated. |

---

## Implementation Sequence

### Phase A: Test Runner Enhancement (No Breaking Changes)
1. Add `load_test_registry()` method
2. Add `--baseline-only`, `--new-only` flags
3. Add `--json-output` flag
4. Create default registry generator
5. Test backward compatibility

### Phase B: Command File Updates (Agent Instructions)
1. Update execute-red.md
2. Update execute-green.md
3. Update discriminate-red.md
4. Update discriminate-green.md

### Phase C: Initial Registry Creation
1. Create tests/test-registry.json with current tests as baseline
2. Commit to repo

### Phase D: End-to-End Validation
1. Create minimal human spec (simple feature)
2. Run factory manually through RED+GREEN phases
3. Verify registry updates correctly
4. Verify all verification steps work
5. Verify discriminators block bad artifacts

### Phase E: Edge Case Testing
1. Test baseline failing scenario
2. Test new tests passing scenario
3. Test promotion mechanism
4. Test Docker failures
5. Test registry corruption

---

## Success Metrics

**After implementation, the factory should:**

✅ Refuse to run if baseline tests failing (drift protection)
✅ Generate only failing tests in RED phase
✅ Verify new tests don't break baseline
✅ Iterate on implementation until tests pass in GREEN phase
✅ Promote tests atomically after GREEN success
✅ Provide structured output for agent consumption
✅ Block progression at discriminator gates if quality insufficient
✅ Support iterative extension (multiple factory runs on same codebase)
✅ Maintain clean registry state across runs
✅ Fail gracefully with actionable error messages

**NOT in scope (future enhancements):**
- Test merging (when modifying existing tests)
- Performance regression detection
- Coverage analysis
- Test parallelization optimization
- Test result caching
- Incremental test runs (only run changed tests)

These are deliberately excluded per **Minimalism** principle.
