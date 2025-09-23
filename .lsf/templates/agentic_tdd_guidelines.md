# Agentic TDD Guidelines - Maximum Information Density

## Core Principle: Information Density Per Test
**One test should validate multiple related behaviors in a single execution context**

## Test Type Decision Matrix

### When to Use Each Test Type

#### **Integration Tests** (Preferred - Highest Information Density)
**Use for**: API endpoints, service workflows, data transformations
**Why**: Validates multiple layers simultaneously
```python
def test_user_creation_workflow():
    # Single test validates: validation, database, response format, side effects
    response = api_client.post('/users', valid_user_data)
    assert response.status_code == 201
    assert response.json()['id'] exists
    assert database.users.count() == 1
    assert email_service.sent_count == 1
```

#### **Unit Tests** (Selective - For Complex Logic Only)
**Use for**: Pure functions, algorithms, complex business rules
**Avoid for**: Simple CRUD, getters/setters, obvious operations
```python
def test_password_strength_calculation():
    # High-density: tests algorithm edge cases in one execution
    assert calculate_strength("abc") == "weak"
    assert calculate_strength("Abc123!") == "strong"
    assert calculate_strength("") raises ValueError
```

#### **E2E Tests** (Minimal - Critical Paths Only)
**Use for**: Core user journeys, deployment validation
**Limit to**: 3-5 tests maximum per system
```python
def test_complete_authentication_flow():
    # Validates entire user journey
    user = register_new_user()
    session = login_user(user)
    profile = access_protected_resource(session)
    logout_user(session)
```

## Agentic TDD Patterns

### Pattern 1: Behavior Clustering
**Group related assertions in single test**
```python
# GOOD: High information density
def test_user_api_endpoint():
    response = create_user(valid_data)
    # Validate multiple concerns together
    assert response.status_code == 201          # HTTP behavior
    assert response.json()['email'] == user.email  # Data transformation
    assert User.objects.count() == 1           # Persistence
    assert response.headers['Location'] exists  # Protocol compliance

# AVOID: Low information density
def test_user_creation_returns_201():
    assert create_user().status_code == 201

def test_user_creation_saves_email():
    assert create_user().json()['email'] exists

def test_user_creation_increments_count():
    assert User.objects.count() == 1
```

### Pattern 2: State Transition Testing
**Test workflows, not individual steps**
```python
def test_order_lifecycle():
    # Single test covers entire state machine
    order = create_order(items)
    assert order.status == "pending"

    payment = process_payment(order)
    assert order.status == "paid"
    assert payment.amount == order.total

    shipment = ship_order(order)
    assert order.status == "shipped"
    assert shipment.tracking_number exists
```

### Pattern 3: Boundary Value Concentration
**Test edge cases in one execution**
```python
def test_pagination_boundaries():
    # High-density edge case testing
    create_items(25)  # Setup once

    page1 = get_items(page=1, limit=10)
    assert len(page1.items) == 10
    assert page1.has_next == True

    page3 = get_items(page=3, limit=10)
    assert len(page3.items) == 5
    assert page3.has_next == False

    empty_page = get_items(page=10, limit=10)
    assert len(empty_page.items) == 0
```

## Mock Strategy: Minimal and Targeted

### Rule: Mock Only What You Must
```python
# GOOD: Mock external boundaries only
def test_email_notification():
    with mock.patch('email_service.send') as mock_send:
        result = send_welcome_email(user)
        assert result.success == True
        assert mock_send.called_once_with(user.email, "Welcome")

# AVOID: Over-mocking internal logic
def test_user_validation():
    with mock.patch('validate_email') as mock_email:
        with mock.patch('validate_password') as mock_pass:
            # Over-mocked - testing mocks, not logic
```

### Mock Boundary Principle
**Mock at system boundaries, not within business logic**
- ✅ External APIs, databases, filesystems
- ✅ Time, random, environment variables
- ❌ Internal functions, business logic, domain objects

## Error Handling: Contextual Information

### Meaningful Failure Messages
```python
def test_api_authentication():
    try:
        response = api_client.get('/protected', headers=invalid_auth)
        assert response.status_code == 401
        assert "authentication required" in response.json()['error']
    except AssertionError:
        pytest.fail(f"Authentication not implemented. Response: {response.status_code}, Body: {response.text}")
```

## Test Organization: Functional Boundaries

### File Structure by Feature Boundaries
```
tests/
├── api/
│   ├── auth_endpoints.test.py      # Complete auth API
│   └── user_endpoints.test.py      # Complete user API
├── workflows/
│   ├── user_registration.test.py   # End-to-end workflows
│   └── order_processing.test.py
└── units/
    ├── validators.test.py          # Pure business logic only
    └── transforms.test.py
```

### Test Suite Organization
```python
# Group by feature boundary, not technical layer
class TestUserManagement:  # Feature boundary
    def test_user_creation_workflow(self):    # Integration
    def test_user_validation_logic(self):     # Unit (if complex)
    def test_user_deletion_cascade(self):     # Integration

# AVOID: Technical layer grouping
class TestUserControllers:  # Technical boundary
class TestUserModels:
class TestUserViews:
```

## Red-Green-Refactor: Streamlined

### Red Phase: Fail Meaningfully
```python
def test_user_registration():
    # Will fail with clear error before implementation
    response = register_user("test@example.com", "password123")

    assert response.status_code == 201, "User registration endpoint not implemented"
    assert response.json()['user_id'] exists, "Response missing user_id"
    assert User.find_by_email("test@example.com") exists, "User not persisted"
```

### Green Phase: Minimal Implementation
**Write only enough code to make current test pass**

