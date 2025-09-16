# LSF Workflow Integration Patterns

This document explains how LSF commands integrate together and provides patterns for different development scenarios.

## Core Workflow Architecture

```mermaid
graph TD
    A[/init] --> B[Project Constitution + Structure]
    B --> C[/epic] 
    C --> D[Feature Requirements]
    D --> E[/breakdown]
    E --> F[Technical Plan + Tasks]
    F --> G[/test]
    G --> H[Failing Tests (Red Phase)]
    H --> I[/implement]
    I --> J[Working Code (Green Phase)]
    J --> K[/review]
    K --> L{Quality Gates}
    L -->|Pass| M[/refactor]
    L -->|Fail| N[Corrective Tasks]
    N --> I
    M --> O[Improved Code]
    O --> P[Feature Complete]
```

## Command Dependencies and Data Flow

### 1. Data Dependencies
```
/init → Project Constitution, Tech Stack
├── /epic → epic.md (requires project context)
│   └── /breakdown → breakdown.md, tasks.md (requires epic.md)
│       ├── /test → test/ directory (requires breakdown.md, tasks.md)
│       │   └── /implement → working code (requires failing tests)
│       │       ├── /review → review_report.md (requires code changes)
│       │       │   └── /refactor → improved code (requires green tests)
│       │       └── corrective tasks → tasks.md (if review fails)
│       └── multiple iterations possible
```

### 2. File Artifacts Flow
```
Constitution (.lsf/memory/constitution.md)
    ↓
Epic (epic.md) ← User Requirements
    ↓
Breakdown (breakdown.md, tasks.md, stories.md) ← Technical Decisions
    ↓
Tests (test/ directory, test-plan.md) ← Quality Requirements
    ↓
Implementation (source code) ← TDD Cycle
    ↓
Review (review_report.md) ← Quality Analysis
    ↓
Refactoring (improved code) ← Code Quality
```

---

## Integration Patterns by Scenario

### Pattern 1: New Project Setup

**Scenario**: Starting a completely new project from scratch.

```bash
# Step 1: Project Bootstrap
/init fastapi, postgres, redis, celery - task management SaaS with real-time collaboration

# Step 2: First Feature Epic
/epic User workspace management that allows users to create, organize, and share project workspaces. Users should be able to create workspaces, invite team members, set permissions, and manage workspace settings. Success criteria: workspace creation under 2 seconds, real-time member updates, role-based permissions working, workspace sharing via invite links.

# Step 3: Technical Planning
/breakdown Use FastAPI with async/await, PostgreSQL for data persistence, Redis for real-time updates, WebSocket connections for live collaboration. Implement RBAC with JWT tokens, workspace isolation, invitation system with email notifications. Focus on real-time performance and security.

# Step 4: Test Generation  
/test Focus on workspace isolation, permission validation, real-time synchronization. Include unit tests for workspace logic, integration tests for member management, contract tests for WebSocket API. Test concurrent access, permission boundaries, invitation workflows.

# Step 5: Implementation
/implement P1-001:P1-020 --mode=sequential --quality-gates=auto

# Step 6: Quality Review
/review --scope=full --auto-fix=false

# Step 7: Optimization
/refactor src/workspace/ optimize_queries,cache_improvements --safety=moderate
```

### Pattern 2: Feature Addition (Existing Project)

**Scenario**: Adding new feature to existing codebase.

```bash
# Step 1: Feature Definition (builds on existing constitution)
/epic Advanced search functionality with full-text search, filters, and saved queries. Users should be able to search across all workspace content, apply multiple filters, save frequent searches, and get relevant results ranked by importance. Success criteria: search response under 200ms, faceted navigation working, saved searches persistent, search analytics tracking.

# Step 2: Technical Integration Planning
/breakdown Integrate Elasticsearch with existing PostgreSQL, implement search indexing pipeline with Celery background jobs, create search API endpoints following existing patterns. Use Redis for autocomplete caching, implement search analytics, ensure search security respects workspace permissions.

# Step 3: Focused Test Generation
/test Emphasize search relevance, performance benchmarks, permission boundaries. Include unit tests for search algorithms, integration tests with Elasticsearch, contract tests for search API. Test search across different content types, filter combinations, permission isolation.

# Step 4: Incremental Implementation
/implement P2-001,P2-002,P2-003 --mode=sequential --quality-gates=auto

# Step 5: Incremental Review
/review --scope=changed --auto-fix=true

# Step 6: Continue Implementation  
/implement P2-004:P2-015 --mode=sequential --quality-gates=auto

# Step 7: Final Review
/review --scope=full --auto-fix=false

# Step 8: Performance Optimization
/refactor src/search/ optimize_queries,cache_improvements,reduce_allocations --safety=conservative
```

