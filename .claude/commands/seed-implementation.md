# Seed Implementation

Implement minimal working version using existing components first.

**Usage:** `/seed-implementation <requirements.md>`

**Purpose:** Create concrete implementation using architecture boundaries to eliminate guesswork.

**When to Use:** When /complexity-gate recommends SEED approach due to high uncertainty.

**Implementation Process:**

## 1. Component Selection (MANDATORY)
Follow architecture-boundaries.md decision tree:
1. **Check Django/React built-ins first** → USE THEM
2. **Find existing patterns in codebase** → COPY THEM
3. **Configure existing components** → CONFIGURE THEM
4. **Only if 1-3 fail** → Consider new (with justification)

## 2. Use Existing Components
**Backend (from architecture-boundaries.md):**
- Authentication: `django.contrib.auth`
- API Views: `@api_view` decorator
- Forms/Validation: Django forms
- ORM: Django models
- Caching: Django cache with Redis
- Background Tasks: Celery `@shared_task`
- Pagination: Django Paginator

**Frontend (from architecture-boundaries.md):**
- Layout: Use `AdminLayout`, `Sidebar`, `Header`
- UI: Use `Card`, `Button`, `Modal`, `Form`, `Input`
- State: React useState/useContext (no Redux)
- HTTP: Axios for API calls
- Routing: React Router

## 3. Copy Existing Patterns
```python
# Find similar endpoint in codebase and copy pattern
@api_view(['POST'])
def new_endpoint(request):
    form = ExistingFormPattern(request.data)
    if form.is_valid():
        # Reuse existing response pattern
        return JsonResponse({"id": 1}, status=201)
    return JsonResponse({"error": "Invalid"}, status=400)
```

## 4. Minimal Implementation Rules
- Core functionality only (what makes it work)
- No premature optimization
- No custom error handling (use Django defaults)
- No new packages without justification
- Basic UI using existing components only

## 5. Example: Authentication Implementation
```python
# WRONG: Custom auth system
class CustomAuth:  # Violates boundaries!
    def authenticate(self, email, password):
        # Custom implementation

# RIGHT: Use Django built-in
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required

@api_view(['POST'])
def login_view(request):
    # Use Django's authenticate
    user = authenticate(
        username=request.data.get('email'),
        password=request.data.get('password')
    )
    if user:
        login(request, user)
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid credentials"}, status=400)
```

## 6. Frontend Example
```typescript
// WRONG: Custom component when one exists
const CustomCard = () => { /* ... */ }

// RIGHT: Use existing from boundaries
import Card from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

const Feature: React.FC = () => {
    const { user } = useAuth()  // Existing hook
    return (
        <Card title="Feature">
            {/* Use existing components */}
        </Card>
    )
}
```

**Output:**
- Working implementation using existing components
- No new dependencies added
- Follows established patterns

**Anti-Patterns to Avoid:**
- Creating new components when existing ones work
- Custom implementations of Django/React features
- Adding packages without checking built-ins
- Abstracting over framework features
- Perfect/optimized code (that comes later with TDD)

**Next Step:** Run /extract-tests for integration tests

**Constitutional Compliance:**
- **Reasonable Defaults**: Uses existing components first
- **Minimalism**: No unnecessary complexity
- **Boundaries**: Respects architecture boundaries
- **Context Efficiency**: Reuses patterns, reduces discovery
- **Verification**: Creates testable reality