### Refactor Phase: Boundary Preservation
**Improve implementation while maintaining test boundaries**

## Coverage Strategy: Information-Driven

### Focus Areas (High ROI Testing)
1. **API Contracts**: Request/response validation
2. **Data Flows**: Input → processing → output
3. **Error Boundaries**: External service failures
4. **Business Rules**: Complex domain logic
5. **State Transitions**: Workflow changes

### Skip Areas (Low ROI Testing)
1. **Simple CRUD**: Basic database operations
2. **Getters/Setters**: Trivial property access
3. **Framework Code**: Library behavior
4. **Configuration**: Static values
5. **Obvious Logic**: `if (true) return true`

## Contract-Driven TDD

### Mandatory Contracts (Clean Boundaries)
**Use contracts to enforce system boundaries and enable automated validation**

#### API Boundaries (Required)
```python
# Pydantic schemas for request/response validation
class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

def test_user_api_contract():
    request = UserCreateRequest(email="test@example.com", password="secure123")
    response = api_client.post("/users", request.dict())

    # Contract validates structure automatically
    user = UserResponse.parse_obj(response.json())
    assert user.email == request.email
```

#### Service Boundaries (Recommended)
```python
# Protocol-based interface contracts
class UserService(Protocol):
    def create_user(self, email: str, password: str) -> UserResult
    def find_user(self, user_id: UUID) -> Optional[User]

def test_user_service_contract():
    service: UserService = get_user_service()
    result = service.create_user("test@example.com", "password")
    assert isinstance(result, UserResult)
    assert result.success == True
```

### Contract Benefits for Agentic TDD
- **Higher Information Density**: One test validates request, response, and transformation
- **Automatic Edge Cases**: Schema validation catches type/format errors
- **Clear Failure Messages**: Contract violations give specific implementation guidance
- **Boundary Enforcement**: Prevents API drift and implementation coupling

## Anti-Patterns to Avoid

### ❌ Test Explosion
```python
# WRONG: Too many granular tests
def test_user_has_email():
def test_user_has_password():
def test_user_has_created_at():
# Result: 20 tests for one feature
```

### ❌ Mock Explosion
```python
# WRONG: Mocking everything
with mock.patch('database'):
    with mock.patch('validator'):
        with mock.patch('formatter'):
            # Testing mocks, not system
```

### ❌ Implementation Testing
```python
# WRONG: Testing internal structure
assert user.internal_validation_steps == ["email", "password"]
# BETTER: Testing behavior
assert user.is_valid() == True
```

### ❌ Contract Over-Specification
```python
# WRONG: Contracts for internal details
class InternalUserValidator(BaseModel):
    validation_steps: List[str]  # Implementation detail

# BETTER: Contracts for boundaries only
class UserAPI(BaseModel):
    email: EmailStr
    password: str
```

## Examples: Maximum Information Density

### API Feature Test
```python
def test_complete_user_api():
    """Single test validates entire user API surface"""

    # Creation
    create_response = api.post('/users', valid_user_data)
    assert create_response.status_code == 201
    user_id = create_response.json()['id']

    # Retrieval
    get_response = api.get(f'/users/{user_id}')
    assert get_response.status_code == 200
    assert get_response.json()['email'] == valid_user_data['email']

    # Update
    update_response = api.put(f'/users/{user_id}', {'name': 'Updated'})
    assert update_response.status_code == 200
    assert api.get(f'/users/{user_id}').json()['name'] == 'Updated'

    # Deletion
    delete_response = api.delete(f'/users/{user_id}')
    assert delete_response.status_code == 204
    assert api.get(f'/users/{user_id}').status_code == 404
```

### Business Logic Test
```python
def test_order_calculation_scenarios():
    """Tests all pricing edge cases in one execution"""

    # Base case
    order = Order([item(price=10, qty=2)])
    assert order.subtotal == 20
    assert order.tax == 2.0  # 10% tax
    assert order.total == 22

    # Discount case
    order.apply_discount(percent=10)
    assert order.total == 19.8  # (20 * 0.9) + tax

    # Free shipping threshold
    assert order.shipping_cost == 0  # Over $15 threshold

    # Edge case: empty order
    empty_order = Order([])
    assert empty_order.total == 0
    assert empty_order.is_valid() == False
```

## Contract Implementation Rules

### Required Contracts
1. **All API Endpoints**: Request/response schemas (Pydantic/JSON Schema)
2. **Service Interfaces**: Protocol-based contracts for dependency injection
3. **External Integrations**: Third-party API contracts

### Optional Contracts
1. **Internal Data Models**: Only if complex validation needed
2. **Configuration Schemas**: Only if runtime validation required

### Forbidden Contracts
1. **Implementation Details**: Internal methods, private functions
2. **Framework Code**: Library-specific implementations
3. **Utility Functions**: Helper methods, formatters

## Final Guidelines

### Information Density Checklist
- [ ] Test validates multiple related behaviors
- [ ] Failures provide actionable implementation guidance
- [ ] Test exercises realistic data flows
- [ ] Edge cases covered in same execution context
- [ ] Minimal mocking at system boundaries only
- [ ] Contracts enforce boundaries without over-specification

### Efficiency Metrics
- **High Value**: One test covers entire feature API with contract validation
- **Medium Value**: One test covers complete workflow with service contracts
- **Low Value**: One test per individual assertion

### Contract-TDD Cycle
1. **Red**: Define contract, write failing test
2. **Green**: Implement minimal code satisfying contract
3. **Refactor**: Improve implementation, contract prevents breaking changes

**Remember**: In agentic development, contracts amplify test information density by providing automated validation and clear boundary enforcement.