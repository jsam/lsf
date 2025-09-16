# LSF Documentation

Welcome to the Living Specification Framework (LSF) documentation. LSF is an AI coding agent workflow for test-spec driven development with constitutional governance.

## Quick Navigation

| Document | Purpose | Best For |
|----------|---------|----------|
| **[Getting Started](getting-started.md)** | Complete setup guide and first project tutorial | New users, project setup |
| **[Workflow Guide](workflow.md)** | LSF philosophy, methodology, and development cycle | Understanding the methodology |
| **[Claude Commands](claude-commands.md)** | Complete reference for AI agent workflow commands | Command reference |
| **[Command Usage Guide](command-usage-guide.md)** | ⭐ Comprehensive examples for maximum accuracy | Daily usage, best practices |
| **[Quick Reference](command-quick-reference.md)** | ⭐ Concise command syntax and examples | Quick lookup, cheat sheet |
| **[Workflow Integration](workflow-integration-patterns.md)** | ⭐ Advanced patterns and integration strategies | Complex projects, team workflows |

## Command Usage Documentation (New!)

### 🎯 For Maximum Accuracy and Results

The new command usage documentation provides:

- **Detailed Examples**: Real-world usage patterns for each command
- **Context-Specific Tips**: How to provide the right information for better results
- **Integration Patterns**: How commands work together in different scenarios
- **Best Practices**: Proven approaches for quality outcomes
- **Troubleshooting**: Common issues and solutions

### 📚 Three Levels of Documentation

1. **[Command Usage Guide](command-usage-guide.md)** - Complete reference with detailed examples and explanations
2. **[Quick Reference](command-quick-reference.md)** - Concise syntax guide for daily use  
3. **[Workflow Integration](workflow-integration-patterns.md)** - Advanced patterns for complex scenarios

## Enhanced `/init` Command

The `/init` command has been completely reworked to provide:

- **Stack-Based Scaffolding**: Technology-specific project structures
- **Constitutional Framework**: Governance and quality standards
- **12-Factor Compliance**: Cloud-native best practices
- **Complete Bootstrap**: Docker, CI/CD, testing, and documentation

### Usage Examples
```bash
# Django web application
/init django, postgres, redis - e-commerce platform

# AI/ML application  
/init fastapi, pgvector, celery - document search engine

# Full-stack SaaS
/init vue, django, postgres, redis - analytics dashboard
```

## Command Workflow

LSF follows a structured development workflow:

```
/init → /epic → /breakdown → /test → /implement → /review → /refactor
```

Each command builds on the previous one, creating a systematic approach to feature development with built-in quality assurance.

## Key Features

### Constitutional Governance
- Project-specific constitutional framework
- Non-negotiable principles (TDD, security, performance)
- Quality gates and compliance checking
- Amendment process for governance evolution

### Test-Driven Development
- Mandatory TDD workflow with Red-Green-Refactor cycle
- Comprehensive test generation before implementation
- Quality gates enforce test coverage and code quality
- Constitutional compliance for all code changes

### AI Agent Optimization
- Structured templates for consistent AI interactions
- Clear context and specifications for AI agents
- Quality validation to ensure AI-generated code meets standards
- Systematic workflow that AI agents can follow reliably

### Technology Stack Support
- Pre-configured stacks: Django, FastAPI, Vue, React, PostgreSQL, Celery
- Technology-specific constitutional rules and best practices
- Docker and CI/CD setup for each stack combination
- 12-factor app compliance built into all configurations

## Getting Started

### For New Projects
1. **Initialize**: `/init <stacks> - <description>`
2. **Review**: Check `specs/constitution/constitution.md`
3. **Start Development**: Use `/epic` for your first feature

### For Existing Projects  
1. **Add LSF**: Run `lsf init` to add configuration folders
2. **Review Examples**: Check the command usage guide
3. **Begin Workflow**: Start with `/epic` for new features

### For Teams
1. **Constitutional Review**: Align on governance principles
2. **Training**: Review workflow integration patterns
3. **Standards**: Establish command usage conventions
4. **Quality Gates**: Set up automated compliance checking

## What's New

### ✨ Recent Improvements

- **Enhanced `/init` Command**: Complete project bootstrap with stack-based scaffolding
- **Comprehensive Usage Examples**: Real-world patterns for maximum command accuracy
- **Advanced Workflow Patterns**: Integration strategies for complex development scenarios
- **Constitutional Templates**: Technology-specific governance frameworks
- **12-Factor Integration**: Built-in cloud-native compliance

### 📈 Quality Improvements

- **Better Test Coverage**: Enhanced testing framework with multiple scenarios
- **Linting Compliance**: All code passes quality checks
- **Documentation Completeness**: Comprehensive guides for all aspects
- **Validation Testing**: Examples verified against actual command specifications

## Architecture Overview

LSF consists of:

### Core Components
- **CLI Tool**: `lsf init` for project setup
- **Claude Commands**: AI agent workflow commands in `.claude/commands/`
- **Scripts**: Bash scripts in `.lsf/scripts/bash/` for execution
- **Templates**: Markdown templates in `.lsf/templates/` for consistency
- **Stacks**: Technology definitions in `.lsf/stacks/` for scaffolding

### Workflow Integration
- **Sequential Execution**: Commands build on each other's outputs
- **Quality Gates**: Automated checking at each stage
- **Constitutional Compliance**: All activities follow project governance
- **Traceability**: Requirements → Tasks → Tests → Code → Review

### AI Agent Support
- **Structured Context**: Clear specifications and constraints
- **Quality Validation**: Automated checking of AI-generated outputs
- **Systematic Process**: Repeatable workflows for consistent results
- **Human Oversight**: Review and approval gates for critical decisions

## Community and Contribution

LSF is designed to be a living framework:

- **Constitutional Evolution**: Governance can be amended as projects mature
- **Template Sharing**: Reusable patterns across projects and teams
- **Best Practice Capture**: Institutional knowledge embedded in documentation
- **Community Feedback**: Framework improves based on real-world usage

## Support and Resources

### Getting Help
- **Command Issues**: Use `--debug` flag for detailed logging
- **Usage Questions**: Check the comprehensive usage guide
- **Integration Problems**: Review workflow integration patterns
- **Best Practices**: Follow the quick reference guide

### Contributing
- **Bug Reports**: Use GitHub issues for problems
- **Documentation**: Suggest improvements for clarity
- **New Features**: Propose constitutional amendments
- **Templates**: Share successful patterns and configurations

---

**Ready to start?** → [Command Usage Guide](command-usage-guide.md) for comprehensive examples

**Need quick reference?** → [Quick Reference](command-quick-reference.md) for syntax and tips

**Advanced usage?** → [Workflow Integration Patterns](workflow-integration-patterns.md) for complex scenarios