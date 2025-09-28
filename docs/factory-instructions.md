# Software Factory Instructions

## Overview
The LSF (LLM Software Factory) is an automated system for producing industry-grade software using LLMs. It follows a structured pipeline from human specifications to working code through multiple transformation layers.

## Core Pipeline Commands

### 1. `/spec-to-requirements`
Transforms human-readable specifications into technical requirements.

**Input**: Human specification in `specs/human-spec-*.md`
**Output**: Technical requirements in `specs/requirements-*.md`

```bash
# Example usage
/spec-to-requirements specs/human-spec-login.md
```

### 2. `/requirements-to-red`
Converts technical requirements into failing tests (Red phase of TDD).

**Input**: Requirements from `specs/requirements-*.md`
**Output**: Failing test specifications in `specs/red-*.md`

```bash
# Example usage
/requirements-to-red specs/requirements-login.md
```

### 3. `/red-to-green`
Implements code to make failing tests pass (Green phase of TDD).

**Input**: Red test specifications from `specs/red-*.md`
**Output**: Implementation plan in `specs/green-*.md`

```bash
# Example usage
/red-to-green specs/red-login.md
```

### 4. `/gate`
Quality gate that validates artifacts meet factory standards.

**Input**: Any factory artifact
**Output**: Pass/fail validation with detailed feedback

```bash
# Example usage
/gate specs/green-login.md
```

## Execution Commands

### 5. `/execute-red`
Executes the red phase to generate actual test files.

**Input**: Red specification
**Output**: Test files in project structure

```bash
# Example usage
/execute-red specs/red-login.md
```

### 6. `/execute-green`
Executes the green phase to generate implementation files.

**Input**: Green specification
**Output**: Implementation files that pass tests

```bash
# Example usage
/execute-green specs/green-login.md
```

### 7. `/factory-run`
Runs the complete factory pipeline end-to-end.

**Input**: Human specification
**Output**: Complete working implementation with tests

```bash
# Example usage
/factory-run specs/human-spec-login.md
```

## Quality Check Commands

### 8. `/hallucination-check`
Detects LLM hallucinations in generated code.

```bash
/hallucination-check specs/green-login.md
```

### 9. `/incomplete-check`
Identifies missing implementations or specifications.

```bash
/incomplete-check specs/requirements-login.md
```

### 10. `/drift-check`
Detects specification drift between layers.

```bash
/drift-check specs/human-spec-login.md specs/requirements-login.md
```

### 11. `/coupling-check`
Analyzes coupling between components.

```bash
/coupling-check src/
```

### 12. `/pattern-check`
Validates design patterns and best practices.

```bash
/pattern-check specs/green-login.md
```

### 13. `/dependency-check`
Analyzes and validates dependencies.

```bash
/dependency-check package.json
```

### 14. `/overeng-check`
Detects over-engineering in specifications or code.

```bash
/overeng-check specs/green-login.md
```

## Discriminator Commands

### 15. `/discriminate-layer2`
Validates Layer 2 (requirements) artifacts.

```bash
/discriminate-layer2 specs/requirements-login.md
```

### 16. `/discriminate-red`
Validates red phase test specifications.

```bash
/discriminate-red specs/red-login.md
```

### 17. `/discriminate-green`
Validates green phase implementation specifications.

```bash
/discriminate-green specs/green-login.md
```

## Utility Commands

### 18. `/init`
Initializes a new factory project structure.

```bash
/init my-project
```

### 19. `/breakdown`
Breaks down complex features into smaller components.

```bash
/breakdown specs/human-spec-complex-feature.md
```

### 20. `/epic`
Creates epic-level specifications from business requirements.

```bash
/epic "Build a user management system with OAuth"
```

## Typical Workflow

1. **Create Human Specification**
   ```bash
   # Write your feature in specs/human-spec-feature.md
   ```

2. **Transform to Requirements**
   ```bash
   /spec-to-requirements specs/human-spec-feature.md
   ```

3. **Generate Tests (Red Phase)**
   ```bash
   /requirements-to-red specs/requirements-feature.md
   ```

4. **Generate Implementation (Green Phase)**
   ```bash
   /red-to-green specs/red-feature.md
   ```

5. **Execute Tests**
   ```bash
   /execute-red specs/red-feature.md
   ```

6. **Execute Implementation**
   ```bash
   /execute-green specs/green-feature.md
   ```

7. **Validate with Gate**
   ```bash
   /gate specs/green-feature.md
   ```

## Best Practices

1. **Always Start with Human Specs**: Write clear, user-focused specifications before technical details.

2. **Use Quality Gates**: Run `/gate` after each transformation to ensure quality.

3. **Check for Issues**: Use check commands to identify problems early:
   - `/hallucination-check` for LLM accuracy
   - `/incomplete-check` for missing parts
   - `/drift-check` for consistency

4. **Iterative Refinement**: Use discriminator commands to validate and refine artifacts.

5. **Automated Pipeline**: Use `/factory-run` for fully automated development when specifications are stable.

## Directory Structure

```
project/
├── specs/                 # All specifications
│   ├── human-spec-*.md   # Human-readable specs
│   ├── requirements-*.md # Technical requirements
│   ├── red-*.md          # Test specifications
│   └── green-*.md        # Implementation specs
├── src/                  # Generated source code
├── tests/                # Generated test files
└── docs/                 # Documentation
```

## Non-Functional Requirements

Configure system constraints in `specs/nonfunctional-requirements-template.yaml`:
- Performance targets
- Scalability limits
- Security requirements
- Deployment constraints

## Troubleshooting

- **Tests Failing**: Check `/execute-red` output and validate with `/discriminate-red`
- **Implementation Issues**: Run `/pattern-check` and `/coupling-check`
- **Specification Problems**: Use `/drift-check` to ensure consistency
- **Performance Concerns**: Review non-functional requirements configuration

## Support

For issues or questions, consult the constitution in `.lsf/constitution/` or run relevant check commands to diagnose problems.