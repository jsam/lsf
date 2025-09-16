#!/usr/bin/env bash
# Enhanced project initialization with stack-based scaffolding
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
LSF_DIR="$REPO_ROOT/.lsf"
STACKS_DIR="$LSF_DIR/stacks"
TEMPLATES_DIR="$LSF_DIR/templates"

# Parse command line arguments
parse_arguments() {
    local args="$1"
    
    # Initialize variables
    PROJECT_NAME=""
    PROJECT_DESCRIPTION=""
    TECH_STACKS=()
    
    # Parse the input string
    # Example: "django, celery, pgvector - app for crawling news portals"
    if [[ "$args" =~ ^(.+)-(.+)$ ]]; then
        local stacks_part="${BASH_REMATCH[1]}"
        PROJECT_DESCRIPTION="${BASH_REMATCH[2]}"
        PROJECT_DESCRIPTION=$(echo "$PROJECT_DESCRIPTION" | xargs) # Trim whitespace
        
        # Parse comma-separated stacks
        IFS=',' read -ra STACK_ARRAY <<< "$stacks_part"
        for stack in "${STACK_ARRAY[@]}"; do
            stack=$(echo "$stack" | xargs | tr '[:upper:]' '[:lower:]')
            TECH_STACKS+=("$stack")
        done
    else
        # Simple stack list without description
        IFS=',' read -ra STACK_ARRAY <<< "$args"
        for stack in "${STACK_ARRAY[@]}"; do
            stack=$(echo "$stack" | xargs | tr '[:upper:]' '[:lower:]')
            TECH_STACKS+=("$stack")
        done
    fi
    
    # Set project name from repo if not specified
    if [[ -z "$PROJECT_NAME" ]]; then
        PROJECT_NAME="$(basename "$REPO_ROOT")"
    fi
}

# Load stack configuration
load_stack_config() {
    local stack_name="$1"
    local stack_file="$STACKS_DIR/${stack_name}.yaml"
    
    if [[ ! -f "$stack_file" ]]; then
        echo -e "${YELLOW}Warning: Stack definition not found for '$stack_name'${NC}" >&2
        return 1
    fi
    
    # Parse YAML file (basic parsing)
    echo "Loading stack: $stack_name"
    return 0
}

# Generate project constitution
generate_constitution() {
    local output_file="$REPO_ROOT/specs/constitution/constitution.md"
    local template_file="$TEMPLATES_DIR/constitutions/web-app-constitution.md"
    
    echo -e "${BLUE}Generating project constitution...${NC}"
    
    mkdir -p "$(dirname "$output_file")"
    
    # Start with the base template
    cp "$template_file" "$output_file"
    
    # Replace placeholders
    local current_date=$(date -I 2>/dev/null || date "+%Y-%m-%d")
    local tech_stack_str=$(IFS=', '; echo "${TECH_STACKS[*]}")
    
    # Perform replacements
    sed -i.bak \
        -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
        -e "s/{{VERSION}}/1.0.0/g" \
        -e "s/{{DATE}}/$current_date/g" \
        -e "s/{{PROJECT_TYPE}}/Web Application/g" \
        -e "s/{{TECH_STACK}}/$tech_stack_str/g" \
        -e "s/{{MIN_COVERAGE}}/80/g" \
        -e "s/{{AUTH_METHOD}}/JWT Bearer Token/g" \
        -e "s/{{MAX_RESPONSE_TIME}}/200/g" \
        -e "s/{{MIN_RPS}}/100/g" \
        -e "s/{{TYPE_CHECKING_REQUIREMENT}}/Static type checking required/g" \
        -e "s/{{BRANCHING_STRATEGY}}/Git Flow/g" \
        -e "s/{{DEPLOYMENT_STRATEGY}}/Blue-Green Deployment/g" \
        -e "s/{{AUTHOR}}/LSF Team/g" \
        "$output_file"
    
    # Remove backup file
    rm -f "${output_file}.bak"
    
    # Handle dynamic sections
    add_stack_components "$output_file"
    add_approved_technologies "$output_file"
    
    echo -e "${GREEN}✓ Constitution generated at: specs/constitution/constitution.md${NC}"
}

