# Clean Code & Anti-God-File Architecture Rule

## Maximum File Length & Modularization Standards
- **Strict Size Limit**: Any source code, template, or stylesheet file exceeding ~500 to 1,000 lines is considered a **God File** anti-pattern and violates Clean Code Architecture.
- **Decomposition Requirement**: Whenever code or styling approaches this threshold, it MUST be dissected and refactored into modular, single-responsibility files:
  1. **Styling (`css/`)**: Split into `variables.css`, `layout.css`, `components.css`, and domain-specific `modules.css`.
  2. **State & Logic (`js/store/`, `js/services/`)**: Separate state stores, action reducers, business logic controllers, formatters, and API clients.
  3. **Views & Modules (`js/modules/`)**: Isolate each domain module/pilar feature into dedicated component/controller files (e.g. `dashboard.js`, `pos.js`, `customers.js`, `fifo.js`, `roles.js`, `invoices.js`, `users.js`).
  4. **HTML / Templates**: Keep entry-point markup lean and declarative (< 300–400 lines), referencing modular assets cleanly.
- **No Monolithic Single-File Dumps**: Never bundle thousands of lines of CSS, JS, and HTML into a single file. Always structure code with high cohesion, loose coupling, and maintainable separation of concerns.
