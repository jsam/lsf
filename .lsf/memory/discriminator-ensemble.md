# Discriminator Ensemble for LLM Software Factory

## Core LLM Coding Issues & Targeted Discriminators

### 1. **Hallucination Prevention Discriminator**
**LLM Issue**: Models generate non-existent APIs, modules, or frameworks
**Factory Impact**: Breaks automated build/test cycles, wastes computational resources
**Discriminator Role**:
- Validates all imports, dependencies, and API calls against actual codebase
- Cross-references component usage with architecture-boundaries.md
- Rejects tasks referencing non-existent functionality
- **Layer Focus**: Green phase implementation tasks

### 2. **Context Drift Discriminator**
**LLM Issue**: Models lose track of original requirements over long conversations
**Factory Impact**: Implementation diverges from user outcomes, breaks traceability
**Discriminator Role**:
- Maintains OUT-XXX → REQ-XXX → TEST-XXX → GREEN-XXX chains
- Flags when current task doesn't serve original user outcome
- Enforces reference to initial specifications at each layer
- **Layer Focus**: All layer transitions, especially 2→3A→3B

### 3. **Over-Engineering Prevention Discriminator**
**LLM Issue**: Models default to complex, "impressive" solutions over simple ones
**Factory Impact**: Reduces maintainability, increases technical debt, slows iteration
**Discriminator Role**:
- Enforces "existing component first" decision tree
- Counts abstractions/patterns and flags excess complexity
- Validates minimal implementation requirement (only what tests require)
- **Layer Focus**: Layer 2 requirements + Green phase implementations

### 4. **Test-Code Coupling Discriminator**
**LLM Issue**: Models write tests that pass trivially or don't test real functionality
**Factory Impact**: False confidence in implementation quality, missed bugs in production
**Discriminator Role**:
- Ensures RED tests fail for correct reasons (missing implementation, not syntax)
- Validates GREEN implementations don't just satisfy test structure
- Enforces real behavior testing:
  - E2E tests use real browser + real API (no mocks)
  - Integration tests use real database + real services (no mocks)
  - Unit tests only for pure functions (no mocked dependencies)
- Rejects tests that mock the system under test
- Rejects mocked API responses in E2E tests
- **Layer Focus**: Red→Green phase transitions

### 5. **Stack Contamination Discriminator**
**LLM Issue**: Models mix frontend/backend concepts or test frameworks inappropriately
**Factory Impact**: Breaks deployment automation, creates security vulnerabilities
**Discriminator Role**:
- Enforces Django-only backend, React-only frontend boundaries
- Prevents server-side rendering complexity, client-side business logic
- Validates correct test framework usage:
  - Backend integration: pytest with real services
  - Backend unit: pytest for algorithms only
  - Frontend E2E: Playwright with real browser (90% of frontend tests)
  - Frontend unit: Vitest for utilities only (10% of frontend tests)
- Rejects mocked component tests (use E2E or unit instead)
- **Layer Focus**: All implementation phases

### 6. **Dependency Explosion Discriminator**
**LLM Issue**: Models suggest adding new libraries instead of using existing ones
**Factory Impact**: Increases maintenance burden, breaks automated updates
**Discriminator Role**:
- Rejects any new dependencies not in existing package.json/requirements.txt
- Enforces Django/React built-in usage before external libraries
- Validates against architecture-boundaries.md component catalog
- **Layer Focus**: Green phase implementation decisions

### 7. **Incomplete Implementation Discriminator**
**LLM Issue**: Models generate partial implementations that look complete
**Factory Impact**: Silent failures in production, breaks CI/CD automation
**Discriminator Role**:
- Validates all GREEN tasks have executable verification commands
- Ensures error handling, edge cases, and configuration are complete
- Cross-checks implementation completeness against test requirements
- **Layer Focus**: Green phase task completion

### 8. **Pattern Inconsistency Discriminator**
**LLM Issue**: Models use different patterns for similar problems within same codebase
**Factory Impact**: Reduces code maintainability, confuses future LLM iterations
**Discriminator Role**:
- Enforces consistent patterns from existing codebase
- Validates new implementations follow established conventions
- Prevents mixing architectural styles (REST + GraphQL, Class + Functional)
- **Layer Focus**: Green phase implementation patterns

### 9. **E2E-First Compliance Discriminator**
**LLM Issue**: Models default to unit/component tests with extensive mocking
**Factory Impact**: Tests don't reflect production behavior, mocks diverge from reality
**Discriminator Role**:
- Enforces 90% E2E/integration, 10% unit test ratio
- Rejects new mocked component tests
- Validates E2E tests use real services (no MSW, no nock, no page.route mocking)
- Ensures unit tests are pure functions only (no mocks)
- Checks test registry for proper categorization
- Validates correct test framework for layer (Playwright for frontend E2E, not Vitest)
- **Layer Focus**: Red phase test generation

**Validation Rules**:
- Frontend test in `tests/e2e/frontend/` → Valid E2E test ✅
- Frontend test in `src/frontend/tests/integration/` → Reject (deprecated) ❌
- Frontend test in `src/frontend/tests/unit/` → Valid only if pure function ✅
- Backend test mocking database → Reject (use integration with real DB) ❌
- Backend test for algorithm → Valid unit test ✅
- E2E test with `page.route()` mocking API → Reject (use real backend) ❌

## Layer-Specific Discriminator Activation

### **Layer 1 (Human Spec)**
- **Context Drift Discriminator**: Ensures clear, measurable user outcomes
- **Over-Engineering Prevention**: Flags complex requirements too early

### **Layer 2 (Requirements/Test Cases)**
- **Context Drift Discriminator**: Maintains link to user outcomes
- **Dependency Explosion**: Ensures requirements use existing components
- **Over-Engineering Prevention**: Prevents requirement bloat

### **Layer 3A (Red Phase)**
- **Test-Code Coupling**: Ensures tests fail for correct reasons
- **Stack Contamination**: Enforces correct test framework boundaries (pytest/Playwright/Vitest)
- **Hallucination Prevention**: Validates test targets exist/will exist
- **E2E-First Compliance**: Enforces 90/10 ratio, rejects mocked tests

### **Layer 3B (Green Phase)**
- **All Discriminators Active**: Highest risk phase for LLM coding issues
- **Incomplete Implementation**: Critical for factory automation
- **Pattern Inconsistency**: Maintains codebase coherence

### **Execution Phase**
- **Hallucination Prevention**: Final validation before code execution
- **Incomplete Implementation**: Ensures deployable artifacts
- **Test-Code Coupling**: Validates real functionality

## Discriminator Orchestration for Factory Reliability

### **Rejection Hierarchy** (Most to Least Critical)
1. **Hallucination Prevention**: Immediate factory breakage
2. **Stack Contamination**: Security/deployment risks
3. **Incomplete Implementation**: Silent production failures
4. **Context Drift**: Mission drift from user needs
5. **Test-Code Coupling**: Quality assurance breakdown
6. **Pattern Inconsistency**: Long-term maintainability
7. **Dependency Explosion**: Technical debt accumulation
8. **Over-Engineering Prevention**: Efficiency optimization

### **Automation Integration**
- Discriminators run before any file modification
- Failed discrimination blocks pipeline progression
- Success rates tracked for LLM model fine-tuning
- Patterns learned for proactive discrimination

This ensemble specifically counters LLM weaknesses while maintaining the factory's goal of reliable, automated software production at industrial scale.