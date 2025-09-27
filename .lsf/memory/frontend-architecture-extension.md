# Frontend Architecture Extension: Admin Layout

## Constitutional Justification

**Principle**: Reasonable Defaults - Extend architecture boundaries with standard React admin layout components.

**Rationale**: Admin panel layout is foundational infrastructure, not user feature. Adding to architecture boundaries prevents repeated TDD cycles for basic UI structure.

## Architecture Boundary Additions

### Layout Components
- **AdminLayout**: Left sidebar + main content structure
- **Sidebar**: Collapsible navigation with icons
- **Header**: Top bar with breadcrumbs and user actions
- **MainContent**: Responsive content area with proper spacing

### UI Foundation Components
- **Card**: Standard content container
- **Button**: Consistent button styling
- **Modal**: Overlay system for forms/dialogs
- **LoadingSpinner**: Standard loading state
- **Form**: Standardized form layout

### Navigation Components
- **NavItem**: Sidebar navigation item with icon
- **Breadcrumbs**: Path navigation component
- **UserMenu**: Profile dropdown menu

## Implementation Structure

```
src/frontend/src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainContent.tsx
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Form.tsx
│   └── navigation/
│       ├── NavItem.tsx
│       ├── Breadcrumbs.tsx
│       └── UserMenu.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useNavigation.ts
│   └── useModal.ts
└── styles/
    ├── layout.css
    ├── components.css
    └── variables.css
```

## Constitutional Compliance

- **Context Efficiency**: Reusable components reduce repetitive context
- **Minimalism**: Standard patterns, no custom complexity
- **Reasonable Defaults**: Based on established React/admin patterns
- **Agent-centric**: Components documented for future agent usage
- **Focus**: Enables software production features
- **Boundaries**: Clear separation between layout and business features
- **Verification**: Components have basic tests

## Usage in Factory

Once extended, agents can use these components in GREEN phases:
- "Use AdminLayout component from architecture boundaries"
- "Add NavItem to Sidebar from existing patterns"
- "Implement page using Card components"

## Detailed Implementation Plan

### Phase 1: Core Layout Infrastructure (Foundation)

#### Step 1.1: CSS Design System Setup
**Objective**: Establish consistent styling foundation
**Files to Create:**
- `src/frontend/src/styles/variables.css`
  - Color palette (primary, secondary, neutral, semantic colors)
  - Typography scale (font sizes, weights, line heights)
  - Spacing scale (margins, paddings)
  - Breakpoints for responsive design
  - Z-index layers
  - Border radius values
  - Box shadow definitions

- `src/frontend/src/styles/layout.css`
  - CSS Grid/Flexbox utilities
  - Layout container classes
  - Responsive utilities
  - Admin layout specific styles

- `src/frontend/src/styles/components.css`
  - Base component styles
  - Button variants
  - Form element styles
  - Card styles
  - Modal styles

**Dependencies**: None
**Time Estimate**: 2-3 hours
**Verification**: Visual consistency check across components

#### Step 1.2: Core Layout Components
**Objective**: Create foundational layout structure

**AdminLayout.tsx**:
- Props: `children`, `sidebarCollapsed?`, `onSidebarToggle?`
- Structure: CSS Grid with sidebar + main content areas
- Responsive behavior: Sidebar collapse on mobile
- Integration points: Sidebar and Header components

**Sidebar.tsx**:
- Props: `collapsed`, `onToggle`, `menuItems`, `userInfo?`
- Features: Collapsible state, icon-only mode, scroll handling
- State management: Local state for submenu expansion
- Accessibility: ARIA labels, keyboard navigation

**Header.tsx**:
- Props: `title?`, `breadcrumbs?`, `actions?`, `userMenu?`
- Features: Breadcrumb navigation, action buttons, user dropdown
- Responsive: Collapse to hamburger menu on mobile

**MainContent.tsx**:
- Props: `children`, `padding?`, `maxWidth?`
- Features: Proper spacing, scroll management
- Responsive: Adapt to sidebar state

