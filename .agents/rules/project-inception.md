# Project Inception & Scaffolding Standards

When starting, initializing, or preparing new projects, modules, or services in this repository, always adhere to these rules:

1. **Architecture & Documentation-First Sync**:
   - Never write code without first reviewing or updating the relevant specifications in `docs/technical/` or `docs/business/`.
   - **Implementation Deviation Protocol**: Every time the implementation must change or deviate from the originally planned system (e.g., changes to state management packages, schema alterations, subdomain routing, or lifecycle flows), you MUST update and sync the corresponding documentation in `docs/` to reflect the latest design BEFORE writing or modifying the code.

2. **Strict TypeScript & Type-First Development**:
   - All models, DTOs, and domain enums must originate in `@sidaya/shared-types`.
   - Maintain `"strict": true`, `"noImplicitAny": true`, and `"exactOptionalPropertyTypes": true` across all packages.
   - Never use `any`. Explicitly type optional properties that may receive undefined as `property?: Type | undefined`.

3. **Multi-Tenancy & Data Security (RLS)**:
   - All relational entities must declare a `tenant_id UUID NOT NULL` column referencing `tenants(id) ON DELETE CASCADE`.
   - All new tables must enable Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`) and define isolation policies.
   - Enforce role-based security: cashiers must never see `cost_price` (modal), and drivers must never see prices or invoice totals on Surat Jalan manifests.

4. **Modularity & Feature Gating**:
   - Any premium or optional capability must be gated behind a `FeatureKey` defined in `@sidaya/shared-types`.
   - Use `requireFeature` middleware at API boundaries and check entitlements in mobile/web UIs.

5. **Topological Build Integrity**:
   - After adding or modifying packages, verify with `pnpm run build` and `pnpm run typecheck` across the entire monorepo before marking tasks complete.
