# Environment Setup Checklist

## Purpose
Pre-execution environment configuration required before running Layer 3A (Red Phase) or 3B (Green Phase) tasks.

## Core Development Secrets

### Database Configuration
```bash
DATABASE_URL=postgresql://django_user:django_pass@localhost:5432/django_db
```

### Cache and Queue Configuration
```bash
REDIS_URL=redis://localhost:6379
```

### Django Application Secrets
```bash
SECRET_KEY=dev-secret-key-not-for-production-use-only
ALLOWED_HOSTS=localhost,testserver,127.0.0.1
DEBUG=True
```

### Frontend Integration
```bash
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Service-Specific Secrets

### Authentication Services
```bash
# Google OAuth (if implementing Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (if implementing GitHub login)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Email Services
```bash
# SendGrid (if implementing email notifications)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourapp.com

# Mailgun (alternative email service)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.yourapp.com
```

### Payment Services
```bash
# Stripe (if implementing payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Cloud Storage
```bash
# AWS S3 (if implementing file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket

# Google Cloud Storage (alternative)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### Monitoring and Analytics
```bash
# Sentry (if implementing error tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Google Analytics (if implementing analytics)
GA_TRACKING_ID=UA-your-tracking-id
```

## Environment File Setup

### Development (.env file)
Create `.env` file in project root:
```bash
# Copy required secrets from above sections
# Add service-specific secrets as discovered during Layer 3B
```

### Docker Environment
Update `src/docker-compose.yml` environment section:
```yaml
services:
  web:
    environment:
      - DATABASE_URL=postgresql://django_user:django_pass@db:5432/django_db
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=dev-secret-key-not-for-production
      # Add service-specific secrets as needed
```

## Test Infrastructure Setup

### Test Registry Initialization
Ensure `tests/test-registry.json` exists with structure:
```json
{
  "baseline": {
    "backend_integration": [],
    "backend_unit": [],
    "frontend_e2e": [],
    "frontend_unit": []
  },
  "new": {
    "backend_integration": [],
    "backend_unit": [],
    "frontend_e2e": [],
    "frontend_unit": []
  }
}
```

### Playwright Configuration
Ensure `tests/e2e/frontend/playwright.config.js` exists with:
- Base URL: `http://localhost:3000` (dev server)
- API URL: `http://localhost:8000` (backend)
- Retries, traces, screenshots configured

### Test Runner Enhancement
Ensure `tests/run_all_tests_parallelized.py` supports:
- `--baseline-only`: Run only baseline tests
- `--new-only`: Run only new tests
- `--json-output`: Output structured JSON results

## Verification Commands

### Backend Verification
```bash
cd src/
python manage.py check                    # Django configuration
python manage.py migrate --check          # Database connectivity
celery -A django_celery_base inspect ping # Celery/Redis connectivity
```

### Frontend Verification
```bash
cd src/frontend/
npm test -- --run                        # Vitest unit test environment
npm run build                            # Build process
npm run dev                              # Dev server (required for E2E tests)
```

### Frontend E2E Testing (Playwright)
```bash
cd tests/e2e/frontend/
npm install                              # Install Playwright dependencies
npx playwright install                   # Install browser binaries
npx playwright test --list               # Verify tests discoverable
```

### Test Registry Verification
```bash
python3 tests/run_all_tests_parallelized.py --baseline-only --json-output  # Baseline tests
python3 tests/run_all_tests_parallelized.py --json-output                  # All tests
# Expected: {"total": N, "passed": N, "failed": 0, "skipped": 0, "errors": 0}
```

### Full System Verification
```bash
docker compose up --build                                    # Full stack startup
python3 tests/run_all_tests_parallelized.py --json-output   # Complete test suite with registry
```

## Secret Discovery Process

When Layer 3B derivation identifies missing secrets:

1. **Add Required Secrets**: Copy from service-specific sections above
2. **Update Environment**: Add to `.env` and `docker-compose.yml`
3. **Verify Configuration**: Run verification commands
4. **Re-run Layer 3B**: Continue with implementation generation

## Security Notes

- **Development Only**: These are development/testing secrets
- **Never Commit**: Add `.env` to `.gitignore`
- **Production Secrets**: Use proper secret management for production
- **Rotate Regularly**: Change secrets periodically
- **Minimum Scope**: Only add secrets actually needed by requirements

---
<!--
This checklist must be completed before running Layer 3A or 3B derivation tasks.
Missing secrets will block automated implementation generation.
-->