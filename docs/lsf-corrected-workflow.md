# LSF Corrected Workflow

## Complete Software Factory Pipeline with Dual Paths

```
Human Spec → spec-to-requirements → Requirements + Tests + data-plane-target.yaml
                                            ↓
                                     discriminate-layer2
                                            ↓
                                      [CUG GATE HERE]
                                       ↓           ↓
                                (TDD Path)    (Seed Path)
                                       ↓           ↓
                           requirements-to-red   seed-implementation
                                       ↓           ↓
                              discriminate-red   extract-tests
                                       ↓           ↓
                              red-to-green      verify-tests
                                       ↓           ↓
                             discriminate-green  discriminate-seed
                                       ↓           ↓
                                      Execute → Code
                                            ↓
                                  discriminate-execution
                                            ↓
                                  finalize implementation
```

## Key Components

### Entry Point
- **Human Spec**: User-provided specification with outcomes (OUT-XXX)

### Layer 2: Requirements & Planning
- **spec-to-requirements**: Transforms human spec into requirements (REQ-XXX) and test cases (TEST-XXX)
- **data-plane-target.yaml**: Generated target data model state
- **discriminate-layer2**: Validates requirements for constitutional compliance

### Complexity-Uncertainty Gate (CUG)
- Analyzes complexity and uncertainty scores
- Routes to either TDD Path (low uncertainty) or Seed Path (high uncertainty)
- Optimizes for context efficiency

### TDD Path (Left Branch)
1. **requirements-to-red**: Creates failing test tasks (RED-XXX)
2. **discriminate-red**: Validates test specifications
3. **red-to-green**: Creates implementation tasks (GREEN-XXX)
4. **discriminate-green**: Validates implementation plan

### Seed Path (Right Branch)
1. **seed-implementation**: Implements minimal working version first
2. **extract-tests**: Generates tests from working implementation
3. **verify-tests**: Ensures extracted tests pass
4. **discriminate-seed**: Validates seeded component

### Convergence Point
- **Execute**: Both paths converge to code execution
- **discriminate-execution**: Post-implementation validation
- **finalize implementation**: Synchronizes current data model state, make sure everything is commited, human doc is up tod date

## Feedback Loops
Each discriminator can block progress and force revision, creating quality gates throughout the pipeline.