### Pattern 3: Bug Fix and Quality Improvement

**Scenario**: Fixing bugs and improving existing code quality.

```bash
# Step 1: Issue Analysis (no new epic needed)
/review src/auth/ tests/auth/ --scope=full

# Step 2: Create Bug Fix Tests
/test Focus on reproducing authentication edge cases, session management bugs, token validation issues. Create failing tests that demonstrate the bugs, include unit tests for auth logic, integration tests for login flows.

# Step 3: Implement Fixes
/implement BUG-001,BUG-002 --mode=sequential --quality-gates=auto

# Step 4: Validate Fixes
/review --scope=changed --auto-fix=true

# Step 5: Code Quality Improvement
/refactor src/auth/ extract_method,simplify_conditions,remove_duplication --safety=moderate

# Step 6: Final Validation
/review --scope=changed --auto-fix=false
```

### Pattern 4: Performance Optimization Sprint

**Scenario**: Dedicated performance improvement without new features.

```bash
# Step 1: Performance Analysis
/review --scope=full --auto-fix=false

# Step 2: Performance Test Generation
/test Focus on performance benchmarks, load testing, memory profiling. Create performance tests for critical paths, database query analysis, API response time validation. Include stress tests for concurrent usage.

# Step 3: Incremental Optimization
/refactor src/api/ optimize_queries,cache_improvements --safety=conservative

# Step 4: Validate Performance Gains
/review --scope=changed --auto-fix=true

# Step 5: Continue Optimization
/refactor src/db/ reduce_allocations,optimize_queries --safety=conservative

# Step 6: System-wide Improvements
/refactor . strengthen_boundaries,reduce_coupling --safety=moderate

# Step 7: Final Performance Validation
/review --scope=full --auto-fix=false
```

### Pattern 5: Major Refactoring Initiative

**Scenario**: Large-scale architectural improvements.

```bash
# Step 1: Current State Analysis
/review --scope=full --auto-fix=false

# Step 2: Refactoring Epic (if needed)
/epic Architecture modernization to improve code maintainability, reduce technical debt, and enhance system scalability. Goals include extracting reusable components, simplifying complex modules, improving test coverage, and optimizing performance bottlenecks.

# Step 3: Refactoring Plan
/breakdown Break down refactoring into phases: component extraction, interface simplification, performance optimization, test coverage improvement. Use strangler fig pattern for gradual migration, maintain backward compatibility, implement feature flags for safe rollout.

# Step 4: Safety Net Tests
/test Create comprehensive test coverage for existing functionality before refactoring. Include regression tests, integration tests for critical paths, performance benchmarks to validate improvements.

# Step 5: Phase 1 - Component Extraction
/refactor src/core/ extract_class,strengthen_boundaries --safety=conservative

# Step 6: Validate Phase 1
/review --scope=changed --auto-fix=true

# Step 7: Phase 2 - Simplification
/refactor src/services/ simplify_conditions,remove_duplication --safety=moderate

# Step 8: Validate Phase 2
/review --scope=changed --auto-fix=true

# Step 9: Phase 3 - Performance
/refactor . optimize_queries,cache_improvements,parallelize_operations --safety=moderate

# Step 10: Final Validation
/review --scope=full --auto-fix=false
```

---

## Advanced Integration Patterns

### Multi-Feature Development

**Scenario**: Multiple features being developed in parallel.

```bash
# Feature A Branch
/epic [Feature A requirements]
/breakdown [Feature A technical plan]
/test [Feature A test generation]
/implement P1-001:P1-010 --mode=sequential

# Feature B Branch (parallel development)
/epic [Feature B requirements]  
/breakdown [Feature B technical plan]
/test [Feature B test generation]
/implement P2-001:P2-008 --mode=sequential

# Integration Phase
/review --scope=full --auto-fix=false  # Both features
/refactor . strengthen_boundaries,reduce_coupling --safety=conservative
```

### Continuous Quality Improvement

**Scenario**: Regular quality maintenance cycle.

