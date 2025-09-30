# Agentic TDD Guidelines

## Core Directive
**Maximize information density per test. One test validates entire feature boundaries.**

## Test Decision Hierarchy

### Backend Testing (90% Integration, 10% Unit)

#### 1. Backend Integration Test (Default Choice)
**When**: API endpoints, service workflows, data pipelines
**Information Density**: Validates request → processing → response → side effects
**Tool**: pytest with real services (Docker)
```python
def test_user_creation():
    # Real HTTP request to real API with real database
    response = requests.post('http://localhost:8000/api/users/', {
        'email': 'test@example.com',
        'password': 'secure123'
    })
    assert response.status_code == 201
    assert response.json()['id'] exists
    assert database.users.count() == 1
    assert email_queue.count() == 1
```

#### 2. Backend Unit Test (Exception Case)
**When**: Complex algorithms, pure functions with multiple edge cases
**Information Density**: All edge cases in single execution
**Tool**: pytest for pure functions only
```python
def test_password_strength():
    assert calculate_strength("") raises ValueError
    assert calculate_strength("weak") == "weak"
    assert calculate_strength("Strong123!") == "strong"
```

### Frontend Testing (90% E2E, 10% Unit)

#### 3. Frontend E2E Test (Default Choice)
**When**: User workflows, UI interactions, page navigation, form submissions
**Information Density**: Validates user action → UI update → API call → database
**Tool**: Playwright with real browser + real backend
```javascript
test('user registration workflow', async ({ page }) => {
  // Real browser, real API, complete workflow
  await page.goto('http://localhost:3000/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'secure123');
  await page.click('button[type="submit"]');

  // Verify UI state
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('.welcome-message')).toBeVisible();

  // Verify backend state via API
  const response = await page.request.get('http://localhost:8000/api/users/me');
  expect(response.json()).toMatchObject({ email: 'test@example.com' });
});
```

#### 4. Frontend Unit Test (Exception Case)
**When**: Pure utility functions, formatters, validators (no UI, no API)
**Information Density**: All edge cases for single pure function
**Tool**: Vitest for isolated functions only
```javascript
test('currency formatter', () => {
  expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  expect(formatCurrency(0, 'USD')).toBe('$0.00');
  expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
});
```

### System Testing

#### 5. Smoke Test (Deployment Validation Only)
**When**: System health check after deployment
**Information Density**: Validates entire stack is operational
**Maximum**: 3 tests total per system
```python
def test_system_operational():
    # Full stack smoke test
    user = register_user()
    session = login(user)
    assert session.valid
    assert can_access_protected_resource(session)
```

## Contract Requirements

### Mandatory Contracts
```python
# 1. API Boundaries - Required for all endpoints
class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr

# 2. Service Interfaces - Required for dependency injection
class UserService(Protocol):
    def create_user(self, email: str, password: str) -> UserResult

# 3. External Integration Points - Required for third-party APIs
class PaymentGateway(Protocol):
    def charge(self, amount: Decimal, token: str) -> ChargeResult
```

### Contract Test Pattern
```python
def test_user_api_contract():
    # Contract defines test structure
    request = UserCreateRequest(email="test@example.com", password="secure123")
    response = api.post("/users", request.dict())

    # Automatic validation via contract
    user = UserResponse.parse_obj(response.json())
    assert user.email == request.email
```

## Test Patterns

### Pattern 1: Feature Completeness
```python
def test_user_management_complete():
    """Single test for entire user CRUD"""
    # Create
    create_response = api.post('/users', user_data)
    user_id = create_response.json()['id']

    # Read
    get_response = api.get(f'/users/{user_id}')
    assert get_response.json()['email'] == user_data['email']

    # Update
    api.put(f'/users/{user_id}', {'name': 'Updated'})
    assert api.get(f'/users/{user_id}').json()['name'] == 'Updated'

    # Delete
    api.delete(f'/users/{user_id}')
    assert api.get(f'/users/{user_id}').status_code == 404
```

### Pattern 2: Workflow Validation
```python
def test_order_workflow():
    """Complete state machine in one test"""
    order = create_order(items)
    assert order.status == "pending"

    payment = process_payment(order)
    assert order.status == "paid"

    shipment = ship_order(order)
    assert order.status == "shipped"
```

