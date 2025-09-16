# LSF Command Usage Guide

This guide provides comprehensive examples for each LSF command to maximize accuracy and results. Each command is part of the Test-Spec-First development workflow.

## Command Workflow Overview

The LSF commands follow a structured workflow:
```
/init → /epic → /breakdown → /test → /implement → /review → /refactor
```

Each command has specific inputs and outputs, and they build upon each other to create a complete feature development lifecycle.

---

## 1. `/init` - Project Initialization

**Purpose**: Bootstrap a complete project with technology stack, constitution, and 12-factor architecture.

### Command Structure
```
/init <stack1>, <stack2>, <stack3> - <project description>
```

### Usage Examples

#### Example 1: Django Web Application
```bash
/init django, postgres, redis - e-commerce platform for online retail with user management and product catalog
```

**What this generates**:
- Django project structure with apps (core, api, users)
- PostgreSQL database configuration
- Redis for caching and sessions
- Constitutional framework for web applications
- 12-factor app compliance documentation
- Docker Compose with all services
- Testing framework setup

#### Example 2: FastAPI + AI/ML Stack
```bash
/init fastapi, pgvector, celery - AI-powered document search engine with vector similarity matching
```

**What this generates**:
- FastAPI project with clean architecture layers
- PostgreSQL with pgvector extension for embeddings
- Celery for async document processing
- AI/ML specific constitutional rules
- Vector database optimization guidelines
- Background task processing setup

#### Example 3: Full-Stack SaaS Application
```bash
/init vue, django, postgres, redis, celery - SaaS dashboard with real-time analytics and user management
```

**What this generates**:
- Vue 3 frontend with TypeScript
- Django backend with REST API
- Real-time capabilities configuration
- Multi-service Docker environment
- Comprehensive testing strategy
- Full-stack constitutional governance

### Key Outputs
- `specs/constitution/constitution.md` - Project governance
- `specs/architecture/12-factor.md` - Implementation guide
- `docker-compose.yml` - Development environment
- Project-specific directory structure
- `specs/initialization-report.md` - Setup summary

---

## 2. `/epic` - Feature Epic Creation

**Purpose**: Define feature requirements in human-readable format focusing on user value and business goals.

### Command Structure
```
/epic <feature description with user value and acceptance criteria>
```

### Usage Examples

#### Example 1: User Authentication Feature
```bash
/epic User registration and authentication system that allows new users to create accounts with email verification, secure login with password reset functionality, and role-based access control. Users should be able to register, verify email, login, logout, reset passwords, and access features based on their assigned roles (admin, user, guest). Success criteria: secure password storage, email verification within 15 minutes, password reset flow works end-to-end, role permissions properly restrict access.
```

**Generated Epic Structure**:
- **Feature Overview**: User authentication and authorization system
- **User Stories**: Registration, login, password reset, role management
- **Acceptance Criteria**: Specific testable conditions
- **Non-functional Requirements**: Security, performance, compliance
- **Dependencies**: Email service, database schema
- **Success Metrics**: User engagement, security compliance

#### Example 2: Search Functionality
```bash
/epic Advanced search functionality that enables users to find products quickly using text queries, filters, and categories. Users should be able to search by product name, description, category, price range, and availability. Search results should be ranked by relevance, include faceted navigation, and support autocomplete suggestions. Success criteria: search response under 200ms, relevant results in top 10, autocomplete appears after 2 characters, filters work correctly.
```

#### Example 3: Analytics Dashboard
```bash
/epic Real-time analytics dashboard that provides business insights through interactive charts and KPI tracking. Business users should be able to view sales metrics, user engagement data, conversion funnels, and custom report generation. Dashboard should update in real-time, support date range filtering, and allow export to PDF/Excel. Success criteria: data updates within 5 seconds, charts render smoothly, exports complete successfully, mobile responsive design.
```

### Key Outputs
- Branch created for feature development
- `epic.md` file with structured requirements
- Template sections filled with concrete details
- Ready for breakdown phase

### Tips for Better Results
- **Be Specific**: Include measurable success criteria
- **Focus on User Value**: Explain why users need this feature
- **Include Constraints**: Performance, security, compliance requirements
- **Define Success**: Clear, testable acceptance criteria

---

## 3. `/breakdown` - Technical Planning

**Purpose**: Transform epic into actionable technical plan with architecture decisions and ordered tasks.

