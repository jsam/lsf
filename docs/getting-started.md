# Getting Started with LSF

## Quick Start

Get up and running with LSF in under 5 minutes:

```bash
# 1. Initialize your project
uvx --from git+https://github.com/jsam/lsf.git lsf init

# 2. Review the constitution
cat specs/constitution/constitution.md

# 3. Start developing with test-spec methodology
```

## Installation Options

### Option 1: One-time Use with uvx (Recommended)

Perfect for trying LSF or occasional use:

```bash
# Run directly without installation
uvx --from git+https://github.com/jsam/lsf.git lsf init

# Create an alias for convenience
alias lsf="uvx --from git+https://github.com/jsam/lsf.git lsf"
```

### Option 2: Persistent Installation

For regular use across multiple projects:

```bash
# Install LSF as a global tool
uv tool install git+https://github.com/jsam/lsf.git

# Now you can use 'lsf' from anywhere
lsf init
```

## Your First LSF Project

### 1. Initialize the Project Structure

```bash
# Create a new project directory
mkdir my-awesome-project
cd my-awesome-project

# Initialize LSF structure
lsf init
```

This creates:
```
my-awesome-project/
├── .claude/          # AI agent configurations
│   ├── commands/      # Custom Claude commands
│   └── templates/     # Reusable templates
├── .lsf/             # LSF project configuration
│   ├── config/       # Project settings
│   └── scripts/      # Automation scripts
└── specs/            # Project specifications
    └── constitution/ # Governance framework
```

### 2. Review Your Project Constitution

```bash
# Read the constitutional framework
cat specs/constitution/constitution.md
```

The constitution defines:
- **Core Principles**: TDD, library-first development, CLI interfaces
- **Quality Standards**: Code quality, documentation requirements
- **Development Workflow**: Feature development process
- **Governance Rules**: Amendment and compliance processes

### 3. Customize for Your Project

Edit the constitution to match your project's needs:

```bash
# Edit the constitution
vim specs/constitution/constitution.md

# Update project-specific settings
vim .lsf/config/settings.json
```

### 4. Start Building with Test-Spec-First

Follow the LSF development cycle:

#### A. Write Specifications

Create your first epic:

```bash
mkdir -p specs/001-my-first-feature
touch specs/001-my-first-feature/epic.md
```

Use the epic template to define:
- User stories
- Functional requirements  
- Success criteria
- Constraints

#### B. Write Tests First

```bash
mkdir tests
touch tests/test_my_first_feature.py
```

Write comprehensive tests based on your specifications.

#### C. Implement to Pass Tests

Write the minimal code needed to make your tests pass:

```bash
mkdir src
touch src/my_feature.py
```

#### D. Validate Constitutional Compliance

Run quality checks (adapt commands to your project):

```bash
# Example validation commands
pytest tests/
ruff check src/
mypy src/
```

## Working with AI Agents

LSF is designed to work seamlessly with AI coding agents:

### Using Claude Commands

The `.claude/commands/` folder contains project-specific commands:

```bash
# Example: Use a custom implementation command
# (This would be invoked through Claude interface)
/implement specs/001-my-first-feature/
```

### Template Usage

Use templates from `.claude/templates/` for consistent code generation:

- Test templates for different testing frameworks
- Code structure templates
- Documentation templates
- Configuration file templates

### Context Management

LSF helps AI agents understand your project by providing:
- Clear project structure
- Constitutional guidelines
- Documented workflows
- Specification formats

## Development Workflow

### Daily Development Cycle

1. **Review Constitution**: Ensure you understand current principles
2. **Write Specification**: Define what you're building and why
3. **Create Tests**: Write failing tests based on specification
4. **Implement**: Write minimal code to pass tests
5. **Validate**: Run quality checks and constitutional compliance
6. **Document**: Update documentation as needed

### Feature Development Process

1. **Epic Creation**: Document user stories and requirements
2. **Test Design**: Create comprehensive test suite
3. **Red-Green-Refactor**: TDD implementation cycle
4. **Quality Gates**: Ensure all validation passes
5. **Documentation**: Update relevant documentation
6. **Review**: Constitutional compliance verification

## Configuration Options

### Project Settings

Edit `.lsf/config/settings.json`:

```json
{
  "version": "1.0.0",
  "auto_sync": false,
  "quality_gates": {
    "test_coverage": 80,
    "type_checking": true,
    "linting": true
  },
  "workflow": {
    "require_tests": true,
    "require_specs": true
  }
}
```

### AI Agent Configuration

Customize `.claude/` folder contents:
- Add project-specific commands
- Create custom templates
- Configure AI behavior settings

## Best Practices

### Specification Writing

- **Be Specific**: Vague requirements lead to poor implementations
- **Include Examples**: Concrete examples clarify intent
- **Define Success**: Clear, measurable success criteria
- **Mark Uncertainties**: Flag ambiguities for clarification

### Test Development

- **Test First**: Always write tests before implementation
- **Test Behavior**: Focus on what the code should do, not how
- **Edge Cases**: Include error conditions and boundary cases
- **Descriptive Names**: Test names should explain the scenario

### Constitutional Compliance

- **Review Regularly**: Constitution should evolve with the project
- **Document Exceptions**: When you must break principles, document why
- **Automate Validation**: Use pre-commit hooks and CI/CD
- **Team Alignment**: Ensure all team members understand principles

## Troubleshooting

### Common Issues

**LSF won't initialize**:
- Check network connection
- Verify you have write permissions
- Try with `--debug` flag for more information

**Existing folders conflict**:
```bash
# Backup existing and install fresh
lsf init --backup --overwrite
```

**Git clone fails**:
- Ensure you can access GitHub
- Check firewall/proxy settings
- Verify the repository exists

### Getting Help

1. **Built-in Help**: `lsf --help` and `lsf init --help`
2. **Documentation**: Review files in `docs/` folder
3. **Constitution**: Check `specs/constitution/` for project-specific guidance
4. **Debug Mode**: Use `lsf --debug init` for detailed logging
5. **Repository**: Check GitHub repository for updates and issues

## Next Steps

Once you have LSF set up:

1. **Explore Templates**: Review `.claude/templates/` for reusable patterns
2. **Customize Constitution**: Adapt principles to your project's needs
3. **Create First Epic**: Document your first feature specification
4. **Write First Tests**: Start with test-driven development
5. **Iterate**: Use the Red-Green-Refactor cycle consistently

## Examples

Check the `examples/` directory (if available) for sample projects showing:
- Complete epic specifications
- Test-first implementation examples
- Constitutional compliance examples
- AI agent workflow demonstrations

Remember: LSF is a framework for systematic, high-quality development. The key to success is following the test-spec-first methodology consistently and maintaining constitutional compliance throughout your project's evolution.