# Add stack-specific components to constitution
add_stack_components() {
    local constitution_file="$1"
    local components=""
    
    for stack in "${TECH_STACKS[@]}"; do
        case "$stack" in
            django)
                components="${components}- **Django**: Web framework with batteries-included approach\n"
                components="${components}- **Django ORM**: Database abstraction layer\n"
                components="${components}- **Django Admin**: Auto-generated admin interface\n"
                ;;
            fastapi)
                components="${components}- **FastAPI**: Modern async web framework\n"
                components="${components}- **Pydantic**: Data validation using Python type annotations\n"
                components="${components}- **Uvicorn**: ASGI server\n"
                ;;
            vue)
                components="${components}- **Vue 3**: Progressive JavaScript framework\n"
                components="${components}- **Vite**: Next-generation frontend tooling\n"
                components="${components}- **Pinia**: State management\n"
                ;;
            celery)
                components="${components}- **Celery**: Distributed task queue\n"
                components="${components}- **Redis**: Message broker and cache\n"
                ;;
            pgvector)
                components="${components}- **PostgreSQL**: Primary database\n"
                components="${components}- **pgvector**: Vector similarity search\n"
                ;;
            postgres|postgresql)
                components="${components}- **PostgreSQL**: Primary relational database\n"
                ;;
            redis)
                components="${components}- **Redis**: In-memory data store for caching and sessions\n"
                ;;
        esac
    done
    
    # Replace the placeholder
    local escaped_components=$(echo -e "$components" | sed 's/[[\.*^$()+?{|]/\\&/g')
    sed -i.bak "/{{#STACK_COMPONENTS}}/,/{{\/STACK_COMPONENTS}}/c\\
$escaped_components" "$constitution_file"
    
    rm -f "${constitution_file}.bak"
}

# Add approved technologies section
add_approved_technologies() {
    local constitution_file="$1"
    local technologies=""
    
    # Determine categories based on stacks
    local has_backend=false
    local has_frontend=false
    local has_database=false
    
    for stack in "${TECH_STACKS[@]}"; do
        case "$stack" in
            django|fastapi|flask|express|rails)
                has_backend=true
                ;;
            vue|react|angular|svelte)
                has_frontend=true
                ;;
            postgres|postgresql|mysql|mongodb|pgvector)
                has_database=true
                ;;
        esac
    done
    
    if $has_backend; then
        technologies="${technologies}- **Backend**: Python, TypeScript, Node.js\n"
        technologies="${technologies}- **API**: REST, GraphQL, WebSocket\n"
    fi
    
    if $has_frontend; then
        technologies="${technologies}- **Frontend**: TypeScript, JavaScript, CSS\n"
        technologies="${technologies}- **UI Libraries**: Component libraries, styling frameworks\n"
    fi
    
    if $has_database; then
        technologies="${technologies}- **Database**: PostgreSQL, Redis, Elasticsearch\n"
        technologies="${technologies}- **ORM/ODM**: SQLAlchemy, Django ORM, Prisma\n"
    fi
    
    technologies="${technologies}- **Testing**: Pytest, Jest, Cypress\n"
    technologies="${technologies}- **CI/CD**: GitHub Actions, GitLab CI, Jenkins\n"
    technologies="${technologies}- **Monitoring**: Prometheus, Grafana, Sentry\n"
    technologies="${technologies}- **Infrastructure**: Docker, Kubernetes, Terraform\n"
    
    # Replace the placeholder
    local escaped_tech=$(echo -e "$technologies" | sed 's/[[\.*^$()+?{|]/\\&/g')
    sed -i.bak "/{{#APPROVED_TECH}}/,/{{\/APPROVED_TECH}}/c\\
$escaped_tech" "$constitution_file"
    
    rm -f "${constitution_file}.bak"
}

