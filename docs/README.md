# LSF Documentation

Welcome to the Living Specification Framework (LSF) documentation. LSF is an AI coding agent workflow for test-spec driven development.

## Quick Navigation

| Document | Description |
|----------|-------------|
| **[Getting Started](getting-started.md)** | Complete setup guide and first project tutorial |
| **[Workflow Guide](workflow.md)** | LSF philosophy, methodology, and development cycle |
| **[Claude Commands](claude-commands.md)** | Complete reference for AI agent workflow commands |

## What is LSF?

LSF is a systematic approach to software development that combines:

- **Test-Spec-First Development**: Write specifications and tests before implementation
- **Constitutional Governance**: Consistent development principles across projects
- **AI Agent Integration**: Optimized workflows for AI-assisted development
- **Quality Assurance**: Built-in validation and compliance checking

## Quick Start

```bash
# Initialize your project with LSF
uvx --from git+https://github.com/jsam/lsf.git lsf init

# Review your project's constitution
cat specs/constitution/constitution.md

# Start building with test-spec methodology
```

## Core Components

### 1. Command Line Interface
- `lsf init`: Initialize projects with standard LSF structure
- Simple, focused tooling for essential workflow setup

### 2. Project Structure
- `.claude/`: AI agent configurations and templates
- `.lsf/`: Project-specific scripts and configuration
- `specs/`: Specifications and constitutional governance

### 3. Constitutional Framework
- Core development principles (TDD, observability, etc.)
- Quality standards and validation gates
- Governance processes and amendment procedures

### 4. AI Agent Integration
- Structured templates for consistent AI interactions
- Clear workflows that AI agents can follow systematically
- Quality gates to ensure AI-generated code meets standards

## Development Philosophy

LSF follows these core principles:

1. **Specifications First**: Every feature starts with clear user stories and requirements
2. **Tests Before Code**: Comprehensive tests written before implementation
3. **Constitutional Compliance**: All development follows established principles
4. **AI Collaboration**: Optimized workflows for human-AI development teams
5. **Quality Gates**: Automated validation ensures consistent standards

## Use Cases

### For Development Teams
- Standardize workflows across projects and team members
- Ensure consistent quality through constitutional governance
- Reduce onboarding time with clear, documented processes
- Maintain predictable development outcomes

### For AI-Assisted Development
- Provide clear context and structure for AI coding agents
- Enable systematic, repeatable development processes  
- Ensure AI-generated code meets quality standards
- Facilitate human oversight and validation

### for Organizations
- Scale development practices across multiple teams
- Implement systematic risk mitigation and quality control
- Capture institutional knowledge and best practices
- Maintain compliance with development standards

## Getting Help

- **New to LSF?** Start with [Getting Started](getting-started.md)
- **Understanding the methodology?** Read the [Workflow Guide](workflow.md)
- **Need command details?** Check the [Commands Reference](commands.md)
- **Having issues?** Use `lsf --debug` for detailed logging
- **Contributing?** Check the main repository for contribution guidelines

## Examples and Templates

Once you initialize a project with `lsf init`, you'll have access to:

- **Epic Templates**: Structured specification formats
- **Test Templates**: Testing patterns and frameworks
- **Code Templates**: Consistent code organization patterns
- **AI Commands**: Pre-configured workflows for AI agents

## Community and Contribution

LSF is designed to be a living framework that evolves with best practices:

- Constitutional amendments allow governance to evolve
- Template sharing enables pattern reuse across projects
- Workflow documentation captures institutional knowledge
- Community feedback drives framework improvements

---

**Ready to get started?** → [Getting Started Guide](getting-started.md)

**Want to understand the methodology?** → [Workflow Guide](workflow.md)

**Need Claude command reference?** → [Claude Commands](claude-commands.md)