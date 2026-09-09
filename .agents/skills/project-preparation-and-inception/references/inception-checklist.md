# Project Inception Phase 0 Checklist

Use this checklist as an operational gating mechanism before moving into feature development.

## 1. Brand & Legal Clearance
- [ ] Name brainstormed with clear linguistic and cultural significance.
- [ ] Preliminary trademark & Google search sweep conducted.
- [ ] Nice Classification demarcated (e.g. Class 9/35/42 for SaaS/POS).
- [ ] Slogan and brand positioning defined.
- [ ] Parent organization / brand umbrella identified.

## 2. Architecture & Documentation Baseline
- [ ] System architecture overview document created (`01_SYSTEM_ARCHITECTURE.md`).
- [ ] Technology stack decision log created with offline-first sync topology (`02_TECH_STACK_AND_DECISION_LOG.md`).
- [ ] Complete database schema and ERD documented with all relationships and constraints (`04_DATABASE_SCHEMA_AND_DATA_MODEL.md`).
- [ ] PostgreSQL Row-Level Security (RLS) policies documented for multi-tenancy and role privacy.
- [ ] API endpoints, headers, and request/response specifications drafted (`05_API_SPECIFICATION.md`).
- [ ] Payment gateway contracts and client checkout portal flow specified (`07_MODULAR_PAYLINK_AND_CHECKOUT.md`).
- [ ] Dynamic feature keys and subscription tier entitlement matrix documented.

## 3. Monorepo & Tooling Baseline
- [ ] `git init` executed with clean `.gitignore`.
- [ ] `pnpm-workspace.yaml` configured for `apps/*` and `packages/*`.
- [ ] Root `package.json` created with unified workspace scripts (`build`, `typecheck`, `clean`).
- [ ] Root `tsconfig.base.json` configured with strict compiler flags (`strict`, `noImplicitAny`, `exactOptionalPropertyTypes`).

## 4. Foundational Packages
- [ ] `packages/shared-types` authored with enums, Zod schemas, models, and math engines.
- [ ] `packages/shared-types` compiled and verified independently (`tsc -b`).
- [ ] `packages/database` created with raw SQL migrations and RLS helper functions.
- [ ] `packages/payment-core` created with unified provider interface and regional provider adapters.
- [ ] `packages/api-core` created with multi-tenancy middleware, feature gates, and domain services.

## 5. Application Skeletons
- [ ] Mobile app skeleton created under `apps/mobile` with Expo configuration and local offline SQLite schema.
- [ ] Web checkout portal skeleton created under `apps/paylink-web` with lightweight renderer and realtime settlement listener.

## 6. Verification & Handover
- [ ] `pnpm install` links all workspace packages without peer dependency issues.
- [ ] `pnpm run build` succeeds across all workspace packages and apps in topological order.
- [ ] `pnpm run typecheck` succeeds with 0 TypeScript errors across the whole monorepo.
- [ ] Inception walkthrough documented in `walkthrough.md`.
