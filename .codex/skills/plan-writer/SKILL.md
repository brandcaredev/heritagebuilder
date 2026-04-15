---
name: plan-writer
description: Create and update very detailed project planning Markdown files in the repo's agent-plans/ folder (e.g., implementation plans, migration plans, refactor plans, rollout plans). Use when the user asks for a plan/roadmap, wants a plan document created, or requests a detailed step-by-step implementation approach saved to agent-plans/.
---

# Plan Writer

## Goal

Produce a _very detailed_ plan document as a Markdown file inside `agents-plans/`, suitable for executing the work and tracking risks, dependencies, and validation.

## Default Output Location & Naming

- Directory: `agent-plans/` at the repo root (create it if missing).
- Plan filename: `agent-plans/YYYY-MM-DD--<slug>.plan.md`
- Optional progress filename: `agent-plans/YYYY-MM-DD--<slug>.progress.md`

Use a short, filesystem-safe `<slug>` (lowercase, hyphens). Derive it from the title if the user doesn’t provide one.

## Workflow (use in this order)

1. Confirm the plan’s title and scope.
   - If scope is ambiguous, ask 1–3 targeted questions (requirements, constraints, rollout risk).
2. Create the plan file.
   - Prefer the script (fast + consistent):
     - `node skills/plan-writer/scripts/create_plan.js --title "..." [--slug "..."] [--dir agent-plans]`
   - If you can’t run scripts, create the file by copying the structure from `skills/plan-writer/assets/plan-template.md`.
3. Fill the plan with specifics (not placeholders).
   - Include concrete file paths, interfaces, migrations, edge cases, and acceptance criteria.
   - Break work into milestones with checkable tasks.
4. If the user wants ongoing tracking, also create/update the `.progress.md` file.

## Quality Bar (what “very detailed” means)

The plan should be executable by someone else without guessing:

- **Goals/non-goals** are explicit and testable.
- **Assumptions** and **unknowns** are listed with next actions.
- **Options considered** are documented (even briefly) with rationale.
- **Work breakdown** has enough granularity to estimate and parallelize.
- **Validation** includes unit/integration/manual checks and negative cases.
- **Rollout/backout** is written (feature flags, migrations, monitoring, revert steps).
- **Risks** include mitigation and detection.

## Handy Resources

- Plan template: `skills/plan-writer/assets/plan-template.md`
- Progress template: `skills/plan-writer/assets/progress-template.md`
- Plan bootstrap script: `skills/plan-writer/scripts/create_plan.js`
