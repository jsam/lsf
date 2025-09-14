# LSF Workflow Guide

## What is LSF?

LSF (Living Specification Framework) is an AI coding agent workflow designed for **test-spec driven development**. It provides a systematic approach to building software by establishing clear specifications, constitutional principles, and automated workflows that ensure consistent, high-quality development practices.

## Core Philosophy

### Test-Spec Driven Development

LSF follows a strict **Test-Spec-First** methodology:

1. **Write Specifications**: Define clear user stories and functional requirements
2. **Write Tests**: Create comprehensive tests based on specifications  
3. **Implement**: Build the minimal code needed to pass the tests
4. **Validate**: Ensure constitutional compliance and quality gates

### Constitutional Governance

Every LSF project operates under a **constitutional framework** that defines:

- **Core Principles**: Non-negotiable development standards (e.g., TDD, observability)
- **Quality Standards**: Code quality, documentation, and testing requirements
- **Development Workflow**: Consistent processes for feature development
- **Governance Rules**: Amendment processes and compliance verification

### AI-Assisted Development

LSF is designed to work seamlessly with AI coding agents by providing:

- **Structured Templates**: Standardized `.claude` configurations for AI interactions
- **Clear Workflows**: Step-by-step processes that AI agents can follow consistently
- **Quality Gates**: Automated validation to ensure AI-generated code meets standards
- **Context Management**: Organized project structures that help AI understand intent

## The LSF Development Cycle

### 1. Project Initialization

```bash
# Initialize a new project with LSF structure
lsf init
```

This sets up:
- `.claude/` folder with AI agent configurations and commands
- `.lsf/` folder with project-specific scripts and configuration
- Constitutional framework in `specs/constitution/`

### 2. Specification Creation

Create detailed specifications in `specs/` following the epic format:
- **User Stories**: Clear "As a...I want...So that" statements
- **Functional Requirements**: Testable and measurable requirements
- **Success Criteria**: Specific, time-bound outcomes
- **Constraints**: Technical and business limitations

### 3. Test-First Implementation

1. **Write Tests**: Based on specifications, create comprehensive test suites
2. **Red Phase**: Ensure tests fail initially
3. **Green Phase**: Implement minimal code to make tests pass
4. **Refactor Phase**: Improve code while maintaining passing tests

### 4. Constitutional Validation

Every change must comply with the project constitution:
- **Code Quality**: Linting, type checking, formatting
- **Test Coverage**: Minimum coverage thresholds
- **Documentation**: Required documentation standards
- **Review Process**: Constitutional compliance verification

### 5. Iterative Improvement

Continuous refinement through:
- **Feedback Loops**: Regular validation and adjustment
- **Constitutional Amendments**: Updating principles as the project evolves
- **Process Optimization**: Improving workflows based on learnings

## Key Benefits

### For Development Teams

- **Consistency**: Standardized processes across all projects
- **Quality Assurance**: Built-in quality gates and validation
- **Reduced Onboarding**: Clear, documented workflows
- **Predictable Outcomes**: Systematic approach to feature development

### For AI Agents

- **Clear Context**: Well-organized project structures
- **Defined Workflows**: Step-by-step processes to follow
- **Quality Guidelines**: Automated validation of generated code
- **Template Reuse**: Standardized configurations across projects

### For Organizations

- **Scalable Practices**: Constitutional framework scales across teams
- **Risk Mitigation**: Built-in quality controls and governance
- **Knowledge Capture**: Documented processes and decisions
- **Compliance**: Systematic approach to meeting standards

## Getting Started

1. **Install LSF**: `uvx --from git+https://github.com/jsam/lsf.git lsf init`
2. **Initialize Project**: Run `lsf init` in your project directory
3. **Review Constitution**: Read and customize `specs/constitution/constitution.md`
4. **Start Building**: Follow the test-spec-first development cycle

## Best Practices

### Specification Writing

- Be specific and measurable
- Include clear acceptance criteria
- Define business value explicitly
- Mark ambiguities for clarification

### Test Development

- Write tests before implementation
- Cover edge cases and error conditions
- Use descriptive test names
- Maintain test independence

### Constitutional Compliance

- Review principles regularly
- Update constitution as needed
- Validate compliance continuously
- Document exceptions and rationale

### AI Collaboration

- Use provided templates consistently
- Keep context organized and current
- Validate AI-generated code thoroughly
- Maintain human oversight of decisions