### Pattern 3: Edge Case Concentration
```python
def test_pagination_boundaries():
    """All boundary conditions in one execution"""
    create_items(25)

    assert len(get_page(1, limit=10).items) == 10
    assert len(get_page(3, limit=10).items) == 5
    assert len(get_page(10, limit=10).items) == 0
```

### Pattern 4: Frontend E2E Complete Workflow
```javascript
test('complete checkout workflow', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);

  // Browse products
  await page.goto('http://localhost:3000/products');
  await page.click('text=Premium Widget');
  await page.click('button:has-text("Add to Cart")');
  await expect(page.locator('.cart-count')).toHaveText('1');

  // Checkout
  await page.click('a[href="/cart"]');
  await page.click('button:has-text("Checkout")');
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.fill('[name="expiry"]', '12/25');
  await page.click('button[type="submit"]');

  // Verify completion
  await expect(page.locator('.order-confirmation')).toBeVisible();
  await expect(page.locator('.order-number')).toContainText(/ORD-\d+/);

  // Verify backend state
  const orders = await page.request.get('http://localhost:8000/api/orders/');
  expect(orders.json().length).toBe(1);
});
```

## Mock Rules

### Backend: Mock Only External Boundaries
```python
# CORRECT: Mock external service (outside your control)
@mock.patch('payment_gateway.charge')
def test_payment_processing(mock_charge):
    mock_charge.return_value = ChargeResult(success=True)
    result = process_payment(order)
    assert result.success

# WRONG: Mock internal logic (your code)
@mock.patch('validate_email')  # Internal function
def test_user_creation(mock_validate):
    # Testing mocks, not system
```

### Frontend: No Mocking in E2E Tests
```javascript
// CORRECT: Real browser, real API, real backend
test('user login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
});

// WRONG: Mocked API responses
test('user login', async ({ page }) => {
  await page.route('**/api/login', route => {
    route.fulfill({ json: { success: true } });  // Testing mock, not system
  });
  // ...
});

// WRONG: Mocked component tests (use E2E instead)
test('LoginForm component', () => {
  const mockSubmit = vi.fn();
  render(<LoginForm onSubmit={mockSubmit} />);
  // Testing component isolation, not user workflow
});
```

## Red-Green-Refactor

### Red: Contract-First Failure
```python
def test_feature():
    # Define expected behavior via contract
    response = api.post('/endpoint', ContractRequest(...).dict())
    result = ContractResponse.parse_obj(response.json())  # Fails meaningfully
```

### Green: Minimal Contract Satisfaction
```python
@app.post('/endpoint', response_model=ContractResponse)
def endpoint(request: ContractRequest):
    # Minimal implementation satisfying contract
    return ContractResponse(...)
```

### Refactor: Contract Protection
```python
# Refactor freely - contract prevents breaking changes
```

## Test Registry

### Purpose
Track test lifecycle through RED → GREEN workflow, separate baseline from new tests.

### Registry Structure
```json
{
  "baseline": {
    "backend_integration": ["tests/integration/api_workflows.py"],
    "backend_unit": [],
    "frontend_e2e": ["tests/e2e/frontend/login.spec.js"],
    "frontend_unit": []
  },
  "new": {
    "backend_integration": [],
    "backend_unit": [],
    "frontend_e2e": [],
    "frontend_unit": []
  }
}
```

### RED Phase: Add to "new"
```python
import json
from pathlib import Path

registry = json.loads(Path("tests/test-registry.json").read_text())
registry["new"]["backend_integration"].append("tests/integration/test_feature_x.py")
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

### GREEN Phase: Promote to "baseline"
```python
# After all tests pass, promote new tests to baseline
registry = json.loads(Path("tests/test-registry.json").read_text())
for category in ["backend_integration", "backend_unit", "frontend_e2e", "frontend_unit"]:
    registry["baseline"][category].extend(registry["new"][category])
    registry["new"][category] = []
Path("tests/test-registry.json").write_text(json.dumps(registry, indent=2))
```

### Registry-Based Execution
```bash
# Run only baseline tests (before RED phase)
python3 tests/run_all_tests_parallelized.py --baseline-only

# Run only new tests (during RED phase)
python3 tests/run_all_tests_parallelized.py --new-only

