# Extract Tests

Generate high-density integration tests from seeded implementation.

**Usage:** `/extract-tests <implementation-files>`

**Purpose:** Create contract-based integration tests from actual implementation, following agentic TDD principles.

**When to Use:** After /seed-implementation creates working code.

**Implementation Strategy:**

## 1. Identify Feature Boundaries
- Map complete workflows, not individual functions
- Find API endpoints and service interfaces
- Group related functionality into single tests

## 2. Extract Contracts from Implementation
```python
# From actual implementation, extract contracts:
class UserCreateRequest(BaseModel):  # Found in implementation
    email: EmailStr
    password: str

class UserResponse(BaseModel):  # Found in implementation
    id: UUID
    email: EmailStr
```

## 3. Generate Integration Tests (Default)
One test per feature, validating entire boundary:
```python
def test_user_management_complete():
    """Single test for entire user feature"""
    # Create
    response = api.post('/users', {'email': 'test@example.com', 'password': 'secure123'})
    assert response.status_code == 201
    user_id = response.json()['id']

    # Read
    get_response = api.get(f'/users/{user_id}')
    assert get_response.json()['email'] == 'test@example.com'

    # Update
    api.put(f'/users/{user_id}', {'name': 'Updated'})
    assert api.get(f'/users/{user_id}').json()['name'] == 'Updated'

    # Delete
    api.delete(f'/users/{user_id}')
    assert api.get(f'/users/{user_id}').status_code == 404
```

## 4. Mock Only External Boundaries
```python
@mock.patch('payment_gateway.charge')  # External service only
def test_order_with_payment(mock_charge):
    mock_charge.return_value = ChargeResult(success=True)
    # Test complete workflow
```

## Test Extraction Rules

### DO Extract:
- Complete feature tests (CRUD operations in one test)
- Workflow validations (entire state machine)
- Contract validations at API boundaries
- Edge cases concentrated in single test

### DON'T Extract:
- Unit tests for simple functions
- Tests for getters/setters
- Multiple tests for one feature
- Tests of internal implementation details

## Output Structure:
```
tests/
├── integration/          # Primary tests here
│   ├── test_users.py    # Complete user feature
│   └── test_orders.py   # Complete order workflow
└── unit/                # Only if complex algorithms exist
    └── test_calculations.py
```

## Benefits Over Traditional TDD:
- Tests match actual contracts, not guessed ones
- High information density per test
- No wasted tokens on wrong interface assumptions
- Follows agentic TDD principles exactly

**Next Steps:**
1. Verify all integration tests pass
2. Ensure contract coverage at boundaries
3. Mark implementation as protected

**Constitutional Compliance:**
- Integration-first approach (Agentic TDD)
- Maximum information density (Context Efficiency)
- Contract-based validation (Boundaries)
- Minimal test count (Minimalism)