# 3-Tier Environment & Release Governance Rule

## 1. Core Operating Philosophy & Environment Mapping
The platform operates across 3 distinct, strictly isolated environments:

| Environment | Merchant Plane | Operator Control Plane | PayLink / Checkout | Core API | Purpose & Data Invariants |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Local** | `https://sidaya.test` | `https://ops.sidaya.test` | `https://pay.sidaya.test` | `https://api.sidaya.test` (or `:4000`) | **100% Visual, UX & Architectural Parity with Production**. Every change is reviewed locally via HMR. Cash/financial transactions operate in simulation/sandbox mode, but infrastructure is 100% production-ready. Accessed on port 443 with HTTPS. |
| **Staging** | `https://sidaya.my.id` | `https://ops.sidaya.my.id` | `https://pay.sidaya.my.id` | `https://api.sidaya.my.id` | **100% Workflow & Security Rehearsal**. Data is destructible/resettable at any time, but must strictly match production schema, migrations, RLS policies, and invariants. |
| **Production** | `https://sidaya.biz.id` | `https://ops.sidaya.biz.id` | `https://pay.sidaya.biz.id` | `https://api.sidaya.biz.id` | **100% User-Ready, Bug-Free & Secure Live System**. Live financial settlements (dual-path), customer data isolation under UU PDP, zero debug leaks. |

---

## 2. Git Release & Branch Locking Workflow

```
[Local Feature Branch]  ──(HMR & Local Review)──>  [Finalized by Dev]
         │
         ▼  (git push origin feature/...)
   [Feature PR]  ────────(Traceable PR)─────────>  [staging] (Locked Branch)
                                                        │
                                                        ▼  (Staging E2E Verification)
                                                   [Release PR]  ──>  [main / production] (Locked Branch)
```

1. **Local Development First**:
   - All changes are authored on a dedicated local branch (`feature/<name>`, `phase/<name>`, `fix/<name>`).
   - Changes are immediately verified locally via HMR (`preview/serve.js`, Caddy reverse proxy on `https://sidaya.test`).
   - Never commit directly to `staging` or `main`.

2. **Branch Locking & Traceable PR Protocol**:
   - **`staging`** is a **locked branch**. Updates only occur via Pull Requests from feature/phase branches.
   - **`main` (Production)** is a **locked branch**. Updates only occur via Pull Requests from `staging`.
   - Direct PRs from feature branches to `main` are strictly forbidden.

3. **Branch Retention**:
   - **NEVER delete branches when merging PRs**. Do NOT use `--delete-branch` in `gh pr merge`. Keep all branches intact for historical reference and auditability.

---

## 3. UI/UX Security & Plane Isolation Rules

1. **Zero-Leak UI (No Demo Credentials or Quick Logins in UI)**:
   - NEVER expose preset account pills, "Akun Cepat" buttons, pre-filled passwords, or simulation helper OTP boxes on any user-facing screen.
   - If test credentials are required for QA or developers, document them in `README.md`.
2. **Public Landing Page on Main Domain Root**:
   - Unauthenticated visitors accessing the root domain (`/`) MUST be greeted with the high-converting Public Landing Page (Value Proposition, POS Grosir Multi-Satuan, FIFO Lot Tracking, WhatsApp PayLink, Surat Jalan POD, Transparent SaaS Pricing Matrix).
   - Navigation links lead to `/login` and `/register`.
3. **Strict Operator Plane Isolation**:
   - The Admin / Operator Control Plane (`ops.*`) must remain completely hidden from public knowledge and never linked from the landing page or merchant workspace.
