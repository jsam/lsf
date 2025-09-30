# Detailed Test Integration Plan - E2E First Strategy

## Executive Summary

**Core Principle: Test Reality, Not Simulation**

- **Backend**: Integration tests against Dockerized services (90%) + unit tests for algorithms (10%)
- **Frontend**: Playwright E2E tests against real app (90%) + unit tests for utils (10%)
- **No mocked component/integration tests** - eliminates mock complexity entirely

---

## Constitutional Alignment Analysis

### 1. Context Efficiency

**Backend Testing:**
- Integration test: ~20 lines (HTTP request → assert response)
- Unit test with mocks: ~80 lines (mock setup + test + assertions)
- **Reduction: 75%**

**Frontend Testing:**
- E2E test: ~20 lines (browser actions → assert UI state)
- Component test with mocks: ~120 lines (provider setup + router mocks + mock hooks + test)
- **Reduction: 83%**

**Registry approach:**
- Test runner hardcoded paths: 250 lines to parse
- JSON registry: 20 lines to read
- **Reduction: 92%**

**Constitutional Verdict:** Triple win on context efficiency

---

### 2. Minimalism

**Testing Pyramid Traditional:**
```
       /\
      /E2E\        ← Few (slow, flaky)
     /─────\
    /Integ.\      ← Some
   /────────\
  /Unit+Mock\     ← Many (complex mock setup)
 /──────────\
```

**Testing Strategy Proposed:**
```
       /\
      /E2E\        ← Primary (fast enough, reliable)
     /─────\
    /Utils.\      ← Only pure functions
   /────────\
```

**Why this is SIMPLER:**
- No mock libraries to learn
- No mock maintenance burden
- No mock/reality divergence debugging
- Fewer total test files
- Less code overall

**Example comparison:**

| Aspect | E2E/Integration-First | Traditional Mock-Heavy |
|--------|----------------------|------------------------|
| Test files | 20 | 50 |
| Total lines of code | 600 | 2500 |
| Mock definitions | 0 | 200+ |
| Provider wrappers | 0 | 30+ |
| Complexity | Low | High |

**Constitutional Verdict:** E2E-first is dramatically simpler

---

### 3. Reasonable Defaults

**What we already have:**
- ✅ Docker Compose configured (`src/docker-compose.yml`)
- ✅ Test runner managing Docker lifecycle
- ✅ Parallel execution infrastructure
- ✅ React app with dev server
- ✅ API already returns JSON

**What we'd need to add for mock-heavy:**
- ❌ Mock library setup (MSW, nock, etc.)
- ❌ Mock service workers
- ❌ Test provider wrappers
- ❌ Fixture factories
- ❌ Mock context providers

**Constitutional Verdict:** Use what exists (Docker + real services)

---

### 4. Agent-Centric Content

**What's easier for an LLM to generate?**

**Backend Integration Test:**
```python
def test_user_registration():
    response = requests.post('http://localhost:8000/api/users/', {
        'email': 'test@example.com',
        'password': 'secure123'
    })
    assert response.status_code == 201
```
**Agent needs to know:** requests library, HTTP methods, assertions

---

**Frontend E2E Test:**
```javascript
test('user registration', async ({ page }) => {
  await page.goto('http://localhost:3000/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'secure123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
});
```
**Agent needs to know:** Playwright API, browser actions, assertions

---

