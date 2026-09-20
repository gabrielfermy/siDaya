# Git Branching & Development Lifecycle Rule

## 1. Branch Naming Conventions
- **Feature Branches**: `feature/<feature-name>` (e.g. `feature/cogs-margin-formula`)
- **Phase Branches**: `phase/<phase-number>-<name>` (e.g. `phase/phase3-realtime-sync`)
- **Fix / Dev Branches**: `dev/<issue-name>` or `fix/<bug-name>` (e.g. `fix/fifo-lot-rounding`)

## 2. Core Development Cadence: "Commit More, Push Sometimes, Merge/PR on Order"

### A. Commit More (High-Frequency Local Commits)
- **Commit early and often locally**: Make frequent, atomic, and descriptive commits as soon as a logical subtask, component, UI fix, or asset integration is completed.
- Keep commits focused and self-contained with clear messages (e.g. `feat(brand): apply official svg monogram to layout and landing navbar`).
- Do not let uncommitted changes accumulate across dozens of unrelated files.

### B. Push Sometimes (Batch / Milestone Remote Backups)
- **Push feature branches in meaningful batches**: Push your active feature branch to remote (`git push origin <branch>`) when cohesive milestones, end-of-turn checkpoints, or multi-commit progress are reached.
- Avoid remote push spam on single-line experimental edits, but ensure work is safely backed up to remote at appropriate checkpoints.

### C. Merge / PR on Order (Explicit User Instruction Only)
- **Never open PRs or merge proactively**: Creating Pull Requests and executing merges to `staging` or `main` is strictly done **only on explicit user order**.
- Do **NOT** open a PR for every incremental task or small feature addition unless instructed.
- When instructed to merge or release, follow the Two-Tier Pipeline (`feature/*` -> `staging` -> `main`) and **never delete branches** (`--delete-branch` is forbidden).

## 3. Golden Invariants & Locked Branches
- Direct commits and direct pushes to `main` (Production) or `staging` are **STRICTLY FORBIDDEN**.
- Both `staging` and `main` are **LOCKED BRANCHES** and can only be updated through traceable Pull Requests.
- Before starting any code edits or feature development, ALWAYS verify active branch (`git branch --show-current`) and checkout a dedicated feature branch:
  ```bash
  git checkout -b feature/<feature-name>
  ```
- **Branch Retention Policy**: **NEVER delete branches when merging PRs**. Strictly avoid the `--delete-branch` flag in `gh pr merge`. Keep all branches intact for historical reference.

## 4. Two-Tier Cloud Merge Pipeline (On Explicit Instruction Only)
- **Tier 1 (Staging Promotion)**:
  - Triggered **only on explicit user instruction**.
  - All `feature/*`, `phase/*`, and `dev/*` branches open a Pull Request targeting **`staging`**.
  - Merging into `staging` triggers staging CI, schema verification, and destructible testing.
- **Tier 2 (Production Promotion)**:
  - Triggered **only on explicit user instruction**.
  - **`main` CAN ONLY RECEIVE PULL REQUESTS FROM `staging`**.
  - Direct PRs from `feature/*`, `phase/*`, or `dev/*` to `main` are strictly forbidden and rejected.
  - Releases to production happen strictly via PR: `staging` -> `main`.


## 5. Pre-PR Automated Checklist
Before creating a PR to `staging`:
1. Ensure all packages build cleanly: `pnpm run build`
2. Run test suites:
   - `pnpm run test:phase2`
   - `npx tsx packages/api-core/test/verify-operator-control-plane.ts`
3. Verify zero secrets/untracked artifacts: `git status`
