# Constitution Update Checklist

When amending the constitution (`/memory/constitution.md`), ensure all dependent documents are updated to maintain consistency.

## Templates to Update

### When adding/modifying ANY article:
- [ ] `/templates/epic-template.md` - Update if requirements/scope affected
- [ ] `/templates/breakdown-template.md` - Update Constitution Check section
- [ ] `/templates/tasks-template.md` - Update if new task types needed
- [ ] `/.claude/commands/epic.md` - Update if requirements gathering changes
- [ ] `/.claude/commands/breakdown.md` - Update if technical planning changes
- [ ] `/.claude/commands/test.md` - Update if TDD process changes
- [ ] `/.claude/commands/implement.md` - Update if implementation workflow changes
- [ ] `/.claude/commands/review.md` - Update if quality gates change
- [ ] `/CLAUDE.md` - Update runtime development guidelines

### Article-specific updates:

#### Article I (Library-First):
- [ ] Ensure templates emphasize library creation
- [ ] Update CLI command examples
- [ ] Add llms.txt documentation requirements

#### Article II (CLI Interface):
- [ ] Update CLI flag requirements in templates
- [ ] Add text I/O protocol reminders

#### Article III (Test-First):
- [ ] Update test order in all templates
- [ ] Emphasize TDD requirements
- [ ] Add test approval gates

#### Article IV (Integration Testing):
- [ ] List integration test triggers
- [ ] Update test type priorities
- [ ] Add real dependency requirements

#### Article V (Observability):
- [ ] Add logging requirements to templates
- [ ] Include multi-tier log streaming
- [ ] Update performance monitoring sections

#### Article VI (Versioning):
- [ ] Add version increment reminders
- [ ] Include breaking change procedures
- [ ] Update migration requirements

#### Article VII (Simplicity):
- [ ] Update project count limits
- [ ] Add pattern prohibition examples
- [ ] Include YAGNI reminders

## Validation Steps

1. **Before committing constitution changes:**
   - [ ] All templates reference new requirements
   - [ ] Examples updated to match new rules
   - [ ] No contradictions between documents

2. **After updating templates:**
   - [ ] Run through a sample implementation plan
   - [ ] Verify all constitution requirements addressed
   - [ ] Check that templates are self-contained (readable without constitution)

3. **Version tracking:**
   - [ ] Update constitution version number
   - [ ] Note version in template footers
   - [ ] Add amendment to constitution history

## Common Misses

Watch for these often-forgotten updates:
- Command documentation (`/commands/*.md`)
- Checklist items in templates
- Example code/commands
- Domain-specific variations (web vs mobile vs CLI)
- Cross-references between documents

## Template Sync Status

Last sync check: 2025-09-14
- Constitution version: 3.0.0 (Single-Agent TDD Workflow)
- Templates aligned: ✅ (updated for single-agent TDD workflow)

---

*This checklist ensures the constitution's principles are consistently applied across all project documentation.*