```bash
# Weekly Quality Review
/review --scope=full --auto-fix=false

# Address Critical Issues
/test [focused testing for critical areas]
/implement QA-001:QA-005 --mode=sequential

# Monthly Refactoring
/refactor [problem areas] extract_method,simplify_conditions --safety=conservative

# Quarterly Architecture Review
/review --scope=full --auto-fix=false
/refactor . strengthen_boundaries,improve_cohesion --safety=moderate
```

### Emergency Bug Fix

**Scenario**: Critical production issue requiring immediate fix.

```bash
# Step 1: Reproduce Issue
/test Create failing test that reproduces the production bug, focus on edge cases and error conditions that caused the failure.

# Step 2: Minimal Fix
/implement HOTFIX-001 --mode=sequential --quality-gates=auto

# Step 3: Quick Validation
/review --scope=changed --auto-fix=true

# Step 4: Deploy and Monitor
# (Manual deployment process)

# Step 5: Follow-up Improvement (after production stability)
/refactor [affected area] simplify_conditions,improve_error_handling --safety=conservative
```

---

## Command Integration Best Practices

### 1. Information Flow Optimization

**Carry Context Forward**: Each command builds on previous outputs
```bash
# Good: Specific, builds on previous context
/breakdown Use the JWT authentication from epic, implement with FastAPI dependency injection, Redis for session storage as specified

# Poor: Generic, ignores previous context  
/breakdown Implement authentication system
```

### 2. Quality Gate Integration

**Progressive Quality Checking**: Use reviews at multiple stages
```bash
# During development
/implement P1-001,P1-002 --quality-gates=auto
/review --scope=changed --auto-fix=true

# Before feature completion
/implement P1-003:P1-010 --quality-gates=auto  
/review --scope=full --auto-fix=false
```

### 3. Feedback Loop Integration

**Iterative Improvement**: Use command outputs to improve inputs
```bash
# If review finds architectural issues
/review --scope=full
# → Review identifies boundary violations

/refactor src/services/ strengthen_boundaries --safety=moderate
# → Refactor fixes boundaries

/review --scope=changed --auto-fix=true
# → Validate improvements
```

### 4. Test-Driven Integration

**Maintain TDD Discipline**: Always have failing tests before implementation
```bash
# Correct TDD flow
/test [comprehensive test generation]  # Red phase
/implement [tasks] --quality-gates=auto  # Green phase
/refactor [improvements] --safety=moderate  # Refactor phase
```

### 5. Constitutional Compliance

**Align with Project Principles**: All commands respect project constitution
- `/epic` → Aligns with business principles
- `/breakdown` → Follows architectural principles  
- `/test` → Enforces quality principles
- `/implement` → Maintains TDD principles
- `/review` → Validates constitutional compliance
- `/refactor` → Improves adherence to principles

---

## Common Integration Antipatterns

### ❌ Antipattern 1: Skipping Tests
```bash
/epic [feature]
/breakdown [plan]
# Missing: /test command
/implement [tasks]  # Implementing without tests
```

### ❌ Antipattern 2: Generic Commands
```bash
/epic User management system  # Too vague
/breakdown Standard patterns  # No specificity
/test Basic testing  # Lacks focus
```

### ❌ Antipattern 3: Ignoring Reviews
```bash
/implement P1-001:P1-020
# Missing: /review command
/refactor [improvements]  # Refactoring without quality analysis
```

### ❌ Antipattern 4: Breaking TDD Cycle
```bash
/implement P1-001 --quality-gates=manual
# Manually overriding quality gates without justification
```

---

## Success Metrics for Integration

### Process Metrics
- **Command Sequence Adherence**: Following recommended workflow
- **Quality Gate Pass Rate**: Automatic quality checks passing
- **Test Coverage Maintenance**: Tests stay green throughout workflow
- **Constitutional Compliance**: All principles followed

### Output Quality Metrics  
- **Epic Clarity**: Clear user value and acceptance criteria
- **Technical Alignment**: Breakdown matches epic requirements
- **Test Coverage**: Comprehensive failing tests before implementation
- **Code Quality**: Improving metrics through refactoring
- **Review Outcomes**: Issues identified and resolved

### Team Productivity Metrics
- **Feature Completion Time**: End-to-end workflow duration
- **Defect Reduction**: Fewer bugs due to TDD and reviews
- **Code Maintainability**: Easier changes due to refactoring
- **Knowledge Sharing**: Clear documentation and review reports

This integration approach ensures that LSF commands work together seamlessly to deliver high-quality, maintainable software following constitutional principles and modern development practices.