# {{TITLE}}

- Created: {{DATE}}
- Owner: {{OWNER}}
- Status: Draft
- Target date: {{TARGET_DATE}}
- Related: {{RELATED_LINKS}}

## 0) TL;DR

Write a short, high-signal summary:
- What changes
- Why now
- How it will be delivered
- What “done” means

## 1) Context

### 1.1 Background

- What exists today (briefly).
- Where the pain is (symptoms + root cause, if known).

### 1.2 Problem statement

State the problem as an observable gap.

### 1.3 Goals / Success criteria

List measurable, testable outcomes.
- Goal:
- Success metric / acceptance criteria:
- How to validate:

### 1.4 Non-goals (explicitly out of scope)

- Non-goal:
- Why out of scope:

### 1.5 Constraints

- Tech constraints (stack, hosting, build/runtime limits)
- Time constraints
- Compatibility constraints (browsers, Node versions, APIs)

### 1.6 Assumptions

- Assumption:
- If wrong, impact:

### 1.7 Open questions

- Question:
- Who can answer:
- When needed by:

## 2) Stakeholders & Owners

- Owner (execution):
- Reviewer(s):
- Stakeholder(s):
- Who signs off:

## 3) Current State (What’s there now)

### 3.1 User-visible behavior

- Current UX flows / pages:
- Known bugs / limitations:

### 3.2 System behavior

- Components involved (files/modules/services):
- Data sources:
- AuthZ/AuthN model:

### 3.3 Baselines & Observability

- Current metrics (if any):
- Current logs/traces:
- How to reproduce / measure:

## 4) Proposed Solution

### 4.1 High-level approach

Explain the approach as a sequence, not just a concept.

### 4.2 Options considered

#### Option A (recommended)

- Summary:
- Pros:
- Cons:
- Risks:

#### Option B

- Summary:
- Pros:
- Cons:
- Risks:

#### Decision

- Chosen option:
- Why:

### 4.3 Architecture / Design

#### Components & responsibilities

- Component:
  - Responsibility:
  - Inputs/outputs:

#### Data model changes (schemas, migrations, indices)

- Tables/collections affected:
- Migrations needed:
- Backfill strategy:
- Rollback strategy:

#### API / Contracts (tRPC/routes/webhooks)

- Endpoints/routers affected:
- Request/response shape changes:
- Backward compatibility:
- Error handling:

#### UI/UX changes

- Pages/components affected:
- Empty/loading/error states:
- Accessibility considerations:
- i18n/localization considerations:

#### Security & Privacy

- Data exposure risks:
- AuthZ checks (where enforced):
- PII handling:
- Audit/logging:

#### Performance considerations

- Expected hot paths:
- Caching strategy:
- Limits/batching:
- Worst-case scenarios:

#### Observability (post-change)

- Metrics to add:
- Logs to add:
- Alerts to add:
- Dashboards to update:

## 5) Work Plan

### 5.1 Milestones

1. Milestone name
   - Exit criteria:
   - Demo criteria:

### 5.2 Detailed Task Breakdown

Keep tasks small and checkable. Prefer file-anchored tasks.

- [ ] Task (include target file paths and acceptance notes)
- [ ] Task

### 5.3 Dependencies

- Dependency:
- Owner / external system:
- Lead time:
- Contingency:

### 5.4 Risks & Mitigations

- Risk:
  - Likelihood:
  - Impact:
  - Mitigation:
  - Detection:

## 6) Testing & Validation

### 6.1 Unit / Component tests

- What to add:
- Where:
- Edge cases:

### 6.2 Integration / E2E tests

- Scenarios:
- Test data:
- Environments:

### 6.3 Manual QA checklist

- [ ] Happy path:
- [ ] Error states:
- [ ] Permissions:
- [ ] Localization:
- [ ] Mobile / responsive:

### 6.4 Performance validation

- What to measure:
- Baseline vs expected:
- Tools/commands:

### 6.5 Security validation

- Threats to check:
- Abuse cases:
- Pen-test style checks:

## 7) Rollout, Monitoring, and Backout

### 7.1 Rollout plan

- Feature flags (if any):
- Incremental release steps:
- Migration sequencing:

### 7.2 Monitoring plan

- Metrics to watch:
- Alerts:
- SLO/SLA impact:

### 7.3 Backout plan

- How to disable/revert quickly:
- Data rollback steps (if applicable):
- Verification after rollback:

## 8) Appendix

### 8.1 References

- Links:
- Prior art:

### 8.2 Commands / Notes

- Commands:
- Notes:
