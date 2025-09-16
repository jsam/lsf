---
description: Initialize project with technology stack, constitution, and 12-factor app architecture. Bootstrap a complete development environment with sane defaults.
---

Given the project initialization parameters provided as an argument, do this:

1. **Parse Initialization Request**
   - Extract technology stacks from the argument (e.g., "django, celery, pgvector")
   - Extract project description after the dash (e.g., "- app for crawling news portals")
   - Identify project type (web app, API, microservice, etc.) from the stacks

2. **Run Enhanced Initialization Script**
   - Execute `.lsf/scripts/bash/init.sh "$ARGUMENTS"` from repo root
   - This will generate the complete project scaffold based on the technology stack

3. **Generate Project Constitution**
   The script will create a comprehensive constitution including:
   - **Core Development Principles**:
     * Test-Driven Development (mandatory)
     * Domain-Driven Design patterns
     * API-First development approach
   - **12-Factor App Compliance**:
     * All 12 factors documented and implemented
     * Stack-specific implementation details
   - **Architecture Principles**:
     * Security requirements (auth, encryption, secrets)
     * Performance standards (response times, throughput)
     * Monitoring and observability requirements
   - **Code Quality Standards**:
     * Linting and formatting rules
     * Type safety requirements
     * Code review process
   - **Technology Stack Governance**:
     * Approved technologies and libraries
     * Technology selection criteria
     * Upgrade and deprecation policies

4. **Create Architecture Documentation**
   Generate comprehensive architecture documents:
   - `specs/architecture/12-factor.md` - Implementation guide for 12-factor principles
   - `specs/architecture/system-design.md` - High-level system architecture
   - `specs/architecture/data-flow.md` - Data flow and state management
   - `specs/architecture/deployment.md` - Deployment architecture and strategies

5. **Scaffold Project Structure**
   Based on technology stacks, create:
   - **Django Projects**: Apps structure, settings, migrations, static files
   - **FastAPI Projects**: Clean architecture with layers, async structure
   - **Vue/React Projects**: Component hierarchy, state management, routing
   - **Microservices**: Service boundaries, API contracts, service mesh config
   - **Common Elements**: Docker setup, CI/CD configs, testing structure

6. **Configure Development Environment**
   - Generate `docker-compose.yml` with all required services
   - Create `.env.example` with all configuration variables
   - Set up `.gitignore` with stack-specific patterns
   - Configure linting and formatting tools
   - Initialize testing frameworks

7. **Generate Compliance Framework**
   Create quality gates and compliance checks:
   - Testing requirements and coverage thresholds
   - Security scanning configuration
   - Performance benchmarks
   - Accessibility standards
   - Documentation requirements

8. **Create Project Documentation**
   - Comprehensive `README.md` with quickstart guide
   - `CONTRIBUTING.md` with development workflow
   - `ARCHITECTURE.md` with design decisions
   - API documentation templates
   - Deployment guides

9. **Initialize Governance Structure**
   - Amendment process for constitution changes
   - Review and approval workflows
   - Compliance tracking mechanisms
   - Team onboarding materials

10. **Generate Initialization Report**
    Create `specs/initialization-report.md` with:
    - Summary of generated artifacts
    - Compliance checklist
    - Next steps for development
    - Resource links and references

## Usage Examples

### Basic Web Application
```
/init django, postgres, redis - e-commerce platform
```

### Microservices Architecture
```
/init fastapi, celery, rabbitmq, postgres - distributed task processing system
```

### Full-Stack Application
```
/init vue, django, postgres, redis, celery - SaaS dashboard with real-time features
```

### AI/ML Application
```
/init fastapi, pgvector, redis, celery - AI-powered document search engine
```

## Key Benefits

- **One-Time Bootstrap**: Run once at project inception to establish all foundations
- **Opinionated Defaults**: Best practices and patterns pre-configured
- **12-Factor Compliance**: Built-in adherence to cloud-native principles
- **Constitutional Governance**: Clear, enforceable development standards
- **Stack-Specific Optimization**: Tailored setup for each technology
- **Comprehensive Documentation**: All architectural decisions documented
- **Quality Gates**: Automated compliance and quality checking
- **Team Alignment**: Shared understanding of project principles

## Post-Initialization Workflow

After running `/init`, follow this workflow:
1. Review and customize the constitution if needed
2. Set up environment variables in `.env`
3. Start services with `docker-compose up`
4. Use `/epic` to define first features
5. Follow TDD cycle: `/test` → `/implement` → `/review`
6. Maintain constitutional compliance throughout development

Context for initialization: $ARGUMENTS

Note: This command should only be run once when bootstrapping a new project. It establishes the foundational architecture, principles, and structure that will guide all future development.