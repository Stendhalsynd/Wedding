# Wedding Repository Workflow

This repository uses Spec Driven Development as the default execution model.

## Required Workflow

1. Write or update the relevant numbered spec slice in `/spec` before implementation.
2. Create or update a matching progress log in `/plan`.
3. Implement one slice at a time.
4. Run a review gate after each slice is implemented.
5. Verify before claiming completion.

## Spec And Plan Rules

- Use numbered slice files such as `S1-1.md`, `S2-1.md`, `S2-2.md`.
- For execution-model or program-level rules that govern a slice family, use a prefix slice such as `S2-0.md`.
- `/plan/*.md` must record `todo`, `doing`, `done`, `verification`, and `risks`.
- Specs must be decision-complete. The implementer should not need to make product or technical decisions that belong in the spec.

## Subagent Policy

Use role-based subagents whenever the work is multi-step, multi-file, integration-heavy, or benefits from specialized review. This repository follows a role split inspired by [VoltAgent/awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents).

### Default Roles

- `dependency-expert`: official documentation and SDK/framework validation
- `architect`: boundaries, interfaces, migration decisions
- `executor`: implementation
- `test-engineer`: tests, acceptance criteria, verification design
- `debugger`: build/runtime issue isolation
- `qa-tester`: browser or runtime validation
- `writer`: README, release, and operator docs
- `code-reviewer`: final review gate

### Parallelization Rules

- Parallelize only independent work.
- Never run two implementation agents that edit the same file set.
- Prefer one primary implementation agent per slice.
- Use parallel agents for:
  - official documentation review
  - architecture validation
  - test planning
  - QA preparation
  - code review
- If a review finds issues, create follow-up work inside the same slice before moving on.

## Android / Firebase / Capacitor Rule

For Android, Firebase, Capacitor, Gradle, signing, or release automation work:

1. Run `dependency-expert` first against official sources.
2. Run `architect` if the change crosses app/runtime boundaries.
3. Run `executor` only after those decisions are fixed in spec.

## Deliverable Expectations

Every delegated result should report:

- what was checked or changed
- evidence or source files
- remaining risks or follow-up
- file targets if implementation work was proposed
- severity-tagged findings for review output

## Verification

- Run the narrowest useful verification for each slice.
- For code changes, prefer tests plus build or type-check coverage.
- For release or deployment changes, verify the actual artifact or endpoint.
- Do not mark a slice complete until verification evidence is recorded in `/plan`.