**Frontend Component Test with Mocks (what we're AVOIDING):**
```javascript
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../api/users', () => ({ useRegisterUser: vi.fn() }));
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

test('registration', async () => {
  const mockRegister = vi.fn().mockResolvedValue({ id: 1 });
  useRegisterUser.mockReturnValue({
    mutate: mockRegister,
    isLoading: false,
    isError: false
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <RegistrationForm />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  // ... 50 more lines
});
```
**Agent needs to know:** React Testing Library, Vitest mocking, QueryClient, MemoryRouter, context providers, async mocking, module mocking, partial imports...

**Cognitive load comparison:** E2E ≈ 3 concepts, Mocked ≈ 15+ concepts

**Constitutional Verdict:** E2E is FAR more agent-friendly

---

### 5. Focus (Software Production)

**What matters for business applications?**
- ✅ Features work end-to-end
- ✅ Users can complete workflows
- ✅ Data persists correctly
- ✅ APIs integrate properly
- ✅ UI displays correctly in real browser

**What matters less?**
- ❌ Component renders correctly in JSDOM (not real browser)
- ❌ Mock matches real API signature
- ❌ Function was called with exact arguments

**E2E/Integration tests verify what matters.**

**Constitutional Verdict:** E2E aligns with factory goal (produce working software)

---

### 6. Verification

**Multi-level verification with E2E/Integration:**

**Backend Integration Test verifies:**
- Real HTTP request ✅
- Real routing ✅
- Real middleware (auth, CORS, etc.) ✅
- Real database transaction ✅
- Real serialization ✅
- Real validation ✅
- Real business logic ✅

**Frontend E2E Test verifies:**
- Real browser rendering ✅
- Real JavaScript execution ✅
- Real API calls ✅
- Real routing ✅
- Real state management ✅
- Real user interactions ✅
- Real CSS/layout ✅

**Traditional unit test with mocks verifies:**
- Mock setup is correct ❓
- Code would work IF mocks match reality ❓

**Constitutional Verdict:** E2E provides actual verification, not simulated

---

## Simplified Test Registry Design

### Minimal Schema (Updated for Frontend)

```json
{
  "baseline": {
    "backend_integration": [
      "tests/integration/api_workflows.py",
      "tests/integration/task_workflows.py",
      "tests/integration/runtime_workflows.py"
    ],
    "backend_unit": [
      "tests/unit/test_calculations.py"
    ],
    "frontend_e2e": [
      "tests/e2e/frontend/user-workflows.spec.js",
      "tests/e2e/frontend/admin-workflows.spec.js"
    ],
    "frontend_unit": [
      "src/frontend/tests/unit/formatCurrency.test.js",
      "src/frontend/tests/unit/validators.test.js"
    ]
  },
  "new": {
    "backend_integration": [],
    "backend_unit": [],
    "frontend_e2e": [],
    "frontend_unit": []
  }
}
```

**That's it.** Still minimal. Just categorized by test type.

**Rationale:**
- Need to know which runner to use (pytest vs playwright vs vitest)
- Need to track new vs baseline within each category
- Still no timestamps, versions, metadata (YAGNI)

---

### Registry Operations (Updated)

**Operation 1: Add New Backend Integration Test**
```python
registry = json.loads(Path("tests/test-registry.json").read_text())
registry["new"]["backend_integration"].append("tests/integration/test_feature_x.py")
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

**Operation 2: Add New Frontend E2E Test**
```python
registry = json.loads(Path("tests/test-registry.json").read_text())
registry["new"]["frontend_e2e"].append("tests/e2e/frontend/feature-x.spec.js")
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

**Operation 3: Promote All New Tests**
```python
registry = json.loads(Path("tests/test-registry.json").read_text())

# Promote all categories
for category in ["backend_integration", "backend_unit", "frontend_e2e", "frontend_unit"]:
    registry["baseline"][category].extend(registry["new"][category])
    registry["new"][category] = []

Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

---

## Test Runner Modifications

### New Test Execution Methods

```python
def run_frontend_e2e_tests(self):
    """Execute frontend E2E tests with Playwright."""
    print("Starting: Frontend E2E Tests")

    e2e_dir = Path("tests/e2e/frontend")
    if not e2e_dir.exists():
        return "Frontend E2E Tests", True, "No E2E tests directory (OK for Phase 1)"

    # Check for test files
    test_files = list(e2e_dir.glob("*.spec.js")) + list(e2e_dir.glob("*.spec.ts"))
    if not test_files:
        return "Frontend E2E Tests", True, "No E2E test files (OK)"

    # Ensure backend services running (E2E needs API)
    if not self.check_services_running():
        print("Backend services not running, starting...")
        if not self.start_services():
            return "Frontend E2E Tests", False, "Failed to start backend services"

    # Check if frontend dev server is running
    frontend_running = self._check_frontend_running()
    if not frontend_running:
        return "Frontend E2E Tests", False, "Frontend dev server not running. Start with: cd src/frontend && npm run dev"

    # Run Playwright tests
    returncode, stdout, stderr = self.run_command(
        "cd tests/e2e/frontend && npx playwright test --reporter=json",
        timeout=600  # E2E tests can be slower
    )

    success = returncode == 0
    output = stdout if success else stderr

    print(f"{'✅' if success else '❌'} Frontend E2E Tests: {'PASSED' if success else 'FAILED'}")
    return "Frontend E2E Tests", success, output

def run_frontend_unit_tests(self):
    """Execute frontend unit tests with Vitest (utils only)."""
    print("Starting: Frontend Unit Tests")

    unit_dir = Path("src/frontend/tests/unit")
    if not unit_dir.exists():
        return "Frontend Unit Tests", True, "No frontend unit tests (OK)"

    # These are fast, no Docker needed
    returncode, stdout, stderr = self.run_command(
        "cd src/frontend && npm run test:unit -- --reporter=json",
        timeout=60
    )

    success = returncode == 0
    output = stdout if success else stderr

    print(f"{'✅' if success else '❌'} Frontend Unit Tests: {'PASSED' if success else 'FAILED'}")
    return "Frontend Unit Tests", success, output

def _check_frontend_running(self):
    """Check if frontend dev server is accessible."""
    try:
        result = subprocess.run(
            "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000",
            shell=True,
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout.strip() == "200"
    except:
        return False

def run_backend_integration_tests(self, test_paths):
    """Run backend integration tests from registry."""
    if not test_paths:
        return []

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = [
            executor.submit(self.run_test, Path(path).stem, path)
            for path in test_paths
        ]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]

    return results

def run_registry_based_tests(self, mode="all"):
    """
    Run tests based on registry.

    mode: "all", "baseline-only", "new-only"
    """
    registry = self.load_test_registry()

    if mode == "baseline-only":
        test_sets = registry["baseline"]
    elif mode == "new-only":
        test_sets = registry["new"]
    else:  # "all"
        test_sets = {
            category: registry["baseline"][category] + registry["new"][category]
            for category in registry["baseline"].keys()
        }

    all_results = []

    # Run backend integration tests
    if test_sets.get("backend_integration"):
        results = self.run_backend_integration_tests(test_sets["backend_integration"])
        all_results.extend(results)

    # Run backend unit tests
    if test_sets.get("backend_unit"):
        # Run pytest on specific files
        for test_path in test_sets["backend_unit"]:
            result = self.run_test(Path(test_path).stem, test_path)
            all_results.append(result)

    # Run frontend E2E tests
    if test_sets.get("frontend_e2e"):
        # Playwright runs all specs in directory
        # For now, run all or none (can't easily filter specific files)
        if test_sets["frontend_e2e"]:
            result = self.run_frontend_e2e_tests()
            all_results.append(result)

    # Run frontend unit tests
    if test_sets.get("frontend_unit"):
        # Vitest can run specific files
        for test_path in test_sets["frontend_unit"]:
            returncode, stdout, stderr = self.run_command(
                f"cd src/frontend && npm run test:unit -- {test_path}"
            )
            success = returncode == 0
            all_results.append((Path(test_path).stem, success, stdout if success else stderr))

    return all_results
```

### Updated CLI Flags

```python
parser.add_argument("--test-registry", default="tests/test-registry.json",
                   help="Path to test registry JSON file")
parser.add_argument("--baseline-only", action="store_true",
                   help="Run only baseline tests from registry")
parser.add_argument("--new-only", action="store_true",
                   help="Run only newly added tests from registry")
parser.add_argument("--category", choices=["backend_integration", "backend_unit",
                                           "frontend_e2e", "frontend_unit"],
                   help="Run only tests from specific category")
parser.add_argument("--json-output", action="store_true",
                   help="Output results in JSON format for agent parsing")
```

### Updated Main Function

```python
def main():
    parser = argparse.ArgumentParser(description="Parallelized test runner")
    parser.add_argument("--build-only", action="store_true", help="Run only build tests")
    parser.add_argument("--runtime-only", action="store_true", help="Run only runtime tests")
    parser.add_argument("--keep-running", action="store_true", help="Keep services running")

    # NEW: Registry-based execution
    parser.add_argument("--baseline-only", action="store_true", help="Run only baseline tests")
    parser.add_argument("--new-only", action="store_true", help="Run only new tests")
    parser.add_argument("--category", help="Run specific category")
    parser.add_argument("--json-output", action="store_true", help="JSON output for agents")

    args = parser.parse_args()

    runner = TestRunner()

    # Registry-based execution (NEW)
    if args.baseline_only or args.new_only:
        mode = "baseline-only" if args.baseline_only else "new-only"
        all_results = runner.run_registry_based_tests(mode=mode)

        if args.json_output:
            print(runner.output_json(all_results))
            return 0 if all([r[1] for r in all_results]) else 1
        else:
            return runner.print_summary(all_results)

    # Original execution (for backward compatibility)
    # ... existing code
```

---

## Command File Specifications

### execute-red.md (Updated for E2E)

```markdown
# Execute Red Phase

Generate failing test implementations from red phase tasks.

**Usage:** `/execute-red <red-phase.md>`

**Prerequisites:**
- red-phase.md exists and contains RED-XXX tasks
- Test registry at tests/test-registry.json (created if missing)
- Docker services for backend tests
- Frontend dev server for E2E tests

**Implementation Steps:**

## 1. Ensure Services Running

**Backend services (always needed):**
```bash
if ! docker ps | grep -q "django_web"; then
    cd src && docker compose up -d
    sleep 30  # Wait for services to be ready
fi
```

**Frontend dev server (if RED tasks include frontend):**
```bash
# Check if frontend server running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "NOTICE: Frontend dev server not running"
    echo "Start with: cd src/frontend && npm run dev"
    echo "Or run in background: cd src/frontend && npm run dev &"
fi
```

## 2. Baseline Integrity Check

```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: STOP with error "Baseline tests failing - fix before proceeding"
- List failing test names
- If `passed == 0` and baseline not empty: ERROR "No baseline tests executed"
- If `passed > 0 && failed == 0`: PROCEED

**Rationale:** Drift detection - ensure starting state is clean

## 3. Parse RED-XXX Tasks

Read red-phase.md and extract all RED-XXX task blocks.

For each task, identify:
- Test type: backend_integration, backend_unit, frontend_e2e, frontend_unit
- Test file path
- Test framework (pytest, playwright, vitest)
- Expected failure reason

## 4. Execute RED-SETUP Tasks (if any)

- Database migrations: `cd src && python manage.py migrate`
- Test fixtures: Create fixture files
- Configuration: Update settings files

## 5. Generate Test Files

### For Backend Integration Tests:
```python
# tests/integration/test_feature_x.py
import requests
import pytest

@pytest.mark.django_db(transaction=True)
def test_feature_x_endpoint():
    """Test feature X API endpoint"""
    response = requests.post('http://localhost:8000/api/feature-x/', {
        'data': 'example'
    })
    # Will fail: NotImplementedError or 404
    assert response.status_code == 201
    assert 'id' in response.json()
```

### For Frontend E2E Tests:
```javascript
// tests/e2e/frontend/feature-x.spec.js
import { test, expect } from '@playwright/test';

test('user can use feature X', async ({ page }) => {
  // Navigate
  await page.goto('http://localhost:3000/feature-x');

  // Interact
  await page.fill('[name="input"]', 'test data');
  await page.click('button[type="submit"]');

  // Will fail: feature not implemented
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### For Unit Tests (rare):
```python
# tests/unit/test_calculations.py
def test_complex_calculation():
    result = complex_calculation(10, 20)
    # Will fail: NotImplementedError
    assert result == 200
```

**Use existing patterns:**
- Grep for similar tests: `grep -r "test_.*_endpoint" tests/integration/`
- Copy structure, modify for new feature

## 6. Update Test Registry

```python
registry = json.loads(Path("tests/test-registry.json").read_text())

# Categorize and add each new test
for test_info in newly_generated_tests:
    category = test_info['category']  # backend_integration, frontend_e2e, etc.
    path = test_info['path']
    registry["new"][category].append(path)

# Write atomically
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

## 7. Verify New Tests Fail

```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `passed > 0`: STOP with error "New tests should fail in RED phase"
- List passing test names (these are malformed)
- If `failed == 0`: STOP with error "No new tests were executed"
- If `failed > 0 && passed == 0`: PROCEED

**Rationale:** Ensures tests actually test something (not vacuous)

## 8. Verify Baseline Unchanged

```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: STOP with error "New tests broke existing tests"
- List newly failing baseline tests
- If `passed > 0 && failed == 0`: PROCEED

**Rationale:** Ensures test isolation - new tests don't pollute baseline

## 9. Report Summary

Output:
```
RED Phase Complete:
  New tests created: 5
    - Backend integration: 3 tests
    - Frontend E2E: 2 tests

  Test files:
    - tests/integration/test_feature_x.py
    - tests/integration/test_feature_y.py
    - tests/e2e/frontend/feature-x.spec.js
    - tests/e2e/frontend/feature-y.spec.js

  Verification:
    ✅ Baseline integrity: 25 tests passing
    ✅ New tests failing: 5 tests (as expected)
    ✅ Baseline unchanged: Still 25 tests passing

  Registry updated: tests/test-registry.json

  Ready for: discriminate-red phase
```

**Success Criteria:**
- ✅ Backend services running (if needed)
- ✅ Frontend server running (if E2E tests)
- ✅ Baseline tests pass (before adding new tests)
- ✅ N new test files created
- ✅ Registry updated with new tests
- ✅ New tests fail as expected
- ✅ Baseline tests still pass (test isolation confirmed)

**Failure Modes:**
- ❌ Baseline failing → Human intervention required (drift detected)
- ❌ New tests pass → Test generation error (not testing anything)
- ❌ New tests broke baseline → Side effects detected (bad test design)
- ❌ Services not running → Start services or report to user
```

---

### execute-green.md (Updated for E2E)

```markdown
# Execute Green Phase

Generate minimal implementations from green phase tasks.

**Usage:** `/execute-green <green-phase.md>`

**Prerequisites:**
- green-phase.md exists and contains GREEN-XXX tasks
- Test registry contains new tests from RED phase
- All baseline tests pass
- Services running (backend + frontend if E2E tests)

**Implementation Steps:**

## 1. Ensure Services Running

Same as execute-red Step 1.

## 2. Parse GREEN-XXX Tasks

Read green-phase.md and extract all GREEN-XXX task blocks.

For each task, identify:
- Implementation type: backend (Django), frontend (React), or both
- Implementation file path
- Component to use (from architecture boundaries)
- Minimal functionality required

## 3. Generate Implementation Files

### For Backend (Django):
```python
# src/api/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def feature_x_endpoint(request):
    """Feature X endpoint - minimal implementation"""
    # Use existing components (Django models, serializers)
    data = request.data

    # Minimal validation
    if not data.get('required_field'):
        return Response({'error': 'Missing field'}, status=status.HTTP_400_BAD_REQUEST)

    # Minimal logic to pass tests
    result = {'id': 1, 'status': 'created'}
    return Response(result, status=status.HTTP_201_CREATED)
```

### For Frontend (React):
```javascript
// src/frontend/src/pages/FeatureX.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FeatureX() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Minimal implementation to pass E2E test
    const response = await fetch('http://localhost:8000/api/feature-x/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: input })
    });

    if (response.ok) {
      // Show success (E2E test checks for this)
      document.querySelector('.success-message').style.display = 'block';
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="input" value={input} onChange={e => setInput(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
      <div className="success-message" style={{display: 'none'}}>Success!</div>
    </div>
  );
}
```

**Use architecture boundaries:**
- Backend: Django ORM, DRF decorators, existing serializers
- Frontend: Existing components, fetch API, React hooks

**Copy existing patterns:**
```bash
# Find similar implementations
grep -r "@api_view" src/api/
grep -r "export default function" src/frontend/src/pages/
```

## 4. Execute GREEN-INT Tasks (if any)

Integration tasks:
- URL routing: Add to `urls.py`
- Component imports: Add to `App.jsx` routes
- Settings: Update configuration

## 5. Run ALL Tests (MANDATORY - Iteration Loop)

```bash
python3 tests/run_all_tests_parallelized.py --json-output
```

**Parse JSON output:**

**If `failed == 0`:**
- All tests passing! ✅
- PROCEED to next step

**If `failed > 0`:**
- Analyze failures
- Identify root cause from test output
- Fix implementation
- Re-run tests
- Repeat until `failed == 0`

**Iteration Example:**
```
Iteration 1: 25 passed, 3 failed
  Analysis: Frontend E2E test failing - button selector wrong
  Fix: Update button selector in React component

Iteration 2: 26 passed, 2 failed
  Analysis: Backend integration test failing - missing import
  Fix: Add import statement

Iteration 3: 27 passed, 1 failed
  Analysis: API returning wrong status code
  Fix: Change status.HTTP_200_OK to status.HTTP_201_CREATED

Iteration 4: 28 passed, 0 failed ✅
  PROCEED
```

**Max iterations:** Let agent decide (typically 3-5 attempts is reasonable)

**If stuck after many iterations:**
- Report failure to factory
- Request human intervention

## 6. Verify Test Coverage

```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: Something wrong (should have passed in Step 5)
- If `passed == 0`: ERROR "No new tests executed"
- If `passed > 0 && failed == 0`: PROCEED ✅

**Rationale:** Confirms new feature is implemented correctly

## 7. Generate Data Plane Current State (if applicable)

```bash
# If data-plane-target.yaml exists in specs/
cd src && DJANGO_SETTINGS_MODULE=django_celery_base.settings python3 -c "
import django
django.setup()
from django.apps import apps
import yaml
from pathlib import Path

models_data = {}
for model in apps.get_models():
    fields = {}
    for field in model._meta.get_fields():
        fields[field.name] = {
            'type': field.__class__.__name__,
            'nullable': getattr(field, 'null', False)
        }
    models_data[model.__name__] = {'fields': fields, 'app': model._meta.app_label}

output = yaml.dump({'models': models_data}, default_flow_style=False)
Path('../specs/data-plane-current.yaml').write_text(output)
print('Generated data-plane-current.yaml')
"
```

## 8. Check Data Plane Alignment (if applicable)

If data-plane-target.yaml exists:
```bash
python3 .lsf/scripts/python/compare_data_plane.py \
  specs/data-plane-target.yaml \
  specs/data-plane-current.yaml \
  --json-output
```

**Parse output:**
- If `aligned == true`: ✅
- If `aligned == false`: Report differences (WARNING, not blocking)

## 9. Promote New Tests to Baseline

```python
registry = json.loads(Path("tests/test-registry.json").read_text())

# Move all new tests to baseline
for category in ["backend_integration", "backend_unit", "frontend_e2e", "frontend_unit"]:
    registry["baseline"][category].extend(registry["new"][category])
    registry["new"][category] = []

# Atomic write
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

**Rationale:** Tests now part of baseline for next iteration

## 10. Report Summary

Output:
```
GREEN Phase Complete:
  Implementation files created: 4
    - Backend: 2 files (views.py, models.py)
    - Frontend: 2 files (FeatureX.jsx, routes updated)

  Test Results:
    ✅ All tests passing: 28 tests
      - Baseline: 25 tests
      - New (promoted): 5 tests

  Test iterations: 3 (converged successfully)

  Registry updated:
    - 5 tests promoted to baseline
    - New tests cleared (ready for next feature)

  Data Plane Status:
    ✅ Aligned (3 models, 0 differences)

  Ready for: discriminate-green phase
```

**Success Criteria:**
- ✅ Implementation files created
- ✅ ALL tests pass (baseline + new) after iteration
- ✅ New tests promoted to baseline
- ✅ Registry updated
- ✅ Data plane aligned (if applicable)

**Failure Modes:**
- ❌ Tests failing after many iterations → Implementation incomplete/complex
- ❌ Data plane misaligned → Missing migrations (warning only)
```

---

### discriminate-red.md (Updated)

```markdown
# Red Phase Discrimination

Validate red phase artifacts for constitutional compliance.

**Usage:** `/discriminate-red <red-phase.md>`

**Purpose:** Quality gate - blocks progression if RED phase invalid

**Implementation:**

## 1. Static Checks (Existing)

Run in order, fail-fast on CRITICAL/ERROR:

### Check 1: Test-Code Coupling
```bash
python3 .lsf/scripts/python/coupling_check.py specs/red-phase.md
```
- Validates: Tests fail for correct reasons (not implementation details)

### Check 2: Stack Contamination
```bash
python3 .lsf/scripts/python/stack_check.py specs/red-phase.md
```
- Validates: Correct test framework for layer
  - Backend integration: pytest
  - Frontend E2E: playwright
  - Frontend unit: vitest

### Check 3: Hallucination Prevention
```bash
python3 .lsf/scripts/python/hallucination_check.py specs/red-phase.md
```
- Validates: Test targets will exist after GREEN phase

## 2. Dynamic Verification (MANDATORY)

### Verification 1: Services Running
```bash
# Backend
if ! docker ps | grep -q "django_web"; then
    BLOCK: "Backend services not running"
fi

# Frontend (if E2E tests exist)
if has_frontend_e2e_tests && ! curl -s http://localhost:3000 > /dev/null; then
    BLOCK: "Frontend dev server not running"
fi
```

### Verification 2: Baseline Integrity
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK with "Baseline tests failing"
- Include failed test names in violation report

### Verification 3: New Tests Fail
```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `passed > 0`: BLOCK with "New tests passing in RED phase (should fail)"
- Include passing test names in violation report

### Verification 4: Isolation Check
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output (2nd run):**
- If `failed > 0`: BLOCK with "New tests broke baseline tests"
- Include broken test names in violation report

## 3. Aggregate Results

**PASS Criteria:**
- All static checks pass (no CRITICAL/ERROR)
- Services running
- Baseline tests pass (before and after)
- New tests fail as expected
- Warnings allowed but reported

**BLOCK Criteria:**
- Any CRITICAL or ERROR from static checks
- Services not running
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
    "services": {
      "backend": {"running": true},
      "frontend": {"running": true, "required": true}
    },
    "baseline_integrity": {
      "passed": true,
      "tests_passed": 25,
      "tests_failed": 0
    },
    "new_tests_fail": {
      "passed": true,
      "tests_passed": 0,
      "tests_failed": 5
    },
    "isolation": {
      "passed": true,
      "tests_passed": 25,
      "tests_failed": 0
    }
  },
  "summary": "All checks passed. Backend + Frontend E2E tests ready for GREEN phase."
}
```
```

---

### discriminate-green.md (Updated)

```markdown
# Green Phase Discrimination

Validate green phase artifacts for constitutional compliance.

**Usage:** `/discriminate-green <green-phase.md>`

**Purpose:** Final quality gate - ensures implementation is production-ready

**Implementation:**

## 1. Static Checks (All 8 - Existing)

Run in priority order, fail-fast on CRITICAL/ERROR:

1. Hallucination Prevention
2. Stack Contamination
3. Incomplete Implementation
4. Context Drift
5. Test-Code Coupling
6. Pattern Consistency
7. Dependency Explosion
8. Over-Engineering

## 2. Comprehensive Test Verification (MANDATORY)

### Verification 1: All Tests Pass
```bash
python3 tests/run_all_tests_parallelized.py --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK with "Implementation incomplete - tests failing"
- Include failed test details:
  - Test names
  - Categories (backend_integration, frontend_e2e, etc.)
  - First 200 chars of error output
- Agent should return to execute-green to fix

**Example block message:**
```
BLOCKED: 3 tests failing after implementation

Failed tests:
  [Backend Integration] test_feature_x_endpoint
    Error: AssertionError: Expected 201, got 400

  [Frontend E2E] tests/e2e/frontend/feature-x.spec.js
    Error: Timeout waiting for .success-message

  [Frontend E2E] tests/e2e/frontend/feature-y.spec.js
    Error: Expected URL /dashboard, got /error

Action: Return to execute-green, fix implementation, re-run tests
```

### Verification 2: Feature Coverage
```bash
python3 tests/run_all_tests_parallelized.py --new-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK (redundant with Verification 1, but explicit)
- If `passed == 0`: BLOCK "No new tests executed"

### Verification 3: No Regressions
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output
```

**Parse JSON output:**
- If `failed > 0`: BLOCK "Implementation broke existing tests"
- Should be redundant (caught in Verification 1) but belt-and-suspenders

## 3. Data Plane Verification (if applicable)

```bash
# If data-plane-target.yaml exists
python3 .lsf/scripts/python/compare_data_plane.py \
  specs/data-plane-target.yaml \
  specs/data-plane-current.yaml \
  --json-output
```

**Parse JSON output:**
- If `aligned == false`: WARNING (not blocking)
- Report differences but allow to proceed
- Migrations might be pending

## 4. Aggregate Results

**PASS Criteria:**
- All 8 static discriminators pass
- ALL tests pass (baseline + new)
- Data plane aligned or acceptable differences

**BLOCK Criteria:**
- Any CRITICAL or ERROR from static checks
- Any test failing (any category)
- Unacceptable data plane misalignment (rare)

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
    "incomplete": {"passed": true},
    "drift": {"passed": true},
    "coupling": {"passed": true},
    "pattern": {"passed": true},
    "dependency": {"passed": true},
    "overengineering": {"passed": true}
  },
  "dynamic_verification": {
    "all_tests": {
      "passed": true,
      "total_passed": 28,
      "total_failed": 0,
      "by_category": {
        "backend_integration": {"passed": 20, "failed": 0},
        "backend_unit": {"passed": 3, "failed": 0},
        "frontend_e2e": {"passed": 4, "failed": 0},
        "frontend_unit": {"passed": 1, "failed": 0}
      }
    },
    "feature_coverage": {
      "passed": true,
      "new_tests_passed": 5
    },
    "no_regressions": {
      "passed": true,
      "baseline_tests_passed": 25
    }
  },
  "data_plane": {
    "aligned": true,
    "differences": []
  },
  "summary": "All checks passed. Implementation verified across backend integration tests and frontend E2E tests. Ready for production."
}
```
```

