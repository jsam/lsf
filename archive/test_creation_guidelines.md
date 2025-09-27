# Test Creation Guidelines - TDD Gold Standard

## Core Principles

### 1. True TDD Implementation (NON-NEGOTIABLE)
- **Red Phase First**: Tests MUST fail meaningfully before implementation exists
- **No Placeholders**: NEVER use artificial failures like `assert(false)` or `fail("not implemented")`
- **Real Functionality**: Every test must validate actual behavior, not just existence
- **Meaningful Errors**: Failures should provide actionable information about what's missing

### 2. Test Structure Blueprint

```
TEST SUITE: [Feature/Component Name]
TASK: [Task ID] - [Task Description]
PURPOSE: Validates [specific functionality]
PRINCIPLE: Tests follow TDD - fail meaningfully without implementation, pass with correct implementation

SETUP:
  - Initialize test environment
  - Configure mocks for external dependencies
  - Prepare test data

TEST STRUCTURE:
  SUITE "[Main Feature] ([Task ID])":
    BEFORE EACH TEST:
      - Clear all mocks
      - Reset test state
      - Initialize required objects

    AFTER EACH TEST:
      - Restore original implementations
      - Clean up test artifacts

    CONTEXT "[Functional Area]":
      TEST "should [specific behavior description]":
        TRY:
          // Attempt to test the functionality
          result = invoke_function_under_test()

          // Real assertions about behavior
          assert result is not null
          assert result.property equals expected_value
          assert result.status equals "success"
        CATCH error:
          // Meaningful failure for missing implementation
          fail with message "[Specific feature] not implemented"
```

### 3. Test Quality Checklist

#### ✅ MUST Have:
- [ ] Zero placeholder assertions (no `assert false` or equivalent)
- [ ] Meaningful error messages in error handling blocks
- [ ] always show raw error messages or exception when they occure to provide more context
- [ ] Tests organized by functional areas (test suites/contexts)
- [ ] Clear test names that describe expected behavior
- [ ] Proper asynchronous handling where applicable
- [ ] Environment-appropriate setup and teardown
- [ ] Test is stateless, can be run multiple times

#### ✅ SHOULD Have:
- [ ] Mock setup that doesn't over-couple to implementation
- [ ] Tests for both happy path and error scenarios
- [ ] Validation of request/response contracts
- [ ] Tests that can guide implementation design
- [ ] Comments linking to task IDs and requirements

#### ❌ MUST NOT Have:
- [ ] Placeholder tests that can never pass
- [ ] Tests that only check for existence
- [ ] Overly brittle mocks that break with refactoring
- [ ] Tests without clear failure messages
- [ ] Commented-out test code

### 4. Red-Green-Refactor Cycle

1. **Red Phase** (Write Failing Tests):
   - Write test that describes desired behavior
   - Run test to confirm meaningful failure
   - Failure message should indicate what needs to be built

2. **Green Phase** (Make Tests Pass):
   - Write minimal code to make test pass
   - Don't add functionality not required by tests
   - Focus only on passing current tests

3. **Refactor Phase** (Improve Code):
   - Clean up implementation while keeping tests green
   - Tests act as safety net for refactoring
   - Improve code structure without changing behavior

### 5. Environment-Specific Patterns

#### Server/Backend Environment Tests:
```
ENVIRONMENT: Server/CLI/Backend
SETUP:
  - Mock filesystem operations
  - Stub network calls
  - Simulate database responses
  - Polyfill missing runtime APIs if needed
```

#### Browser/Frontend Environment Tests:
```
ENVIRONMENT: Browser/DOM
SETUP:
  - Initialize DOM structure
  - Mock user interactions
  - Stub API calls
  - Setup event listeners
```

#### API/Service Environment Tests:
```
ENVIRONMENT: API/Microservice
SETUP:
  - Mock HTTP clients
  - Stub external service responses
  - Simulate authentication tokens
  - Configure request/response cycles
```

### 6. Mock Strategy Guidelines

#### Good Mocking:
```
MOCK DEFINITION:
  mock_handler returns default:
    success: true
    data: "test_data"

  mock_handler with behavior:
    IF input equals "error":
      throw Error("Simulated error condition")
    ELSE:
      return success response
```

#### Bad Mocking:
```
ANTI-PATTERN - Over-specified sequence:
  mock returns value_1 on first call
  mock returns value_2 on second call
  mock returns value_3 on third call
  // Breaks if call order changes

ANTI-PATTERN - Meaningless mocks:
  mock always returns "random-string"
  // No relation to real behavior
```

