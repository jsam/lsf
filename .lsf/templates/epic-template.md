# Epic: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, business value, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
   → Suggest the minimal possible solution
4. Fill User Stories section
   → If no clear user scenarios: ERROR "Cannot determine user value"
5. Generate Functional Requirements
   → Each requirement must be testable and measurable
   → Mark ambiguous requirements for clarification
6. Identify Constraints
   → technical, regulatory, or timeline constraints
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Epic has uncertainties"
   → If implementation details found: ERROR "Remove tech details from epic"
8. Return: SUCCESS (epic ready for breakdown)
```

---

## ⚡ Epic Guidelines
- Focus on WHAT users need and WHY it matters (business value)
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Written for business stakeholders and product owners
- Clear, measurable outcomes that define success

### Section Requirements
- **Mandatory sections**: Must be completed for every epic
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this epic from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption
2. **Don't guess business requirements**: If the prompt doesn't specify user value, mark it
3. **Think like a product owner**: Every vague requirement should fail the "measurable outcome" test
4. **Common underspecified areas**:
   - Target user personas and their needs
   - Regulatory or compliance requirements
   - Integration with existing systems

---

## Overview
[High-level description of the feature and its business value]

## User Stories
[Key user scenarios that describe who wants what and why]

### Primary User Story
**As a** [user type]  
**I want** [capability]  
**So that** [business value]

### Additional User Stories
- **As a** [user type] **I want** [capability] **so that** [value]
- **As a** [user type] **I want** [capability] **so that** [value]

## Functional Requirements
[Specific capabilities the system must provide - focus on WHAT, not HOW]

- **ER-001**: System MUST [specific capability with measurable outcome]
- **ER-002**: Users MUST be able to [key interaction with clear success criteria]  
- **ER-003**: System MUST [data/behavior requirement with validation rules]
- **ER-004**: System MUST [integration requirement with clear boundaries]

*Example of marking unclear requirements:*
- **ER-005**: System MUST authenticate users [NEEDS CLARIFICATION: auth method, user types, security level?]
- **ER-006**: System MUST handle [NEEDS CLARIFICATION: volume, performance targets, error scenarios?]

## Constraints
[Limitations that must be respected during implementation]

### Technical Constraints
- Platform: [target platforms/environments]
- Integration: [existing systems that must be preserved]
- Performance: [non-negotiable performance requirements]

### Regulatory Constraints
- Compliance: [legal/regulatory requirements]
- Security: [security standards that must be met]
- Privacy: [data protection requirements]

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Epic Quality
- [ ] No implementation details (languages, frameworks, APIs, database schemas)
- [ ] Focused on user value and business outcomes
- [ ] Written for business stakeholders (product owners, users)
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] All requirements are testable and measurable
- [ ] Success criteria are specific and time-bound
- [ ] User stories follow "As a...I want...So that" format
- [ ] Constraints are clearly identified and justified

### Business Alignment
- [ ] Clear business value articulated
- [ ] Target users and personas identified
- [ ] Success metrics aligned with business goals
- [ ] Competitive differentiation understood
- [ ] Stakeholder approval obtained

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked for clarification
- [ ] User stories defined
- [ ] Functional requirements generated
- [ ] Success criteria established
- [ ] Constraints identified
- [ ] Review checklist passed

---