# Generate 12-factor app configuration
generate_12factor_config() {
    local output_file="$REPO_ROOT/specs/architecture/12-factor.md"
    
    echo -e "${BLUE}Generating 12-factor app design document...${NC}"
    
    mkdir -p "$(dirname "$output_file")"
    
    cat > "$output_file" << 'EOF'
# 12-Factor App Implementation Guide

## Overview
This document outlines how {{PROJECT_NAME}} implements the 12-factor app methodology for building scalable, maintainable cloud-native applications.

## The Twelve Factors

### I. Codebase
**Principle**: One codebase tracked in revision control, many deploys

**Implementation**:
- Single Git repository for the entire application
- Environment-specific configurations separated from code
- Feature branches for development, main branch for production
- Tags for releases

### II. Dependencies
**Principle**: Explicitly declare and isolate dependencies

**Implementation**:
EOF

    # Add stack-specific dependency management
    for stack in "${TECH_STACKS[@]}"; do
        case "$stack" in
            django|fastapi)
                cat >> "$output_file" << 'EOF'
- Python: `requirements.txt` files with pinned versions
- Virtual environments for isolation (`venv` or `poetry`)
- Separate requirements for dev/test/prod environments
EOF
                ;;
            vue|react)
                cat >> "$output_file" << 'EOF'
- Node.js: `package.json` and `package-lock.json`
- NPM/Yarn for package management
- DevDependencies separated from production dependencies
EOF
                ;;
        esac
    done
    
    cat >> "$output_file" << 'EOF'

### III. Config
**Principle**: Store config in the environment

**Implementation**:
- Environment variables for all configuration
- `.env` files for local development (not committed)
- `.env.example` template file (committed)
- Configuration validation at startup
- No hardcoded values in source code

### IV. Backing Services
**Principle**: Treat backing services as attached resources

**Implementation**:
- Database URLs in environment variables
- Service discovery for microservices
- Health checks for all external services
- Graceful degradation when services unavailable
- Connection pooling and retry logic

### V. Build, Release, Run
**Principle**: Strictly separate build and run stages

**Implementation**:
- **Build**: Compile code, bundle assets, create artifacts
- **Release**: Combine build with config, create immutable release
- **Run**: Execute release in target environment
- CI/CD pipeline enforces separation
- Rollback capability to previous releases

### VI. Processes
**Principle**: Execute the app as one or more stateless processes

**Implementation**:
- No local session storage (use Redis/database)
- Shared nothing architecture
- Stateless authentication (JWT tokens)
- File uploads to object storage (S3/GCS)
- Process crashes don't lose user data

### VII. Port Binding
**Principle**: Export services via port binding

**Implementation**:
- Self-contained web server (Gunicorn, Uvicorn, etc.)
- PORT environment variable for dynamic binding
- No runtime injection of webserver
- Service mesh for inter-service communication

### VIII. Concurrency
**Principle**: Scale out via the process model

**Implementation**:
- Horizontal scaling preferred over vertical
- Process managers (Gunicorn workers, PM2)
- Background jobs via task queues (Celery)
- Auto-scaling based on metrics
- Load balancing across instances

### IX. Disposability
**Principle**: Maximize robustness with fast startup and graceful shutdown

**Implementation**:
- Fast startup times (<10 seconds)
- Graceful shutdown on SIGTERM
- Idempotent operations
- Job queues for long-running tasks
- Circuit breakers for external services

### X. Dev/Prod Parity
**Principle**: Keep development, staging, and production as similar as possible

**Implementation**:
- Docker for environment consistency
- Same backing services across environments
- Infrastructure as Code (Terraform/CloudFormation)
- Continuous deployment
- Feature flags for gradual rollouts

### XI. Logs
**Principle**: Treat logs as event streams

**Implementation**:
- Structured logging (JSON format)
- Write to stdout/stderr only
- Log aggregation service (ELK, CloudWatch)
- Correlation IDs for request tracing
- Log levels (DEBUG, INFO, WARNING, ERROR)