### Command Structure
```
/breakdown <technical context and architectural preferences>
```

### Usage Examples

#### Example 1: Authentication System Technical Breakdown
```bash
/breakdown Use JWT tokens for stateless authentication, bcrypt for password hashing, Redis for session storage, email service integration for verification. Follow REST API patterns, implement rate limiting, use database migrations for user schema. Prioritize security over performance, ensure GDPR compliance for user data.
```

**Generated Technical Plan**:
- **Architecture Decision**: JWT + Redis hybrid approach
- **Database Design**: User model with encrypted fields
- **API Specification**: Authentication endpoints with OpenAPI docs
- **Security Measures**: Rate limiting, password policies, encryption
- **Task Breakdown**: 15-20 specific, ordered tasks
- **Dependencies**: Email service setup → User model → API endpoints → Testing

#### Example 2: Search System Architecture
```bash
/breakdown Implement Elasticsearch for full-text search, use Redis for autocomplete caching, create search API with faceted navigation. Design for horizontal scaling, implement search analytics, use async processing for index updates. Focus on performance optimization and relevance scoring.
```

#### Example 3: Analytics Dashboard Technical Plan
```bash
/breakdown Use WebSocket connections for real-time updates, implement data aggregation pipeline with Celery, create REST API for historical data. Frontend uses Vue with Chart.js, backend implements event sourcing pattern. Design for high read throughput, implement caching strategy.
```

### Key Outputs
- `breakdown.md` - Technical architecture and decisions
- `tasks.md` - Ordered, executable tasks with IDs (P1-001, P1-002...)
- `stories.md` - Detailed user stories
- `boundaries/` - API contracts and interfaces
- Task dependencies and sequencing

### Tips for Better Results
- **Specify Technology Preferences**: Mention specific tools and frameworks
- **Include Performance Requirements**: Response times, throughput targets
- **Architectural Patterns**: MVC, microservices, event-driven, etc.
- **Integration Points**: External APIs, databases, message queues

---

## 4. `/test` - Test Generation (TDD Red Phase)

**Purpose**: Generate comprehensive failing tests that encode acceptance criteria and establish TDD red phase.

### Command Structure
```
/test <testing focus and coverage requirements>
```

### Usage Examples

#### Example 1: Authentication System Tests
```bash
/test Focus on security testing, API contract validation, and user journey tests. Include unit tests for password hashing, integration tests for authentication flow, contract tests for all API endpoints. Test edge cases like invalid tokens, expired sessions, brute force attempts. Ensure comprehensive coverage of all user stories and security requirements.
```

**Generated Test Structure**:
```
test/
├── unit/
│   ├── test_user_model.py        # User entity and password hashing
│   ├── test_auth_service.py      # Authentication business logic
│   └── test_token_manager.py     # JWT token operations
├── integration/
│   ├── test_registration_flow.py # End-to-end registration
│   ├── test_login_flow.py        # Complete login process
│   └── test_password_reset.py    # Password reset workflow
└── contract/
    ├── test_auth_api.py          # API endpoint contracts
    └── test_user_api.py          # User management endpoints
```

#### Example 2: Search Functionality Tests  
```bash
/test Emphasize search relevance testing, performance benchmarks, and user experience validation. Include unit tests for search algorithms, integration tests for Elasticsearch, contract tests for search API. Test query parsing, result ranking, autocomplete functionality, and filter combinations. Performance tests should validate sub-200ms response times.
```

#### Example 3: Analytics Dashboard Tests
```bash
/test Focus on real-time data accuracy, chart rendering, and export functionality. Include unit tests for data aggregation logic, integration tests for WebSocket connections, contract tests for analytics API. Test data visualization accuracy, real-time update mechanisms, and export generation. Include performance tests for dashboard load times.
```

### Key Outputs
- `test/` directory with organized test structure
- Comprehensive failing tests (TDD Red phase)
- `test-plan.md` with testing strategy
- Test-to-task traceability mapping
- Performance and security test coverage

### Tips for Better Results
- **Specify Test Types**: Unit, integration, contract, performance, security
- **Include Edge Cases**: Error conditions, boundary values, invalid inputs
- **Performance Criteria**: Response times, load requirements, scalability targets
- **Security Focus**: Authentication, authorization, data validation

---

## 5. `/implement` - TDD Implementation