---

## Test Organization

### Recommended Directory Structure

```
lsf/
├── tests/
│   ├── test-registry.json                  # Single source of truth
│   │
│   ├── integration/                        # Backend integration tests (PRIMARY)
│   │   ├── api_workflows.py
│   │   ├── task_workflows.py
│   │   ├── runtime_workflows.py
│   │   └── test_*.py                       # New features
│   │
│   ├── unit/                               # Backend unit tests (algorithms only)
│   │   ├── test_calculations.py
│   │   └── test_validators.py
│   │
│   ├── e2e/
│   │   ├── frontend/                       # Frontend E2E tests (PRIMARY)
│   │   │   ├── playwright.config.js
│   │   │   ├── setup.js
│   │   │   ├── user-workflows.spec.js
│   │   │   ├── admin-workflows.spec.js
│   │   │   └── *.spec.js                   # New features
│   │   │
│   │   └── smoke.py                        # System smoke test
│   │
│   └── run_all_tests_parallelized.py      # Enhanced test runner
│
├── src/
│   ├── frontend/
│   │   └── tests/
│   │       └── unit/                       # Frontend unit tests (utils only)
│   │           ├── formatCurrency.test.js
│   │           ├── validators.test.js
│   │           └── *.test.js
│   │
│   └── [Django backend code]
```

