# Technical Breakdown: [FEATURE NAME]

**Epic**: [link to epic.md]  
**Branch**: `[###-feature-name]`  
**Date**: [DATE]  
**Input**: Epic from `epic.md`

## Execution Flow (main)
```
1. Load and analyze epic.md
   → If not found: ERROR "Epic required for breakdown"
2. Extract technical requirements from functional requirements
   → Map each ER-### to technical components
3. Design system architecture
   → Define components, boundaries, and interactions
   → Ensure constitutional compliance (library-first, CLI interfaces)
4. Design data models (if applicable)
   → Entity definitions, relationships, validation rules
5. Design API contracts (if applicable)
   → Endpoints, request/response formats, error handling
6. Identify technical dependencies
   → Libraries, frameworks, external services
   → Secrets that need to provided prior to implementation and secure injection mechanism
7. Define implementation strategy
   → Development phases, priorities, risk mitigation
8. Generate task breakdown
   → Granular, testable tasks with clear DoD
   → TDD ordering: tests before implementation
   → Mark parallel tasks with [P]
   → Assign task IDs (P1-001, P1-002, etc.)
9. Validate constitutional compliance
   → Library-first architecture enforced
   → CLI interfaces defined for each library
   → TDD principles embedded in task ordering
10. Generate tasks.md file
    → Include task dependencies and sequential execution order
    → Single-agent workflow metadata
11. Return: SUCCESS (ready for test generation)
```

---

## Architecture Decisions

### System Architecture
[High-level system design and component organization]

**Core Principles** (from constitution):
- Library-first architecture: Every feature as a standalone library
- CLI interfaces: Each library exposes functionality via CLI
- Constitutional compliance: All decisions align with project constitution

**Components**:
- [Component 1]: [Purpose and responsibilities]
- [Component 2]: [Purpose and responsibilities]  
- [Component 3]: [Purpose and responsibilities]

**Component Boundaries**:
- [Clear separation of concerns and interface definitions]
- [Dependencies and interaction patterns]

### Technology Stack
**Language/Framework**: [Based on constitutional requirements and project context]  
**Core Dependencies**: [Minimal, justified dependencies]  
**Testing Framework**: [TDD-compatible testing approach]  
**CLI Framework**: [For library interfaces]

### Constitutional Compliance Check
- ✅ Library-first: Each component designed as independent library
- ✅ CLI interfaces: Command structure defined for each library  
- ✅ TDD enforced: Test tasks ordered before implementation
- ✅ Minimal dependencies: Each dependency justified
- ✅ Simplicity: Avoiding unnecessary patterns and abstractions

---

## Data Models *(if applicable)*

### Entity Definitions
[Core data structures and their relationships]

**[Entity 1]**:
- Purpose: [What this entity represents]
- Key Attributes: [Essential fields without implementation details]
- Relationships: [How it connects to other entities]
- Validation Rules: [Business rules for data integrity]

**[Entity 2]**:
- Purpose: [What this entity represents]  
- Key Attributes: [Essential fields]
- Relationships: [Connections to other entities]
- Validation Rules: [Business rules]

### State Management
[How entities change state over time]
- State Transitions: [Valid state changes]
- Business Rules: [Constraints on state changes]
- Persistence Strategy: [How data is stored and retrieved]

---

## API Design *(if applicable)*

### Endpoint Structure
[RESTful or other API patterns following constitutional principles]

**Command Endpoints** (CLI-driven):
- `POST /[entity]/[action]` - [Description and business logic]
- `GET /[entity]/{id}` - [Retrieval with filtering/pagination]
- `PUT /[entity]/{id}` - [Update with validation rules]
- `DELETE /[entity]/{id}` - [Deletion with cascade rules]

### Request/Response Formats
[Standard formats and error handling]
- Success Responses: [Format and status codes]
- Error Responses: [Consistent error structure]
- Validation Rules: [Input validation and sanitization]

### CLI Integration
[How API endpoints map to CLI commands]
- CLI Command: `[library-name] [action] [parameters]`
- API Mapping: [Which endpoints are called]
- Output Format: [Human-readable and JSON options]

---

## Implementation Strategy

### Development Phases
**Phase 1 - Core Infrastructure**:
- Library structure and CLI scaffolding
- Basic data models and validation
- Test framework setup

**Phase 2 - Business Logic**:  
- Core functionality implementation
- API endpoint implementation
- Integration between components

**Phase 3 - Quality & Polish**:
- Performance optimization
- Error handling and edge cases
- Documentation and examples

### Risk Mitigation
- [Key technical risks and mitigation strategies]
- [Dependency risks and alternatives]
- [Performance risks and monitoring]

### Single-Agent Workflow
- Sequential development approach defined
- Task dependencies mapped for proper ordering
- Quality checkpoint strategies for continuous feedback

---

## Task Generation Strategy

### Task Categories
**Infrastructure Tasks** (P1-001 to P1-010):
- Project setup, dependency management
- Library structure and CLI scaffolding
- Test framework and quality gates

**Test Development Tasks** (P1-011 to P1-020):
- Contract test generation (TDD Red)
- Integration test scenarios
- Unit test suites for each component

**Implementation Tasks** (P1-021 to P1-040):
- Core component development
- API endpoint implementation
- Integration and glue code

**Quality Tasks** (P1-041 to P1-050):
- Performance optimization
- Error handling and resilience
- Documentation and examples

### Parallel Execution Groups
- **Group: Infrastructure** - Sequential setup tasks
- **Group: Testing** - Parallel test development [P]
- **Group: Components** - Parallel component implementation [P]
- **Group: Integration** - Sequential integration tasks
- **Group: Quality** - Parallel quality improvements [P]

### Task Dependencies
[Clear dependency relationships to prevent blocking]
- Infrastructure → Testing → Implementation → Integration → Quality
- Within groups: Independent tasks marked [P] for parallel execution

---

## Constitutional Validation

### Architecture Compliance
- ✅ **Library-First**: Each component designed as standalone library
- ✅ **CLI Interfaces**: Command structure defined for user interaction
- ✅ **Minimal Dependencies**: All external dependencies justified
- ✅ **Test-Driven**: TDD ordering enforced in task structure

### Quality Standards  
- ✅ **Simplicity**: Avoiding over-engineering and unnecessary patterns
- ✅ **Observability**: Structured logging and monitoring planned
- ✅ **Documentation**: Each library includes comprehensive documentation
- ✅ **Versioning**: Semantic versioning and breaking change management

---

## Progress Tracking
*Updated during execution*

### Breakdown Status
- [ ] Epic analyzed and technical requirements extracted
- [ ] System architecture designed
- [ ] Data models defined (if applicable)
- [ ] API contracts designed (if applicable)  
- [ ] Technical dependencies identified
- [ ] Implementation strategy defined
- [ ] Constitutional compliance validated

### Task Generation Status
- [ ] Task categories defined
- [ ] Task dependencies mapped
- [ ] Sequential execution order identified
- [ ] tasks.md file generated with complete task list
- [ ] Single-agent workflow metadata included

---