**Purpose**: Execute implementation using TDD loop with automatic quality checks and constitutional compliance.

### Command Structure
```
/implement <task selection> [--mode=sequential] [--quality-gates=auto]
```

### Usage Examples

#### Example 1: Single Task Implementation
```bash
/implement P1-001 --mode=sequential --quality-gates=auto
```
Implements single task P1-001 with full TDD cycle and automatic quality checks.

#### Example 2: Task Range Implementation
```bash
/implement P1-001,P1-002,P1-003 --mode=sequential --quality-gates=auto
```
Implements specified tasks in dependency order with checkpoints between each.

#### Example 3: Batch Implementation with Manual Gates
```bash
/implement P1-001:P1-010 --mode=sequential --quality-gates=manual
```
Implements tasks P1-001 through P1-010 with manual approval at quality gates.

### TDD Workflow for Each Task

#### Red Phase
1. **Load Task**: Read task definition and requirements
2. **Run Tests**: Execute relevant tests (should fail initially)
3. **Verify Red**: Confirm tests fail for the right reasons

#### Green Phase  
1. **Minimal Implementation**: Write minimum code to pass tests
2. **Run Tests**: Execute test suite (should pass)
3. **Regression Check**: Run full test suite to avoid breaking changes

#### Refactor Phase
1. **Code Improvement**: Enhance code quality without changing behavior
2. **Test Stability**: Ensure tests remain green during refactoring
3. **Quality Metrics**: Validate code quality improvements

### Key Outputs
- Working code that passes all tests
- Updated `tasks.md` with completion status
- Implementation report with metrics
- Git commits with traceability to tasks
- Quality gate results and recommendations

### Tips for Better Results
- **Start Small**: Implement one task at a time initially
- **Trust the Process**: Follow Red-Green-Refactor strictly
- **Monitor Quality**: Pay attention to quality gate feedback
- **Task Dependencies**: Ensure prerequisites are completed first

---

## 6. `/review` - Quality Assurance

**Purpose**: Perform systematic quality assurance with architectural review and constitutional compliance checking.

### Command Structure
```
/review [--scope=changed|full] [--auto-fix=true|false] [files...]
```

### Usage Examples

#### Example 1: Incremental Review (During Development)
```bash
/review --scope=changed --auto-fix=true
```
Reviews only changed files with automatic fixes for safe issues.

#### Example 2: Full Feature Review (Before Merge)
```bash
/review --scope=full --auto-fix=false
```
Comprehensive review of entire feature with manual fix approval.

#### Example 3: Specific Component Review
```bash
/review src/auth/ tests/auth/ --scope=full
```
Focused review of authentication components and their tests.

### Review Checklist

#### Scope Analysis
- ✅ Changes align with epic requirements
- ✅ All acceptance criteria addressed
- ✅ No scope creep or unauthorized changes

#### Architecture Review
- ✅ Follows breakdown.md architecture decisions
- ✅ Respects component boundaries
- ✅ Maintains dependency rules
- ✅ Implements design patterns correctly

#### Code Quality
- ✅ Passes static analysis checks
- ✅ Maintains acceptable complexity metrics
- ✅ No code duplication or anti-patterns
- ✅ Proper error handling and logging
- ✅ Complete documentation

#### Constitutional Compliance
- ✅ Follows TDD principles
- ✅ Meets performance requirements
- ✅ Implements security measures
- ✅ Maintains 12-factor compliance
- ✅ Adheres to coding standards

### Key Outputs
- `review_report.md` with structured findings
- Categorized issues (critical, major, minor)
- Corrective tasks added to `tasks.md`
- Quality metrics comparison
- Approval status and next steps

### Tips for Better Results
- **Review Early**: Use `--scope=changed` during development
- **Full Reviews**: Always perform full review before feature completion
- **Auto-fix**: Enable for safe improvements, disable for critical changes
- **Address Findings**: Resolve critical and major issues before proceeding

---

## 7. `/refactor` - Code Improvement

**Purpose**: Improve internal code structure without changing behavior while maintaining green tests.

### Command Structure  
```
/refactor <scope> <techniques> [--safety=conservative|moderate|aggressive]
```

### Usage Examples

#### Example 1: Extract Methods and Simplify
```bash
/refactor src/auth/ extract_method,simplify_conditions,remove_duplication --safety=moderate
```
Refactors authentication module focusing on method extraction and simplification.