### XII. Admin Processes
**Principle**: Run admin/management tasks as one-off processes

**Implementation**:
- Database migrations as separate process
- Management commands for maintenance
- REPL access for debugging
- Scheduled tasks via cron/task scheduler
- Same environment and codebase as app

## Compliance Checklist

- [ ] Single codebase in Git
- [ ] Dependencies explicitly declared
- [ ] Configuration in environment variables
- [ ] Backing services configurable via env
- [ ] Separate build/release/run stages
- [ ] Stateless processes
- [ ] Services exported via port binding
- [ ] Horizontal scaling capability
- [ ] Fast startup and graceful shutdown
- [ ] Dev/prod environment parity
- [ ] Centralized log management
- [ ] Admin tasks as one-off processes

## Stack-Specific Considerations

EOF
    
    # Add stack-specific considerations
    for stack in "${TECH_STACKS[@]}"; do
        case "$stack" in
            django)
                cat >> "$output_file" << 'EOF'
### Django
- Use `django-environ` for environment variables
- Static files served by WhiteNoise or CDN
- Database migrations with `manage.py migrate`
- Celery for background tasks
- Gunicorn with multiple workers

EOF
                ;;
            fastapi)
                cat >> "$output_file" << 'EOF'
### FastAPI
- Use `pydantic-settings` for configuration
- Uvicorn with multiple workers
- Async/await for concurrent processing
- Background tasks with BackgroundTasks or Celery
- Alembic for database migrations

EOF
                ;;
            vue)
                cat >> "$output_file" << 'EOF'
### Vue.js
- Environment variables via `.env` files
- Build optimization with Vite
- Static assets with cache busting
- API base URL from environment
- Docker multi-stage builds

EOF
                ;;
        esac
    done
    
    echo -e "${GREEN}✓ 12-Factor app design document generated${NC}"
}

# Generate project scaffolding
generate_project_structure() {
    echo -e "${BLUE}Generating project structure...${NC}"
    
    # Create base directories
    mkdir -p "$REPO_ROOT"/{specs,docs,tests,.github/workflows}
    mkdir -p "$REPO_ROOT"/specs/{constitution,architecture,features}
    mkdir -p "$REPO_ROOT"/specs/constitution/amendments
    
    # Generate stack-specific structure
    for stack in "${TECH_STACKS[@]}"; do
        case "$stack" in
            django)
                generate_django_structure
                ;;
            fastapi)
                generate_fastapi_structure
                ;;
            vue)
                generate_vue_structure
                ;;
            celery)
                generate_celery_structure
                ;;
        esac
    done
    
    # Generate common files
    generate_common_files
    
    echo -e "${GREEN}✓ Project structure generated${NC}"
}

# Generate Django-specific structure
generate_django_structure() {
    mkdir -p "$REPO_ROOT"/{config,apps,static,media,templates}
    mkdir -p "$REPO_ROOT"/config/settings
    mkdir -p "$REPO_ROOT"/apps/{core,api,users}
    mkdir -p "$REPO_ROOT"/requirements
    
    # Create basic Django files
    touch "$REPO_ROOT"/manage.py
    touch "$REPO_ROOT"/config/__init__.py
    touch "$REPO_ROOT"/config/urls.py
    touch "$REPO_ROOT"/config/wsgi.py
    touch "$REPO_ROOT"/config/asgi.py
}

# Generate FastAPI-specific structure
generate_fastapi_structure() {
    mkdir -p "$REPO_ROOT"/app/{api,core,schemas,services,repositories,models,db,utils,middleware}
    mkdir -p "$REPO_ROOT"/app/api/v1/endpoints
    mkdir -p "$REPO_ROOT"/migrations
    
    touch "$REPO_ROOT"/main.py
    touch "$REPO_ROOT"/app/__init__.py
    touch "$REPO_ROOT"/app/main.py
}

