# LSF Commands Quick Reference

## Command Workflow
```
/init → /epic → /breakdown → /test → /implement → /review → /refactor
```

## Command Syntax & Examples

### `/init` - Project Bootstrap
```bash
/init <stack1>, <stack2>, <stack3> - <project description>

# Examples
/init django, postgres, redis - e-commerce platform
/init fastapi, pgvector, celery - AI document search  
/init vue, django, postgres - SaaS dashboard
```

### `/epic` - Feature Definition
```bash
/epic <detailed feature description with user value and acceptance criteria>

# Example  
/epic User authentication system with email verification, secure login, password reset, and role-based access. Success criteria: secure storage, 15-min email verification, end-to-end password reset, role permissions working.
```

### `/breakdown` - Technical Planning
```bash
/breakdown <technical context and architectural preferences>

# Example
/breakdown Use JWT tokens, bcrypt hashing, Redis sessions, email integration. REST API, rate limiting, database migrations. Prioritize security, ensure GDPR compliance.
```

### `/test` - Test Generation (TDD Red)
```bash
/test <testing focus and coverage requirements>

# Example
/test Focus on security testing, API contracts, user journey tests. Include unit tests for password hashing, integration tests for auth flow, edge cases for invalid tokens.
```

### `/implement` - TDD Implementation
```bash
/implement <task-selection> [options]

# Examples
/implement P1-001                    # Single task
/implement P1-001,P1-002,P1-003     # Multiple tasks
/implement P1-001:P1-010            # Task range
```

### `/review` - Quality Assurance
```bash
/review [--scope=changed|full] [--auto-fix=true|false] [files...]

# Examples
/review --scope=changed --auto-fix=true    # Incremental review
/review --scope=full --auto-fix=false      # Full feature review
/review src/auth/ tests/auth/               # Specific components
```

### `/refactor` - Code Improvement
```bash
/refactor <scope> <techniques> [--safety=level]

# Examples
/refactor src/auth/ extract_method,simplify_conditions --safety=moderate
/refactor src/search/ optimize_queries,cache_improvements --safety=conservative
/refactor . strengthen_boundaries,reduce_coupling --safety=aggressive
```

## Key Principles

### For Maximum Accuracy:

1. **Be Specific**: Include detailed requirements and constraints
2. **Provide Context**: Technical preferences, performance targets, security needs
3. **Follow Sequence**: Use commands in order for best results
4. **Include Success Criteria**: Measurable, testable acceptance criteria

### Command-Specific Tips:

#### `/init`
- Specify exact technology stack components
- Include project purpose and main features
- Be descriptive about the domain/business area

#### `/epic` 
- Focus on user value and business outcomes
- Include specific acceptance criteria
- Mention performance/security requirements
- Define measurable success metrics

#### `/breakdown`
- Specify architectural patterns and technologies
- Include performance targets and constraints
- Mention integration requirements
- Prioritize security vs performance tradeoffs

#### `/test`
- Specify test types needed (unit, integration, contract, performance)
- Include edge cases and error conditions
- Mention security testing requirements
- Define performance benchmarks

#### `/implement`
- Start with single tasks initially
- Use sequential mode for dependency management
- Enable auto quality gates for faster feedback
- Follow TDD Red-Green-Refactor cycle

#### `/review`
- Use incremental reviews during development
- Full reviews before feature completion
- Enable auto-fix for safe improvements
- Address critical findings immediately

#### `/refactor`
- Always start with green tests
- Use conservative safety for production code
- Focus on one improvement type at a time
- Measure before/after metrics

## Common Patterns

### New Feature Development
```bash
/epic [detailed feature description]
/breakdown [technical approach]
/test [testing strategy]  
/implement P1-001:P1-010
/review --scope=full
/refactor [scope] [techniques] --safety=moderate
```

### Bug Fix Workflow  
```bash
/test [reproduce bug with failing test]
/implement [task-id] --mode=sequential
/review --scope=changed --auto-fix=true
```

### Code Quality Improvement
```bash
/review --scope=full  # Identify issues
/refactor [scope] [techniques] --safety=conservative
/review --scope=changed --auto-fix=true
```

## Success Indicators

- ✅ All tests pass (green)
- ✅ Constitutional compliance maintained
- ✅ Quality metrics improve or maintain
- ✅ Performance targets met
- ✅ Security requirements satisfied
- ✅ Documentation complete
- ✅ Code review approved

## Troubleshooting

### Command Fails?
1. Check constitutional compliance
2. Verify prerequisite tasks completed
3. Ensure all tests are green
4. Review error messages and logs

### Poor Results?
1. Provide more specific context
2. Include detailed acceptance criteria  
3. Specify technical constraints
4. Follow recommended command sequence

### Quality Issues?
1. Run `/review --scope=full`
2. Address critical findings
3. Use `/refactor` for improvements
4. Validate with `/test` coverage