---

## When to Use Each Test Type

### Backend Integration Test (90% of backend testing)

**Use when:**
- Testing API endpoints
- Testing database operations
- Testing authentication/authorization
- Testing service integrations
- Testing business logic workflows

**Example:**
```python
@pytest.mark.django_db(transaction=True)
def test_user_registration_workflow():
    # POST to register endpoint
    response = requests.post('http://localhost:8000/api/register/', {
        'email': 'test@example.com',
        'password': 'secure123'
    })
    assert response.status_code == 201

    # Verify user in database
    response = requests.get('http://localhost:8000/api/users/me')
    assert response.json()['email'] == 'test@example.com'
```

---

### Backend Unit Test (10% of backend testing)

**Use when:**
- Testing complex algorithms
- Testing pure functions (no side effects)
- Testing mathematical calculations
- Testing validators/formatters

**Example:**
```python
def test_compound_interest_calculation():
    # Pure function, no dependencies
    result = calculate_compound_interest(
        principal=1000,
        rate=0.05,
        years=10,
        compounds_per_year=12
    )
    assert result == pytest.approx(1647.01, 0.01)
```

**Do NOT use for:**
- Testing views (use integration test)
- Testing models (use integration test)
- Testing serializers (use integration test)

---

### Frontend E2E Test (90% of frontend testing)

