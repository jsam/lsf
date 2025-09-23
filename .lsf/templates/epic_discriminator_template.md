# Epic Discriminator: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Validated**: [DATE]
**Status**: [PASS/FAIL/NEEDS_REVISION]
**Epic Source**: [Path to epic being validated]
**Constitution Version**: [Version of web-app-constitution used]

## Discriminator Execution Flow (main)
```
1. Load Epic document from Epic Source
   → If not found: ERROR "Epic document not found"
2. Load Web-App Constitution
   → If not found: ERROR "Constitution not found"
3. Run Constitutional Compliance Check
   → For each article: validate epic alignment
   → Mark violations with [VIOLATION: Article X, Section Y]
4. Run Agentic Principles Validation
   → Check Article 0 compliance
   → If violations found: FAIL "Violates agentic principles"
5. Run Epic Quality Gates
   → Check for implementation details
   → Validate measurability of requirements
   → Ensure user value clarity
6. Generate Compliance Report
   → List all violations and warnings
   → Suggest remediation steps
7. Make Discrimination Decision
   → If critical violations: FAIL
   → If minor issues: NEEDS_REVISION
   → If fully compliant: PASS
8. Return: Discrimination result with detailed report
```

---

## ⚡ Discriminator Guidelines
- Validates epics against constitutional principles BEFORE breakdown
- Ensures alignment with project governance and technical standards
- Prevents non-compliant features from entering development pipeline
- Acts as quality gate between epic creation and technical breakdown

### Validation Scope
- **Constitutional Alignment**: Epic must respect all applicable articles
- **Agentic Principles**: Must follow Article 0 guidelines
- **Technical Feasibility**: Requirements must be achievable within constraints
- **Quality Standards**: Must meet documentation and clarity requirements

---

## Constitutional Compliance Check

### Article 0: Agentic Development Principles
- [ ] **Context Efficiency**: Epic avoids unnecessary context/information
- [ ] **Minimalism**: Features reduced to minimum viable scope
- [ ] **Reasonable Defaults**: Leverages existing patterns where possible
- [ ] **Agent-centric**: Written for agent consumption (clear, unambiguous)
- [ ] **Focus**: Contributes directly to software production
- [ ] **Boundaries**: Clear separation of concerns

**Violations Found**: [List any Article 0 violations]

### Article I: Core Development Principles

#### TDD Compatibility Check
- [ ] Requirements are testable (can write tests before implementation)
- [ ] Success criteria support test coverage requirements ({{MIN_COVERAGE}}%)
- [ ] User stories map to testable scenarios

**Violations Found**: [List any TDD incompatibilities]

#### Domain-Driven Design Alignment
- [ ] Respects bounded contexts (no cross-domain mixing)
- [ ] Uses consistent ubiquitous language
- [ ] Identifies aggregate roots where applicable

**Violations Found**: [List any DDD violations]

#### API-First Validation
- [ ] Requirements support contract-first development
- [ ] Versioning considerations addressed
- [ ] API documentation requirements acknowledged

**Violations Found**: [List any API-first violations]

### Article II: Architecture Principles

#### Twelve-Factor Compliance
- [ ] Stateless process requirements respected
- [ ] Configuration externalization considered
- [ ] Service boundaries clearly defined
- [ ] No hardcoded environment dependencies

**Violations Found**: [List any 12-factor violations]

#### Security Requirements Check
- [ ] Authentication requirements specified
- [ ] Authorization/RBAC considerations included
- [ ] Data protection requirements identified
- [ ] No security anti-patterns introduced

**Violations Found**: [List any security violations]

#### Performance Standards Validation
- [ ] Response time requirements achievable ({{MAX_RESPONSE_TIME}}ms)
- [ ] Throughput requirements realistic ({{MIN_RPS}} rps)
- [ ] No obvious performance anti-patterns

**Violations Found**: [List any performance violations]

### Article III: Code Quality Standards
- [ ] Requirements support clean code principles
- [ ] Architectural patterns not violated
- [ ] Separation of concerns maintained

**Violations Found**: [List any code quality violations]

### Article IV: Development Workflow
- [ ] Compatible with {{BRANCHING_STRATEGY}}
- [ ] Supports CI/CD pipeline requirements
- [ ] Monitoring/observability requirements considered

**Violations Found**: [List any workflow violations]

### Article V: Data Management
- [ ] Data privacy requirements identified
- [ ] API data contracts achievable
- [ ] Database principles not violated

**Violations Found**: [List any data management violations]

---

## Epic Quality Validation

### Epic Structure Check
- [ ] All mandatory sections present and complete
- [ ] No [NEEDS CLARIFICATION] markers remain unresolved
- [ ] User stories follow proper format
- [ ] Functional requirements are measurable

**Quality Issues Found**: [List any structure issues]

### Business/Technical Separation
- [ ] No implementation details leaked into epic
- [ ] Focus remains on WHAT not HOW
- [ ] No technology stack decisions made
- [ ] No architectural choices specified

**Separation Violations**: [List any business/technical mixing]

### Requirement Analysis
- [ ] All requirements testable and measurable
- [ ] Success criteria specific and time-bound
- [ ] Constraints clearly justified
- [ ] Dependencies identified

**Requirement Issues**: [List any requirement problems]

---

## Discrimination Report

### Critical Violations
[List violations that cause immediate FAIL]

### Major Issues (Requires Revision)
[List issues that need fixing before approval]

### Minor Warnings (Advisory)
[List recommendations for improvement]

### Suggested Remediations
1. [Specific fix for violation 1]
2. [Specific fix for violation 2]
3. [Additional improvements]

---

## Discrimination Decision

**Result**: [PASS/FAIL/NEEDS_REVISION]

### Rationale
[Detailed explanation of discrimination decision]

### Required Actions
- [ ] [Action 1 needed before approval]
- [ ] [Action 2 needed before approval]

### Recommended Next Steps
**If PASS**: Proceed to technical breakdown
**If NEEDS_REVISION**: Address listed violations and resubmit
**If FAIL**: Major rework required - reconsider feature scope

---

## Validation Metadata

### Discriminator Configuration
- Constitution Version: {{CONSTITUTION_VERSION}}
- Validation Strictness: [STRICT/STANDARD/LENIENT]
- Epic Template Version: {{EPIC_TEMPLATE_VERSION}}

### Validation History
| Date | Validator | Result | Notes |
|------|----------|--------|-------|
| [DATE] | [AGENT/USER] | [RESULT] | [NOTES] |

### Exceptions Granted
[List any constitutional exceptions approved for this epic]

---

## Automated Validation Checklist
*These checks can be automated in CI/CD pipeline*

- [ ] Epic template structure valid
- [ ] All required fields populated
- [ ] No template placeholders remaining
- [ ] Markdown syntax valid
- [ ] Links and references valid
- [ ] No merge conflict markers
- [ ] File naming convention followed

---

*This discriminator ensures epics comply with project constitution before entering the development pipeline. Non-compliant epics shall not proceed to technical breakdown.*