# Run all tests with JSON output (during GREEN phase)
python3 tests/run_all_tests_parallelized.py --json-output
```

## Test Organization

### Directory Structure
```
tests/
├── test-registry.json                    # Test lifecycle tracking
├── integration/                          # Backend integration (90%)
│   ├── api_workflows.py                 # Complete API workflow tests
│   ├── task_workflows.py                # Background task tests
│   └── test_*.py                        # Feature integration tests
├── unit/                                 # Backend unit tests (10%)
│   └── test_calculations.py             # Pure algorithms only
├── e2e/
│   ├── frontend/                        # Frontend E2E tests (90%)
│   │   ├── playwright.config.js
│   │   ├── login.spec.js               # User auth workflows
│   │   ├── checkout.spec.js            # Purchase workflows
│   │   └── *.spec.js                   # Feature E2E tests
│   └── smoke.py                         # System smoke test (max 3)
├── run_all_tests_parallelized.py        # Registry-based test runner
└── README.md
```

### Test Naming
```python
# Feature-oriented, not technical
def test_user_lifecycle():      # GOOD
def test_UserController_post(): # BAD
```

## Forbidden Patterns

### ❌ Test Explosion
```python
# WRONG: Multiple tests for one feature
def test_user_has_email()
def test_user_has_password()
def test_user_saves_to_database()
```

### ❌ Over-Mocking
```python
# WRONG: Mocking internals
@mock.patch('user.validate')
@mock.patch('database.save')
@mock.patch('email.send')
```

### ❌ Implementation Testing
```python
# WRONG: Testing private details
assert user._internal_state == "validated"
```

### ❌ Contract Over-Specification
```python
# WRONG: Contracts for internals
class InternalValidator(BaseModel):  # Not a boundary
    steps: List[str]
```

### ❌ Mocked Component Tests (Frontend)
```javascript
// WRONG: Testing component in isolation with mocks
test('LoginForm', () => {
  const mockSubmit = vi.fn();
  const mockNavigate = vi.fn();
  render(<LoginForm onSubmit={mockSubmit} navigate={mockNavigate} />);
  // Use E2E test instead
});

// WRONG: Mocking API in E2E tests
test('user login', async ({ page }) => {
  await page.route('**/api/login', route => {
    route.fulfill({ json: { token: 'fake' } });  // Use real API instead
  });
});
```

## Coverage Priorities

### Test These
1. Backend API endpoints (100% via integration tests with contracts)
2. Frontend user workflows (90% via E2E tests with real browser)
3. Service interfaces (contract validation for APIs)
4. Complex algorithms (edge cases via unit tests)
5. Frontend utilities (10% via unit tests - formatters, validators)
6. External integrations (mock at boundaries)

### Skip These
1. Simple CRUD operations
2. Getters/setters
3. Framework defaults (Django/React built-ins)
4. Obvious logic (`if x: return x`)
5. Frontend component implementation details
6. CSS/styling (use visual regression if needed)

## Efficiency Metrics

| Test Type | Stack | Information Density | When to Use | Ratio |
|-----------|-------|-------------------|-------------|-------|
| Backend Integration | Backend | HIGH - API → DB → Queue | Default | 90% |
| Backend Unit | Backend | MEDIUM - Algorithm edges | Complex logic only | 10% |
| Frontend E2E | Frontend | HIGH - User → UI → API → DB | Default | 90% |
| Frontend Unit | Frontend | MEDIUM - Function edges | Utilities only | 10% |
| Smoke | Full Stack | MEDIUM - System health | Deployment | 1-3 total |

## Final Checklist

- [ ] Each test validates complete feature boundary
- [ ] Backend: Contracts defined for all API boundaries (Pydantic)
- [ ] Backend: Integration tests use real services (Docker)
- [ ] Frontend: E2E tests use real browser + real API (Playwright)
- [ ] Mocks only at external boundaries (payment gateways, third-party APIs)
- [ ] No mocked component tests (use E2E for workflows, unit for utilities)
- [ ] Test failures provide implementation guidance
- [ ] Test registry updated (new tests in "new", promoted after GREEN)
- [ ] 90/10 ratio maintained (integration/E2E vs unit)
- [ ] Maximum 3 smoke tests for system health

**Remember**: Every test must justify its existence through information density.