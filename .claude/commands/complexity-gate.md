# Complexity-Uncertainty Gate

Evaluate whether to use TDD or seed-first approach based on uncertainty and complexity.

**Usage:** `/complexity-gate <requirements.md> <test-cases.md>`

**Purpose:** Prevent costly TDD failure cycles when uncertainty is high.

**When to Use:** After requirements generation, before starting red phase.

**Decision Checklist:**

## Uncertainty Indicators (How much must we guess?)
Check each that applies:
- [ ] No similar code patterns exist in codebase to copy
- [ ] New external API/service integration with unknown behavior
- [ ] Tests would require >3 mocked interfaces or complex stubs
- [ ] Data model relationships not clearly defined yet
- [ ] State management patterns unclear or need discovery
- [ ] UI/UX interactions need experimentation to get right

## Complexity Indicators (How much must we build?)
Check each that applies:
- [ ] More than 5 new components/models needed
- [ ] More than 3 system integration points
- [ ] Multiple state transitions or workflow steps
- [ ] Cross-service/cross-layer communication required
- [ ] New authentication or authorization patterns
- [ ] Complex data transformations or migrations

**Decision Rules:**
- **4+ uncertainty indicators** → SEED RECOMMENDED (too much guessing for TDD)
- **3+ complexity + 2+ uncertainty** → SEED RECOMMENDED (high risk of rework)
- **Otherwise** → TDD RECOMMENDED (proceed with normal flow)

**Output Format:**
```
RECOMMENDATION: [TDD|SEED]
Uncertainty Score: X/6 indicators
Complexity Score: Y/6 indicators
Reasoning: [Brief explanation of why this approach saves tokens]
```

**Token Efficiency:**
- TDD with high uncertainty: ~5000 tokens (multiple fix cycles)
- Seed approach: ~1500 tokens (implement once, extract tests)
- Savings: 70% when uncertainty > 0.6

**Constitutional Compliance:**
- Advisory only, agent decides (Agent-centric)
- Simple checklist evaluation (Minimalism)
- Token reduction focus (Context Efficiency)
- Clear decision boundary (Boundaries)