# Generate Vue-specific structure
generate_vue_structure() {
    mkdir -p "$REPO_ROOT"/src/{components,composables,views,router,stores,services,assets,utils,types}
    mkdir -p "$REPO_ROOT"/src/components/{common,layout}
    mkdir -p "$REPO_ROOT"/src/services/{api,auth}
    mkdir -p "$REPO_ROOT"/src/assets/{styles,images}
    mkdir -p "$REPO_ROOT"/public
    mkdir -p "$REPO_ROOT"/tests/{unit,e2e}
    
    touch "$REPO_ROOT"/index.html
    touch "$REPO_ROOT"/vite.config.ts
    touch "$REPO_ROOT"/tsconfig.json
}

# Generate Celery-specific files
generate_celery_structure() {
    mkdir -p "$REPO_ROOT"/tasks
    touch "$REPO_ROOT"/celery_app.py
}

# Generate common project files
generate_common_files() {
    # Create .gitignore if it doesn't exist
    if [[ ! -f "$REPO_ROOT/.gitignore" ]]; then
        cat > "$REPO_ROOT/.gitignore" << 'EOF'
# Environment
.env
.env.local
.venv/
venv/
env/

# Dependencies
node_modules/
__pycache__/
*.pyc
.pytest_cache/

# Build artifacts
dist/
build/
*.egg-info/
.coverage
htmlcov/

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
logs/

# Database
*.db
*.sqlite3

# Static files
/static/
/media/
EOF
    fi
    
    # Create README if it doesn't exist
    if [[ ! -f "$REPO_ROOT/README.md" ]]; then
        cat > "$REPO_ROOT/README.md" << EOF
# $PROJECT_NAME

$PROJECT_DESCRIPTION

## Technology Stack
$(IFS=', '; echo "${TECH_STACKS[*]}")

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+ (for backend)
- Node.js 18+ (for frontend)

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd $PROJECT_NAME

# Copy environment variables
cp .env.example .env

# Start with Docker
docker-compose up
\`\`\`

## Project Structure
- \`specs/\` - Specifications and constitutional documents
- \`docs/\` - Technical documentation
- \`tests/\` - Test suites
- See \`specs/architecture/\` for detailed architecture documentation

## Development Workflow
1. Review the constitution at \`specs/constitution/constitution.md\`
2. Follow the 12-factor principles outlined in \`specs/architecture/12-factor.md\`
3. Use test-driven development (TDD) for all features
4. Ensure all code passes quality gates before merging

## License
See LICENSE file for details.
EOF
    fi
    
    # Create docker-compose.yml template
    generate_docker_compose
}

# Generate Docker Compose configuration
generate_docker_compose() {
    if [[ ! -f "$REPO_ROOT/docker-compose.yml" ]]; then
        cat > "$REPO_ROOT/docker-compose.yml" << 'EOF'
version: '3.8'

services:
EOF
        
        # Add services based on stacks
        for stack in "${TECH_STACKS[@]}"; do
            case "$stack" in
                django|fastapi)
                    cat >> "$REPO_ROOT/docker-compose.yml" << 'EOF'
  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/dbname
    depends_on:
      - db

EOF
                    ;;
                vue|react)
                    cat >> "$REPO_ROOT/docker-compose.yml" << 'EOF'
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    volumes:
      - ./src:/app/src
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000

EOF
                    ;;
                postgres|postgresql|pgvector)
                    cat >> "$REPO_ROOT/docker-compose.yml" << 'EOF'
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

EOF
                    ;;
                redis)
                    cat >> "$REPO_ROOT/docker-compose.yml" << 'EOF'
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

EOF
                    ;;
                celery)
                    cat >> "$REPO_ROOT/docker-compose.yml" << 'EOF'
  celery:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    command: celery -A celery_app worker -l info
    volumes:
      - .:/app
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - redis
      - db

EOF
                    ;;
            esac
        done
        
        # Add volumes section if needed
        if [[ " ${TECH_STACKS[@]} " =~ " postgres" ]] || [[ " ${TECH_STACKS[@]} " =~ " postgresql" ]] || [[ " ${TECH_STACKS[@]} " =~ " pgvector" ]]; then
            cat >> "$REPO_ROOT/docker-compose.yml" << 'EOF'

volumes:
  postgres_data:
EOF
        fi
    fi
}

# Generate summary report
generate_summary_report() {
    local report_file="$REPO_ROOT/specs/initialization-report.md"
    local current_date=$(date -I 2>/dev/null || date "+%Y-%m-%d")
    
    cat > "$report_file" << EOF
# Project Initialization Report

**Project**: $PROJECT_NAME  
**Description**: $PROJECT_DESCRIPTION  
**Initialized**: $current_date  
**Technology Stack**: $(IFS=', '; echo "${TECH_STACKS[*]}")  

## Generated Artifacts

### Constitutional Documents
- ✅ Project Constitution: \`specs/constitution/constitution.md\`
- ✅ Governance Structure: \`specs/constitution/governance_report.md\`
- ✅ Amendment Process: \`specs/constitution/amendments/\`

### Architecture Documents
- ✅ 12-Factor App Design: \`specs/architecture/12-factor.md\`
- ✅ System Architecture: \`specs/architecture/\`

### Project Structure
EOF
    
    for stack in "${TECH_STACKS[@]}"; do
        echo "- ✅ $stack structure initialized" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF

### Configuration Files
- ✅ Docker Compose: \`docker-compose.yml\`
- ✅ Git Ignore: \`.gitignore\`
- ✅ README: \`README.md\`

## Next Steps

1. **Review Constitutional Framework**
   - Read and understand \`specs/constitution/constitution.md\`
   - Ensure team alignment on principles

2. **Configure Environment**
   - Create \`.env\` file from \`.env.example\`
   - Set up local development environment

3. **Begin Development**
   - Use \`/epic\` command to define features
   - Follow TDD workflow: \`/test\` → \`/implement\` → \`/review\`
   - Maintain constitutional compliance

4. **Set Up CI/CD**
   - Configure GitHub Actions or preferred CI/CD
   - Implement quality gates
   - Set up automated testing

## Compliance Checklist

- [ ] All team members have read the constitution
- [ ] Development environment is configured
- [ ] CI/CD pipeline is set up
- [ ] Testing framework is configured
- [ ] Monitoring and logging are implemented
- [ ] Security measures are in place
- [ ] Documentation is up to date

## Resources

- [12-Factor App](https://12factor.net/)
- [Project Constitution](specs/constitution/constitution.md)
- [Architecture Documentation](specs/architecture/)

---

*This report was automatically generated by LSF initialization*
EOF
    
    echo -e "${GREEN}✓ Initialization report generated at: specs/initialization-report.md${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}   LSF Enhanced Project Initialization${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
    
    # Parse arguments
    parse_arguments "$*"
    
    if [[ ${#TECH_STACKS[@]} -eq 0 ]]; then
        echo -e "${RED}Error: No technology stacks specified${NC}"
        echo "Usage: $0 <stack1>, <stack2>, ... - <project description>"
        echo "Example: $0 django, celery, pgvector - app for crawling news portals"
        exit 1
    fi
    
    echo -e "${GREEN}Project: $PROJECT_NAME${NC}"
    if [[ -n "$PROJECT_DESCRIPTION" ]]; then
        echo -e "${GREEN}Description: $PROJECT_DESCRIPTION${NC}"
    fi
    echo -e "${GREEN}Technology Stack: $(IFS=', '; echo "${TECH_STACKS[*]}")${NC}\n"
    
    # Initialize project components
    generate_constitution
    generate_12factor_config
    generate_project_structure
    generate_summary_report
    
    echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Project initialization complete!${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
    
    echo "Next steps:"
    echo "1. Review the constitution at specs/constitution/constitution.md"
    echo "2. Check the initialization report at specs/initialization-report.md"
    echo "3. Configure your environment variables in .env"
    echo "4. Start development with the TDD workflow"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Run main function with all arguments
main "$@"