**Dependencies**: CSS variables from Step 1.1
**Time Estimate**: 4-5 hours
**Verification**: Layout renders correctly, responsive behavior works

#### Step 1.3: Navigation Components
**Objective**: Create navigation building blocks

**NavItem.tsx**:
- Props: `icon`, `label`, `href`, `active?`, `submenu?`, `collapsed?`
- Features: Active state styling, icon support, submenu indicator
- Integration: React Router Link component
- Accessibility: Focus management, screen reader support

**Breadcrumbs.tsx**:
- Props: `items: {label, href}[]`, `separator?`
- Features: Auto-generated from route, clickable items
- Responsive: Collapse with ellipsis on small screens

**UserMenu.tsx**:
- Props: `user: {name, avatar?, email?}`, `menuItems`
- Features: Dropdown with user info, logout, settings
- State: Click outside to close, keyboard navigation

**Dependencies**: NavItem requires React Router
**Time Estimate**: 3-4 hours
**Verification**: Navigation works, links function correctly

### Phase 2: UI Foundation Components

#### Step 2.1: Basic UI Components
**Objective**: Create reusable UI building blocks

**Card.tsx**:
- Props: `children`, `title?`, `actions?`, `padding?`, `elevated?`
- Variants: Default, elevated, flat, outlined
- Features: Optional header with title and actions

**Button.tsx**:
- Props: `variant`, `size`, `disabled?`, `loading?`, `icon?`, `children`
- Variants: Primary, secondary, outline, ghost, danger
- Sizes: Small, medium, large
- States: Default, hover, active, disabled, loading

**LoadingSpinner.tsx**:
- Props: `size?`, `color?`, `overlay?`
- Variants: Inline spinner, overlay spinner, skeleton placeholders
- Integration: Use in buttons, cards, page loading

**Dependencies**: CSS components from Phase 1
**Time Estimate**: 3-4 hours
**Verification**: Components render correctly with all variants

#### Step 2.2: Form Components
**Objective**: Standardized form elements

**Form.tsx**:
- Props: `children`, `onSubmit`, `loading?`, `title?`
- Features: Form validation integration, loading states
- Layout: Consistent spacing, responsive design

**Input.tsx**:
- Props: `type`, `label`, `error?`, `required?`, `placeholder?`
- Types: Text, email, password, number, textarea
- Features: Error states, validation messages, icons

**Select.tsx**:
- Props: `options`, `value`, `onChange`, `label`, `error?`
- Features: Search/filter, multi-select, custom option rendering

**Dependencies**: Form validation library integration
**Time Estimate**: 4-5 hours
**Verification**: Forms work with validation, proper error handling

#### Step 2.3: Modal System
**Objective**: Overlay and modal management

**Modal.tsx**:
- Props: `open`, `onClose`, `title?`, `size?`, `children`
- Features: Focus trap, backdrop click close, ESC key close
- Sizes: Small, medium, large, fullscreen
- Integration: Portal rendering, z-index management

**useModal.ts Hook**:
- Returns: `{isOpen, open, close, toggle}`
- Features: Modal state management, multiple modal support
- Integration: Context for modal stacking

**Dependencies**: React Portal, focus-trap library
**Time Estimate**: 3-4 hours
**Verification**: Modal accessibility, proper focus management

### Phase 3: Integration Hooks

#### Step 3.1: Navigation Hooks
**Objective**: Navigation state and logic management

**useNavigation.ts**:
- Returns: `{currentPath, breadcrumbs, menuItems, activeItem}`
- Features: Auto-generate breadcrumbs from routes
- Integration: React Router integration

**useBreadcrumbs.ts**:
- Returns: `{breadcrumbs, setBreadcrumbs}`
- Features: Dynamic breadcrumb management
- Integration: Route-based and manual breadcrumb setting

**Dependencies**: React Router
**Time Estimate**: 2-3 hours
**Verification**: Navigation state updates correctly