**Use when:**
- Testing user workflows
- Testing UI interactions
- Testing page navigation
- Testing forms
- Testing API integration from frontend

**Example:**
```javascript
test('complete checkout workflow', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'pass123');
  await page.click('button[type="submit"]');

  // Add to cart
  await page.goto('http://localhost:3000/products/1');
  await page.click('button:has-text("Add to Cart")');

  // Checkout
  await page.goto('http://localhost:3000/cart');
  await page.click('button:has-text("Checkout")');

  // Verify order created
  await expect(page.locator('.order-confirmation')).toBeVisible();

  // Verify in database (via API)
  const response = await page.request.get('http://localhost:8000/api/orders/');
  const orders = await response.json();
  expect(orders.length).toBe(1);
});
```

---

### Frontend Unit Test (10% of frontend testing)

**Use when:**
- Testing utility functions
- Testing formatters
- Testing validators
- Testing pure calculation logic

**Example:**
```javascript
// src/frontend/tests/unit/formatCurrency.test.js
import { formatCurrency } from '../../utils/formatCurrency';

test('formats USD correctly', () => {
  expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  expect(formatCurrency(0, 'USD')).toBe('$0.00');
  expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
});
```

**Do NOT use for:**
- Testing components (use E2E)
- Testing hooks (use E2E)
- Testing pages (use E2E)
- Testing state management (use E2E)

