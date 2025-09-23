# Agentic TDD Guidelines

## Core Directive
**Maximize information density per test. One test validates entire feature boundaries.**

## Test Decision Hierarchy

### 1. Integration Test (Default Choice)
**When**: API endpoints, service workflows, data pipelines
**Information Density**: Validates request → processing → response → side effects
```python
def test_user_creation():
    response = api.post('/users', {'email': 'test@example.com', 'password': 'secure123'})
    assert response.status_code == 201
    assert response.json()['id'] exists
    assert database.users.count() == 1
    assert email_queue.count() == 1
```

### 2. Unit Test (Exception Case)
**When**: Complex algorithms, pure functions with multiple edge cases
**Information Density**: All edge cases in single execution
```python
def test_password_strength():
    assert calculate_strength("") raises ValueError
    assert calculate_strength("weak") == "weak"
    assert calculate_strength("Strong123!") == "strong"
```

### 3. E2E Test (Deployment Validation Only)
**When**: System smoke test after deployment
**Maximum**: 3 tests total per system
```python
def test_system_operational():
    user = register_user()
    session = login(user)
    assert session.valid
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

## Mock Rules

### Mock Only External Boundaries
```python
# CORRECT: Mock external service
@mock.patch('payment_gateway.charge')
def test_payment_processing(mock_charge):
    mock_charge.return_value = ChargeResult(success=True)
    result = process_payment(order)
    assert result.success

# WRONG: Mock internal logic
@mock.patch('validate_email')  # Internal function
def test_user_creation(mock_validate):
    # Testing mocks, not system
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

## Test Organization

### Directory Structure
```
tests/
├── integration/          # Default test location
│   ├── api_users.py     # Complete user API tests
│   ├── api_orders.py    # Complete order API tests
│   └── workflows.py     # Multi-service workflows
├── unit/                # Only for complex algorithms
│   └── calculations.py
└── e2e/                 # Maximum 3 files
    └── smoke.py
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

## Coverage Priorities

### Test These
1. API endpoints (100% coverage via integration tests)
2. Service interfaces (contract validation)
3. Complex algorithms (edge cases via unit tests)
4. External integrations (mock boundaries)

### Skip These
1. Simple CRUD operations
2. Getters/setters
3. Framework defaults
4. Obvious logic (`if x: return x`)

## Efficiency Metrics

| Test Type | Information Density | When to Use |
|-----------|-------------------|-------------|
| Integration | HIGH - Entire feature | Default choice |
| Unit | MEDIUM - Algorithm edges | Complex logic only |
| E2E | LOW - System health | Deployment only |

## Final Checklist

- [ ] Each test validates complete feature boundary
- [ ] Contracts defined for all API/service boundaries
- [ ] Mocks only at external boundaries
- [ ] Test failures provide implementation guidance
- [ ] Maximum 3 E2E tests total

**Remember**: Every test must justify its existence through information density.