# Clean Code, Modular Monolith (Modulith) & Documentation Architecture Rule

## 1. Maximum File Length & Modularization Standards
- **Strict Size Limit**: Any source code, template, or stylesheet file exceeding ~400 to 500 lines is considered a **God File** anti-pattern and violates Clean Code Architecture.
- **Decomposition Requirement**: Whenever code approaches this threshold, it MUST be refactored into modular, single-responsibility files (Views, Controllers, Models/Store, Routes, Services).
- **HTML / Templates**: Keep entry-point markup lean and declarative (< 100 lines), referencing modular assets cleanly.

## 2. Decoupling & Modulith Boundaries (Loose Coupling, High Cohesion)
- **Zero Tight Coupling**: Modules must not directly mutate the internal private state of another module. Inter-module communication must happen through:
  1. **Reactive State Store / Events** (Pub/Sub, Event Bus, or Domain Events).
  2. **Explicit Public Contracts / Interfaces (Ports & Adapters)**.
  3. **Dependency Injection (IoC) / Service Registry**.

## 3. Internal Dependency Management & Broken Dependency Warnings
- **Self-Contained Modules**: Each feature/pilar must be isolated so that adding, modifying, or disabling a module causes zero cascading breakage across unrelated modules.
- **Dependency Validation & Warning**:
  - The module manager / router / store must validate required dependencies upon registration.
  - If a required dependency or capability is missing, broken, or uninitialized, the system MUST log a structured warning or fallback gracefully rather than crashing the entire runtime.

## 4. Standardized Module Interface Header Documentation (TSDoc / JSDoc)
- **Mandatory Top-of-File Header**: Every source module (Views, Controllers, Services, Stores, Routes, Middleware) MUST include a standardized TSDoc/JSDoc block at the top of the file:

```javascript
/**
 * @module <ModuleName> (e.g. Controller:POS / AuthTenantDomainService)
 * @description <Tujuan, tanggung jawab spesifik, dan fungsi bisnis modul ini>
 * @dependencies <Daftar modul, service, store, atau view yang dibutuhkan>
 * @exports
 *   - <NamaMethod / Interface Utama>: <Deskripsi singkat apa yang dilakukan>
 * @example
 *   // Contoh cara mengimpor, menginjeksi, atau memanggil modul ini
 *   PosController.executeCheckout('TUNAI');
 */
```
- **Zero Ambiguity**: Any developer or AI assistant opening a file must immediately understand its interface, prerequisites, and integration pattern without needing to read all underlying implementation lines.