---

## Constitutional Compliance Summary

| Principle | Implementation | Evidence |
|-----------|---------------|----------|
| **Context Efficiency** | E2E tests are 75-83% smaller than mocked tests | Backend: 20 lines vs 80. Frontend: 20 lines vs 120 |
| **Minimalism** | Only 2 test types (integration + utils) vs 3 (unit + component + e2e) | Fewer files, less code, simpler architecture |
| **Reasonable Defaults** | Use existing Docker + dev server | No new mock infrastructure needed |
| **Agent-Centric** | Simple APIs (requests, playwright) vs complex mocks | LLM learns 3 concepts vs 15+ |
| **Focus** | Tests verify business value (workflows) not technical details | E2E tests match user stories |
| **Boundaries** | Clear separation: integration (90%) vs utils (10%) | No overlap, no ambiguity |
| **Drift Detection** | Baseline tests run on every RED phase | Catches regressions immediately |
| **Verification** | Tests run against reality (Docker services, real browser) | Not simulated behavior |

---

## Edge Cases & Failure Handling

### 1. Frontend Dev Server Not Running

**Scenario:** E2E tests need frontend, but server not started

**Detection:**
```python
def _check_frontend_running(self):
    try:
        result = subprocess.run("curl -s http://localhost:3000", ...)
        return result.returncode == 0
    except:
        return False
```