#### Step 3.2: Auth Integration Hooks
**Objective**: User authentication state management

**useAuth.ts**:
- Returns: `{user, login, logout, loading, isAuthenticated}`
- Features: Auth state persistence, token management
- Integration: API client authentication headers

**Dependencies**: Existing auth system
**Time Estimate**: 2-3 hours
**Verification**: Auth state persists, API calls authenticated

### Phase 4: Testing Infrastructure

#### Step 4.1: Component Tests
**Objective**: Basic component functionality testing

**Test Coverage**:
- Layout components: Rendering, responsive behavior
- UI components: Props, variants, interactions
- Navigation: Link behavior, active states
- Modal: Open/close, accessibility

**Test Setup**:
- Vitest configuration for components
- Testing Library setup
- Mock React Router
- Custom render helpers

**Time Estimate**: 4-5 hours
**Verification**: All components have basic test coverage

#### Step 4.2: Integration Tests
**Objective**: Component interaction testing

**Test Scenarios**:
- Full layout rendering with navigation
- Modal opening/closing from different components
- Form submission flows
- Responsive behavior testing

**Time Estimate**: 3-4 hours
**Verification**: Integration scenarios work correctly

### Phase 5: Migration and Documentation

#### Step 5.1: Existing Code Migration
**Objective**: Update existing pages to use new layout

**Migration Tasks**:
- Update `App.tsx` to use `AdminLayout`
- Migrate `Dashboard.tsx` to use new components
- Migrate `Tasks.tsx` to use Card and other UI components
- Remove old `Layout.tsx` component

**Time Estimate**: 2-3 hours
**Verification**: Existing functionality preserved, improved UI

#### Step 5.2: Architecture Documentation Update
**Objective**: Update architecture boundaries with new components

**Updates to `.lsf/memory/architecture-boundaries.md`**:
- Add all new layout components
- Add UI foundation components
- Add navigation components
- Add hooks and utilities
- Include usage examples for agents

**Agent Usage Examples**:
```markdown
## Frontend Layout Components

### AdminLayout
- Use for: All admin pages requiring sidebar navigation
- Pattern: `<AdminLayout><PageContent /></AdminLayout>`
- Props: Standard layout with responsive sidebar

### Card Component
- Use for: Content grouping, data display
- Pattern: `<Card title="Title">{content}</Card>`
- Variants: Default, elevated, outlined
```

**Time Estimate**: 1-2 hours
**Verification**: Architecture boundaries accurately reflect new components

### Phase 6: Validation and Refinement

#### Step 6.1: Constitutional Compliance Check
**Objective**: Verify implementation follows constitutional principles

**Validation Checklist**:
- [ ] Components use reasonable defaults (standard React patterns)
- [ ] Minimal complexity (no over-engineering)
- [ ] Agent-centric documentation
- [ ] Clear boundaries between layout and business logic
- [ ] Reusable components reduce context repetition
- [ ] Focus on enabling software production

**Time Estimate**: 1 hour
**Verification**: Constitutional compliance confirmed

#### Step 6.2: Performance and Accessibility Audit
**Objective**: Ensure production readiness

**Audit Items**:
- Bundle size impact of new components
- Accessibility compliance (WCAG guidelines)
- Performance impact on existing pages
- Mobile responsiveness testing
- Cross-browser compatibility

**Time Estimate**: 2-3 hours
**Verification**: Performance and accessibility standards met

## Implementation Summary

**Total Estimated Time**: 25-35 hours
**Critical Path**: Phase 1 → Phase 2 → Phase 5 (core functionality)
**Optional**: Phase 4 (can be done in parallel), Phase 6 (refinement)

**Deliverables**:
1. Complete admin layout system
2. Reusable UI component library
3. Updated architecture boundaries
4. Migrated existing pages
5. Test coverage for new components
6. Documentation for agent usage

This approach treats UI structure as infrastructure (like Django/React frameworks) rather than user features requiring full TDD cycles.