# Git Branching & Development Lifecycle Rule

## 1. Branch Naming Conventions
- **Feature Branches**: `feature/<feature-name>` (e.g. `feature/cogs-margin-formula`)
- **Phase Branches**: `phase/<phase-number>-<name>` (e.g. `phase/phase3-realtime-sync`)
- **Fix / Dev Branches**: `dev/<issue-name>` or `fix/<bug-name>` (e.g. `fix/fifo-lot-rounding`)

## 2. Local-First Development Cadence (No Excessive PRs)
- Perform all implementation, testing, and debugging **locally first** on the dedicated local branch.
- Do **NOT** open Pull Requests for every single small commit or incremental tweak.
- **PR Trigger**: Only push to origin and create a PR targeting `staging` when the user **explicitly instructs** to do so.
- **Production Release Trigger**: Only create a PR from `staging` to `main` when the user **explicitly instructs** a production release.

## 3. Golden Invariants
- Direct commits and direct pushes to `main` or `staging` are **STRICTLY FORBIDDEN**.
- Before starting any code edits or feature development, ALWAYS verify active branch (`git branch --show-current`) and checkout a dedicated branch:
  ```bash
  git checkout -b phase/phase3-realtime-sync
  ```
- **Branch Retention Policy**: **NEVER delete branches when merging PRs**. Strictly avoid the `--delete-branch` flag in `gh pr merge`. Keep all branches intact for historical reference.

## 4. Two-Tier Cloud Merge Pipeline (On Explicit Instruction Only)
- **Tier 1 (Staging)**:
  - Triggered **only on explicit user instruction**.
  - All `phase/*`, `feature/*`, and `dev/*` branches open a Pull Request targeting **`staging`**.
  - Merging into `staging` triggers staging CI and deployment verification.
- **Tier 2 (Production / Main)**:
  - Triggered **only on explicit user instruction**.
  - **`main` CAN ONLY RECEIVE PULL REQUESTS FROM `staging`**.
  - Direct PRs from `phase/*`, `feature/*`, or `dev/*` to `main` are strictly forbidden and rejected.
  - Releases to production happen strictly via PR: `staging` -> `main`.

## 5. Pre-PR Automated Checklist
Before creating a PR to `staging`:
1. Ensure all packages build cleanly: `pnpm run build`
2. Run test suites:
   - `pnpm run test:phase2`
   - `npx tsx packages/api-core/test/verify-operator-control-plane.ts`
3. Verify zero secrets/untracked artifacts: `git status`