**Action:**
```
STOP test execution
Report: "Frontend dev server not running"
Message: "Start with: cd src/frontend && npm run dev"
Message: "Or run in background: cd src/frontend && npm run dev &"
```

**Why STOP:** E2E tests will fail without frontend, waste time

---

### 2. Playwright Not Installed

**Scenario:** First time running E2E tests

**Detection:**
```python
returncode, _, stderr = self.run_command("npx playwright --version")
if returncode != 0:
    return "Frontend E2E Tests", False, "Playwright not installed"
```

**Action:**
```
STOP with installation instructions
Message: "Install Playwright: cd tests/e2e/frontend && npm install && npx playwright install"
```

---

### 3. E2E Test Timeout

**Scenario:** Page load takes longer than expected

**Playwright Config:**
```javascript
// tests/e2e/frontend/playwright.config.js
export default {
  timeout: 30000,  // 30 seconds per test
  expect: {
    timeout: 5000  // 5 seconds for assertions
  },
  retries: 2,  // Retry flaky tests
  workers: 4   // Parallel execution
};
```

**If still timing out:**
- Report specific test that timed out
- Include screenshot (Playwright auto-captures)
- Include trace file for debugging

---

### 4. Frontend E2E Test Flakiness

**Causes:**
- Network timing issues
- Animation timing
- Async state updates