### 7. Error Message Patterns

#### Good Error Messages:
```
"Authentication endpoint not implemented"
"User validation logic missing"
"Database connection handler not found"
"Configuration file not loaded at path: /config/app.conf"
"Failed to parse response: expected JSON, received HTML"
```

#### Bad Error Messages:
```
"Not implemented"  // Too vague
"Error"           // Meaningless
"TODO"            // Not helpful
"Failed"          // No context
"null"            // No information
```

### 8. Test Organization by Feature Type

#### Configuration Tests:
- Test for presence and structure
- Validate required properties
- Check default values
- Verify type correctness

#### API/Route Tests:
- Test request handling
- Validate response format
- Check status codes
- Verify error responses
- Test middleware integration

#### Component Tests:
- Test rendering
- Validate props handling
- Check event handlers
- Verify state changes
- Test error boundaries

#### Integration Tests:
- Test feature workflows
- Validate data flow
- Check system boundaries
- Verify external integrations

### 9. Coverage Expectations

- **Unit Tests**: 80%+ coverage of business logic
- **Integration Tests**: Cover critical user paths
- **Configuration Tests**: 100% of required settings
- **API Tests**: All endpoints and error cases
- **Component Tests**: All props and user interactions

### 10. Test File Naming and Location

```
/test
  /unit
    - component.test.ts
  /integration
    - feature-workflow.test.ts
  /api
    - endpoint.test.ts
  /config
    - configuration.test.ts
```

Or colocated with source:
```
/src
  /components
    /Button
      - Button.tsx
      - Button.test.tsx
```

## Anti-Patterns to Avoid

### ❌ The Placeholder Test
```
TEST "should work":
  assert false equals true  // NEVER: Meaningless failure
```

### ❌ The Existence Test
```
TEST "should exist":
  assert component is not null  // AVOID: Not testing behavior
```

### ❌ The Over-Mocked Test
```
TEST "should call function":
  mock_everything()
  call component.method()
  assert mock_function was called  // BAD: Not testing real behavior
```

### ❌ The Implementation Test
```
TEST "should use specific algorithm":
  assert internal_variable equals 5  // WRONG: Testing internals not behavior
```

### ❌ The Brittle Test
```
TEST "should return exact string":
  result = format_message("hello")
  assert result equals "Hello, user #42 at 2024-01-01 12:00:00"
  // BAD: Breaks with any formatting change
```

## Examples of Gold Standard Tests

### Configuration Test Example:
```
TEST "should configure authentication provider with required options":
  TRY:
    config = load_authentication_config()

    assert config.provider exists
    assert config.provider.type equals "credentials"
    assert config.provider.options contains:
      - email_required: true
      - password_min_length: 8
      - session_timeout: 3600
  CATCH:
    fail "Authentication configuration not found"
```

### API Route Test Example:
```
TEST "should handle POST requests to login endpoint":
  TRY:
    request = create_mock_request:
      method: "POST"
      body:
        email: "user@test.com"
        password: "secure_password"

    response = handle_login_request(request)

    assert response.status equals 200
    assert response.body contains "token"
    assert response.headers contains "Set-Cookie"
  CATCH:
    fail "Login endpoint not implemented"
```

### Component Test Example:
```
TEST "should render form with email and password fields":
  TRY:
    form = render_login_form()

    email_field = form.find_by_label("Email")
    password_field = form.find_by_label("Password")
    submit_button = form.find_by_text("Sign In")

    assert email_field.type equals "email"
    assert password_field.type equals "password"
    assert submit_button.type equals "submit"
    assert submit_button.enabled equals true
  CATCH:
    fail "LoginForm component not implemented"
```

### Integration Test Example:
```
TEST "should complete user authentication workflow":
  TRY:
    // Setup
    user = create_test_user("test@example.com", "password123")

    // Action
    login_response = authenticate_user(user.email, user.password)
    session = extract_session(login_response)
    profile_response = get_user_profile(session)

    // Assertions
    assert login_response.success equals true
    assert session.valid equals true
    assert profile_response.email equals user.email
  CATCH:
    fail "Authentication workflow not implemented"
```

## Final Reminders

1. **Tests are Documentation**: Write tests that explain what the system should do
2. **Tests Drive Design**: Let test requirements guide your implementation
3. **Tests are Safety Net**: Comprehensive tests enable confident refactoring
4. **Tests Fail First**: Always verify tests fail before making them pass
5. **Tests Stay Green**: Never commit failing tests to main branch

Remember: A test that doesn't fail when the implementation is broken is worse than no test at all.