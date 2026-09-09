# Git Branching & Development Lifecycle Rule

## 1. Branch Naming Conventions
- **Feature Branches**: `feature/<feature-name>` (e.g. `feature/cogs-margin-formula`)
- **Phase Branches**: `phase/<phase-number>-<name>` (e.g. `phase/phase3-realtime-sync`)
- **Fix / Dev Branches**: `dev/<issue-name>` or `fix/<bug-name>` (e.g. `fix/fifo-lot-rounding`)

## 2. Golden Invariant: Never Commit Directly to Protected Branches
- Direct commits and direct pushes to `main` or `staging` are **STRICTLY FORBIDDEN**.
- Before starting any code edits or feature development, ALWAYS verify active branch (`git branch --show-current`) and checkout a dedicated branch:
  ```bash
  git checkout -b phase/phase3-realtime-sync
  ```

## 3. Two-Tier Cloud Merge Pipeline
- **Tier 1 (Staging)**:
  - All `phase/*`, `feature/*`, and `dev/*` branches must push to origin and open a Pull Request targeting **`staging`**.
  - Merging into `staging` triggers staging CI and deployment verification.
- **Tier 2 (Production / Main)**:
  - **`main` CAN ONLY RECEIVE PULL REQUESTS FROM `staging`**.
  - Direct PRs from `phase/*`, `feature/*`, or `dev/*` to `main` are strictly forbidden and rejected.
  - Releases to production happen strictly via PR: `staging` -> `main`.

## 4. Pre-PR Automated Checklist
Before creating a PR to `staging`:
1. Ensure all packages build cleanly: `pnpm run build`
2. Run test suites:
   - `pnpm run test:phase2`
   - `npx tsx packages/api-core/test/verify-operator-control-plane.ts`
3. Verify zero secrets/untracked artifacts: `git status`