**Solutions:**

```javascript
// Bad: Hard-coded delays
await page.click('button');
await page.waitForTimeout(1000);  // ❌ Flaky

// Good: Wait for specific condition
await page.click('button');
await page.waitForSelector('.success-message');  // ✅ Reliable
```

**Playwright has built-in retry logic:**
- Auto-waits for elements to be actionable
- Retries assertions until timeout
- Captures screenshots/traces on failure

---

### 5. Backend + Frontend Integration Issues

**Scenario:** Backend API returns 500, frontend test fails

**Detection:**
E2E test will show network error in trace

**Action:**
1. Check backend logs (Docker)
2. Run backend integration test for same endpoint
3. If backend test also fails: Backend bug
4. If backend test passes: Frontend calling wrong endpoint

**Debugging:**
```javascript
// tests/e2e/frontend/debug.spec.js
test('debug API call', async ({ page }) => {
  // Intercept network requests
  page.on('request', request => {
    console.log('Request:', request.url(), request.method());
  });

  page.on('response', response => {
    console.log('Response:', response.url(), response.status());
  });

  await page.goto('http://localhost:3000/feature-x');
  // See all API calls in console
});
```

---

## Implementation Sequence (Updated)

### Phase A: Test Runner Enhancement
1. Add `load_test_registry()` method
2. Add `run_frontend_e2e_tests()` method
3. Add `run_frontend_unit_tests()` method
4. Add `run_registry_based_tests()` method
5. Add CLI flags: `--baseline-only`, `--new-only`, `--json-output`
6. Update main() for registry-based execution
7. Test backward compatibility

### Phase B: Playwright Setup
1. Create `tests/e2e/frontend/` directory
2. Initialize Playwright: `npm init playwright@latest`
3. Create `playwright.config.js`
4. Create `setup.js` with test fixtures
5. Write one sample E2E test
6. Verify test runs: `npx playwright test`

### Phase C: Command File Updates
1. Update execute-red.md (add E2E test generation)
2. Update execute-green.md (add frontend implementation)
3. Update discriminate-red.md (add E2E verification)
4. Update discriminate-green.md (add E2E verification)

### Phase D: Initial Registry Creation
1. Create tests/test-registry.json
2. Populate with current baseline tests (all categories)
3. Verify structure is valid JSON
4. Commit to repo

### Phase E: End-to-End Validation
1. Create minimal human spec (simple feature with frontend + backend)
2. Run factory through RED phase
3. Verify E2E tests generated and failing
4. Run factory through GREEN phase
5. Verify E2E tests passing
6. Verify registry promotion works

### Phase F: Edge Case Testing
1. Test frontend server not running
2. Test Playwright not installed
3. Test E2E timeout handling
4. Test backend/frontend integration errors
5. Verify error messages are clear

---

## Success Metrics

**After implementation, the factory should:**

✅ Generate integration tests for backend (pytest)
✅ Generate E2E tests for frontend (Playwright)
✅ Generate unit tests only for utils/algorithms
✅ Run all test types via single runner
✅ Track baseline vs new tests in registry
✅ Promote tests after GREEN phase
✅ Fail-fast on baseline failures
✅ Fail-fast on new tests passing (RED phase)
✅ Iterate on implementation until tests pass (GREEN phase)
✅ Block at discriminators if quality insufficient
✅ Provide structured JSON output for agent consumption
✅ Handle frontend dev server not running gracefully
✅ Handle Playwright setup gracefully
✅ Support both backend-only and full-stack features

**NOT in scope (future):**
- Visual regression testing (screenshot comparison)
- Performance testing (Lighthouse, Core Web Vitals)
- Accessibility testing (a11y)
- Cross-browser testing (just Chrome for MVP)
- Mobile/responsive testing
- Test result caching
- Incremental test runs

These are deliberately excluded per **Minimalism** principle.