#### Example 2: Performance Optimization
```bash
/refactor src/search/ optimize_queries,cache_improvements,reduce_allocations --safety=conservative
```
Performance-focused refactoring for search components with conservative safety.

#### Example 3: Architecture Improvement
```bash
/refactor . strengthen_boundaries,reduce_coupling,improve_cohesion --safety=aggressive
```
System-wide architectural improvements with aggressive optimization.

### Available Refactoring Techniques

#### Code Structure
- `extract_method` - Break down large functions
- `extract_class` - Separate concerns into classes
- `rename_variable` - Improve naming clarity
- `simplify_conditions` - Reduce conditional complexity
- `remove_duplication` - Consolidate similar code

#### Architecture
- `strengthen_boundaries` - Improve module interfaces
- `reduce_coupling` - Minimize dependencies
- `improve_cohesion` - Group related functionality
- `eliminate_cycles` - Remove circular dependencies

#### Performance
- `optimize_queries` - Database query improvements
- `cache_improvements` - Add strategic caching
- `reduce_allocations` - Memory optimization
- `parallelize_operations` - Concurrency improvements

### Safety Levels

#### Conservative (Recommended for Production)
- Small, safe changes only
- Extensive testing between changes
- Immediate rollback on any test failure
- Focus on naming and simple extractions

#### Moderate (Good for Development)
- Balanced approach to improvements
- Method and class-level refactoring
- Performance optimizations with validation
- Architecture improvements with testing

#### Aggressive (Use with Caution)
- Large-scale structural changes
- Significant performance optimizations
- Architecture pattern implementations
- Requires extensive testing and validation

### Key Outputs
- Improved code quality metrics
- Refactoring report with before/after comparison
- Performance improvements documentation
- All tests remain green (mandatory)
- Architecture enhancement summary

### Tips for Better Results
- **Always Start Green**: Ensure all tests pass before refactoring
- **Small Steps**: Make incremental changes with frequent testing
- **Measure Impact**: Use metrics to validate improvements
- **Safety First**: Choose conservative settings for critical code

---

## Complete Workflow Example

Here's how to use all commands together for a complete feature:

### 1. Initialize Project
```bash
/init django, postgres, redis, celery - e-commerce platform with real-time notifications
```

### 2. Create Feature Epic
```bash
/epic User notification system that sends real-time alerts for order updates, promotional offers, and account activities. Users should receive notifications via email, SMS, and in-app messages with preference controls. Success criteria: notifications delivered within 30 seconds, 95% delivery rate, user preference management, unsubscribe functionality.
```

### 3. Technical Breakdown
```bash
/breakdown Use Celery for async notification processing, WebSocket for real-time delivery, Redis for notification queues. Implement notification templates, user preferences with database storage, external service integrations for email/SMS. Design for high throughput and delivery reliability.
```

### 4. Generate Tests
```bash
/test Focus on notification delivery reliability, template rendering accuracy, and user preference handling. Include unit tests for notification logic, integration tests for service integrations, contract tests for API endpoints. Test delivery failures, retry mechanisms, and performance under load.
```

### 5. Implement Features
```bash
/implement P1-001:P1-015 --mode=sequential --quality-gates=auto
```

### 6. Review Implementation
```bash
/review --scope=full --auto-fix=false
```

### 7. Refactor for Optimization
```bash
/refactor src/notifications/ optimize_queries,cache_improvements --safety=moderate
```

This workflow ensures systematic, high-quality feature development with comprehensive testing, quality assurance, and continuous improvement.

---

## Best Practices Summary

### Command Usage
- **Be Specific**: Provide detailed context and requirements
- **Follow Sequence**: Use commands in the recommended order
- **Include Context**: Add technical preferences and constraints
- **Validate Results**: Review generated artifacts before proceeding

### Quality Assurance
- **Test-Driven**: Always generate tests before implementation
- **Constitutional Compliance**: Follow project governance principles
- **Regular Reviews**: Use incremental reviews during development
- **Refactor Regularly**: Maintain code quality through systematic improvement

### Team Collaboration
- **Document Decisions**: Use epics and breakdowns for team communication
- **Track Progress**: Monitor task completion and quality metrics
- **Share Knowledge**: Review reports provide learning opportunities
- **Maintain Standards**: Constitutional compliance ensures consistency

This guide provides the foundation for maximizing the effectiveness of LSF commands in your development workflow.