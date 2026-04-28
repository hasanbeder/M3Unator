# Skill Catalog

Complete catalog of every skill domain the bootstrapper can generate. Each entry describes what it covers, when it's needed, and the minimum content it must contain.

This catalog is **tech-stack agnostic** — adapt every skill to the project's actual language, framework, and infrastructure choices.

---

## TIER 1 — Always Generated (Every Project)

### 1. `project-architecture`

**Covers**: Folder structure, module boundaries, dependency flow, naming conventions, file organization, layer separation

**Minimum content**:
- Exact folder tree with every directory explained
- Module dependency graph (what can import what, what is forbidden)
- Naming conventions for: files, folders, components/classes, functions, variables, types/interfaces, constants, environment variables, database tables, API endpoints
- Barrel export / re-export policy
- Circular dependency prevention and detection
- Layer separation rules (presentation → business logic → data access → infrastructure)
- Monorepo vs polyrepo decision with reasoning (if applicable)
- Shared code policy (how to share between packages/services)
- File size limits (when to split a file)
- Configuration file organization

### 2. `{language}-standards`

**Covers**: Language-level coding rules, type safety, modern syntax, idioms

**Adapt to actual language. Examples**:

**TypeScript**: strict tsconfig, no `any`, branded types, discriminated unions, utility types, async patterns, ESM/CJS policy, import ordering
**Python**: type hints (mypy strict), PEP8+, dataclasses/pydantic, async/await, virtual env policy, import sorting
**Go**: effective Go patterns, error wrapping, interface design, goroutine management, channel patterns, linting (golangci-lint)
**Rust**: ownership patterns, error handling (thiserror/anyhow), trait design, lifetime annotations, clippy rules, unsafe policy
**Java/Kotlin**: null safety, immutability, stream patterns, coroutines (Kotlin), sealed classes, record types
**Swift**: optionals, value types vs reference types, protocol-oriented design, actor isolation, Sendable conformance
**PHP**: strict types, PSR-12, readonly properties, enums, fibers, static analysis (PHPStan level 9)
**Ruby**: Sorbet/RBS types, frozen string literals, pattern matching, Rubocop rules
**C#**: nullable reference types, records, pattern matching, async/await, LINQ best practices

**Minimum content regardless of language**:
- Compiler/interpreter configuration at maximum strictness
- Banned patterns list with explanations
- Type system usage guide (generics, unions, intersections, branded/newtype)
- Error type hierarchy specific to the language
- Import/module organization rules
- Async/concurrent patterns and pitfalls
- Memory management considerations (if applicable)
- Code formatting tool + exact configuration

### 3. `security-hardening`

**Covers**: Application security across every layer — input, output, auth, secrets, deps, network, data

**Minimum content**:
- **Input validation**: where (boundary), how (schema library), what (whitelist vs blacklist)
- **Output encoding**: rules per context (HTML, SQL, URL, JSON, headers, email, filenames)
- **Authentication security**: token storage, rotation, session lifecycle, brute force protection
- **Authorization patterns**: model (RBAC, ABAC, ReBAC), enforcement points, default-deny
- **Secret management**: env vars, vaults, rotation schedule, never in code/logs/URLs
- **CORS policy**: exact configuration per environment
- **Content Security Policy**: directive-by-directive specification
- **Security headers**: full list with exact values (HSTS, X-Frame, X-Content-Type, Referrer-Policy, Permissions-Policy)
- **SQL/NoSQL injection**: parameterized queries everywhere, ORM escape hatches banned
- **XSS prevention**: per-framework approach, DOM sanitization rules
- **CSRF protection**: token strategy, SameSite cookie policy
- **File upload security**: type validation (magic bytes, not extension), size limits, content scanning, renamed storage, no execution
- **Dependency security**: audit commands, lockfile policy, known-vulnerability blocking, supply chain monitoring
- **Rate limiting**: per-endpoint, per-user, per-IP, algorithm choice
- **Cryptography**: password hashing (Argon2id/bcrypt, never SHA/MD5), encryption at rest (AES-256-GCM), TLS 1.3+
- **API key/token format**: prefix, entropy, scoping, rotation
- **Server hardening**: disable debug mode, strip server headers, error message sanitization
- **Prototype pollution prevention** (JavaScript)
- **Path traversal prevention**
- **SSRF prevention**
- **Mass assignment prevention**
- **Timing attack prevention** (constant-time comparison for secrets)
- **Insecure deserialization prevention**

### 4. `error-handling`

**Covers**: Error types, propagation, recovery, user messaging, logging, monitoring integration

**Minimum content**:
- Custom error class/type hierarchy for the project (adapt to language)
- Error boundary patterns (per-framework: React ErrorBoundary, Express middleware, Go recover, etc.)
- Try/catch scope rules: catch at boundaries, propagate in business logic
- User-facing error messages: human-readable, no internals leaked, actionable
- Error code system: structured, documented, searchable (e.g., `AUTH_TOKEN_EXPIRED`)
- Retry strategy: what to retry (network, rate limits), backoff (exponential with jitter), max attempts, circuit breaker
- Graceful degradation: fallback behavior when dependencies fail
- Dead letter / poison message handling for async systems
- Error serialization format for API responses
- Stack trace policy: preserve in dev, strip/hash in prod
- Error aggregation: how errors flow to monitoring (Sentry, etc.)
- Panic/fatal handling: when to crash, when to recover
- Validation errors vs business errors vs infrastructure errors (different handling)
- Error context enrichment: what metadata to attach at each layer

### 5. `data-validation`

**Covers**: Schema validation, input sanitization, type coercion, boundary enforcement

**Minimum content**:
- Validation library choice and configuration
- Validation layer placement (API boundary, service boundary, or both)
- Schema definition patterns (composable, reusable schemas)
- Custom validator patterns (for domain-specific rules)
- Error message formatting (user-facing localized vs developer-facing detailed)
- Coercion policy: when to coerce types, when to reject
- Null/undefined/nil handling strategy
- String validation: length, format, encoding, trim, normalize
- Number validation: ranges, precision, NaN/Infinity handling
- Date/time validation: timezone handling, range limits, format parsing
- Array/collection validation: min/max items, uniqueness, nested validation
- Object validation: required/optional fields, unknown key policy (strip vs reject)
- File validation: mime type, size, dimensions, content inspection
- URL validation: protocol whitelist, SSRF prevention
- Email validation: format + deliverability approach
- Phone number validation: E.164 format, library choice (libphonenumber)
- Enum/literal validation: strict matching, case sensitivity
- Cross-field validation: conditional rules, mutual exclusivity
- Pagination parameter validation: cursor format, limit ranges, sort field whitelist

### 6. `testing-strategy`

**Covers**: Test types, organization, coverage, mocking, fixtures, CI integration

**Minimum content**:
- Test pyramid with exact ratios for this project type
- Test runner and assertion library choice
- E2E testing tool choice
- Coverage thresholds (statements, branches, functions, lines — concrete percentages)
- Test file naming and placement (colocated vs separate directory)
- Test naming convention (`should_verb_when_condition`, `describe/it`, etc.)
- **Mocking rules**:
  - ALWAYS mock: external APIs, payment providers, email services, time/date, randomness
  - NEVER mock: business logic, validation, type guards, pure functions
  - CONDITIONALLY mock: database (test DB for integration, mock for unit), file system
- Fixture and factory patterns (avoid raw object literals in every test)
- Test data management: seeding, cleanup, isolation between tests
- Snapshot testing policy: when allowed, auto-update rules
- Visual regression testing (if UI)
- Accessibility testing (if UI)
- Performance testing requirements
- Load testing requirements (for APIs/services)
- Contract testing (for microservices/APIs)
- Mutation testing consideration
- Flaky test policy: quarantine, mandatory fix timeline, deletion threshold
- CI test pipeline: parallelization, caching, failure handling
- Test environment management: separate DB, mock external services, deterministic seeds

### 7. `performance-optimization`

**Covers**: Load time, runtime performance, memory, caching, bundle size, database, network

**Minimum content**:
- **Web performance budgets** (if applicable):
  - LCP: < 2.5s
  - INP: < 200ms
  - CLS: < 0.1
  - TTFB: < 200ms (static), < 500ms (dynamic SSR)
  - JS bundle initial: target in KB gzipped
  - CSS initial: target in KB gzipped
  - Total page weight: target in KB
- **API performance budgets**:
  - Response time p50 / p95 / p99 targets
  - Throughput target (requests/sec)
  - Error rate target (< 0.1%)
- **Database performance budgets**:
  - Simple query: < 10ms
  - Complex/join query: < 100ms
  - Report/analytics query: < 2s
  - Connection pool sizing
- **Memory budgets**:
  - Server process baseline
  - Per-request memory ceiling
  - Frontend memory ceiling
- **Code splitting strategy**: route-based, component-based, threshold
- **Lazy loading rules**: images, components, routes, scripts
- **Caching layers**: browser cache, CDN, application cache, database cache, query result cache
- **N+1 query detection and prevention**
- **Pagination enforcement** (no unbounded queries)
- **Image optimization**: format (WebP/AVIF), sizes, lazy loading, CDN
- **Font optimization**: subset, preload, display swap, system font fallback
- **Preloading/prefetching rules**: what to preload, what to prefetch, what to preconnect
- **Debounce/throttle policies**: search inputs, scroll handlers, resize handlers
- **Web Worker / background thread usage** for heavy computation
- **Streaming/chunked responses** for large data
- **Tree-shaking** verification
- **Profiling requirements**: when and how to profile before optimization

### 8. `git-workflow`

**Covers**: Branching, commits, PRs, reviews, releases, hooks

**Minimum content**:
- Branch naming convention (e.g., `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`)
- Main branch strategy (trunk-based, Git Flow, GitHub Flow — pick ONE)
- Commit message format (Conventional Commits or custom, with examples)
- Commit scope rules (atomic commits, one concern per commit)
- PR template with required sections
- PR size policy (max lines changed, when to split)
- Code review checklist
- Required approvals before merge
- Merge strategy (squash, rebase, merge — pick ONE per branch type)
- Protected branch configuration
- Release process (tagging, changelogs, versioning scheme)
- Hotfix procedure
- Pre-commit hooks: linter, type checker, test runner, secret scanner
- Pre-push hooks: full test suite
- Commit message linting (commitlint or equivalent)

### 9. `documentation-standards`

**Covers**: Code docs, API docs, README, ADRs, changelogs, onboarding

**Minimum content**:
- Code documentation requirements per element:
  - Public functions/methods: required (param descriptions, return, throws, examples)
  - Private functions: required if complex (> 10 lines or non-obvious)
  - Types/interfaces: required (describe purpose, all fields)
  - Constants: required if magic number or non-obvious value
  - Modules: required (top-of-file purpose statement)
- Inline comment rules: explain WHY (not what), no commented-out code, TODO format
- README template: what sections are required
- API documentation: generation tool, hosted location, update process
- Architecture Decision Records (ADR): template, when to write one, storage location
- Changelog format: Keep a Changelog standard or custom
- Runbook templates: for operations procedures
- Onboarding guide: required for team projects
- Environment setup guide: step-by-step for new developers
- Diagram requirements: when architecture diagrams are needed, tool choice (Mermaid, etc.)

### 10. `privacy-compliance`

**Covers**: PII handling, data lifecycle, consent, regulations, data subject rights

**Minimum content**:
- **PII classification**: what counts as PII in this project (names, emails, IPs, device IDs, etc.)
- **Data inventory**: what personal data is collected, where it's stored, who accesses it
- **Collection minimization**: only collect what's needed, document justification for each field
- **Storage rules**: encryption at rest (AES-256), separate PII from non-PII where possible
- **Transit rules**: TLS 1.3+ for all connections, certificate pinning for mobile
- **Logging rules**: NEVER log PII, hash/mask if operational need exists
- **Retention policy**: per data type, automatic deletion schedules
- **Data subject rights implementation**: access, deletion, portability, rectification, restriction
- **Consent management**: opt-in mechanisms, preference storage, withdrawal flow
- **Cookie policy**: classification (essential, functional, analytics, marketing), consent banner
- **Third-party data sharing**: data processing agreements, sub-processor inventory
- **Breach notification**: detection, assessment, notification timeline, communication template
- **Privacy by design**: default privacy settings, anonymization/pseudonymization techniques
- **Children's data** (if applicable): COPPA/GDPR-K compliance, age verification, parental consent
- **Cross-border transfers**: data residency, adequacy decisions, standard contractual clauses
- **Right to erasure**: cascade deletion, backup handling, search index cleanup

### 11. `dependency-management`

**Covers**: Package management, versioning, auditing, updates, lockfiles, supply chain security

**Minimum content**:
- Package manager choice and configuration
- Lockfile policy: always committed, verified in CI
- Version pinning strategy: exact for production deps, range for dev deps (or reverse, with reasoning)
- Update cadence: automated (Dependabot/Renovate config), manual review frequency
- Security audit: automated in CI, block on critical/high vulnerabilities
- Allowed license list (MIT, Apache-2.0, BSD — ban copyleft for commercial)
- New dependency approval process: size impact, maintenance health, alternative check
- Postinstall script policy: block by default, whitelist specific packages
- Monorepo dependency hoisting rules (if applicable)
- Peer dependency handling
- Bundle size impact verification for new deps
- Deprecated package detection and replacement schedule
- Fork policy: when to fork, how to maintain
- Supply chain security: package provenance, sigstore verification, Socket/Snyk
- **Latest version enforcement**: all dependencies initialized at their latest stable version, verified via web search at bootstrap time — never rely on memorized or hardcoded versions

---

## TIER 2 — Conditional: Data & Communication

### 12. `database-design`
**When**: Project has any form of persistence (SQL, NoSQL, KV, object storage)
**Minimum content**:
- Schema naming conventions (tables, columns, indexes, constraints)
- Primary key strategy (UUID v7/ULID/auto-increment, with reasoning)
- Required columns for every table (id, created_at, updated_at, optionally deleted_at)
- Foreign key and referential integrity policy
- Index strategy: every FK indexed, composite index column order, partial indexes
- Normalization level with reasoning
- Denormalization rules (when acceptable, how to maintain consistency)
- Migration workflow: creation, review, testing, rollback plan
- Migration naming convention
- Data migration vs schema migration separation
- Soft delete vs hard delete policy with cascading rules
- JSON/JSONB column usage policy
- Full-text search approach
- Connection pool configuration: min, max, idle timeout, statement timeout
- Read replica usage (if applicable)
- Sharding / partitioning strategy (if applicable)
- Backup and point-in-time recovery requirements
- Seed data management (development, testing, staging)
- Query performance rules: EXPLAIN ANALYZE requirements, N+1 detection

### 13. `api-design`
**When**: Project exposes or consumes APIs
**Minimum content**: (adapt to REST, GraphQL, gRPC, tRPC)
- API style choice and reasoning
- URL/endpoint naming conventions
- HTTP method semantics (exact usage per method)
- Request/response envelope format (success and error)
- Status code usage (exact mapping per scenario)
- Pagination pattern (cursor, offset, keyset) with implementation
- Filtering convention (query params, operators)
- Sorting convention
- Versioning strategy (URL path, header, or content negotiation)
- Rate limiting: per tier, per endpoint, headers, retry-after
- Request size limits
- Response compression policy
- Idempotency implementation (for non-GET mutations)
- API key authentication vs token authentication
- HATEOAS / hypermedia (if REST)
- Schema design, resolver patterns, N+1 batching (if GraphQL)
- Protobuf schema management, streaming patterns (if gRPC)
- Router organization, procedure types (if tRPC)
- Deprecation policy: timeline, sunset header, migration guide
- Webhook design: signature verification, retry, idempotency

### 14. `auth-patterns`
**When**: Project has user authentication or authorization
**Minimum content**:
- Auth provider/library choice and configuration
- Authentication flow: signup, login, logout, password reset, email verification
- Token strategy: type (JWT, opaque, session cookie), storage, rotation, expiry
- Session lifecycle: creation, refresh, revocation, concurrent session policy
- Authorization model: RBAC/ABAC/custom with role definitions
- Route/endpoint protection: middleware/guard patterns, default-deny
- Permission checking: service-level, query-level, field-level
- Multi-tenancy isolation (if applicable)
- Social/OAuth login: provider list, account linking, scope requests
- MFA implementation: TOTP, WebAuthn, SMS (with caveats), recovery codes
- API key management: generation, scoping, rotation, revocation
- Impersonation (admin-as-user): audit trail, restrictions
- Audit logging: all auth events, IP tracking, device fingerprinting
- Brute force protection: lockout, CAPTCHA, progressive delays
- Password policy (if applicable): min length, complexity, breach database check

---

## TIER 3 — Conditional: Frontend & UX

### 15. `{framework}-patterns`
**When**: Project uses a specific framework
**Must adapt to**: Next.js, React, Vue, Svelte, Angular, SolidJS, Astro, Hono, Fastify, Express, NestJS, Django, Flask, FastAPI, Rails, Laravel, Spring Boot, Gin, Actix, Axum, Phoenix, etc.
**Minimum content**:
- File/folder conventions specific to the framework
- Component/route/handler organization patterns
- Framework-specific rendering strategies
- Data fetching patterns (framework-specific)
- Caching built-ins and configuration
- Middleware/plugin/hook patterns
- Framework-specific security considerations
- Framework-specific performance optimizations
- Error handling integration with framework
- Testing integration with framework
- Framework update/migration guidance

### 16. `ui-engineering`
**When**: Project has a visual user interface
**Minimum content**:
- Component hierarchy and composition rules (max nesting, prop drilling limit)
- Styling methodology: ONE approach (utility CSS, CSS modules, styled-components, etc.)
- Design token system: colors, spacing scale, typography scale, shadows, border radii
- Responsive breakpoints: exact pixel values, mobile-first rules
- Dark/light mode: implementation pattern, user preference persistence
- Animation policy: when to animate, performance budget, reduced-motion respect
- Loading states: skeleton screens, spinners, progressive loading
- Empty states: design and content guidelines
- Error states in UI: inline errors, toast notifications, error pages
- Form patterns: layout, validation display, multi-step, auto-save
- Icon system: library choice, sizing convention, accessibility
- Image handling: responsive images, lazy loading, placeholder strategy
- Scroll behavior: infinite scroll vs pagination, scroll restoration
- Modal/dialog patterns: focus trapping, backdrop, escape key
- Toast/notification system: types, duration, stacking, dismissal

### 17. `state-management`
**When**: Frontend has complex state requirements
**Minimum content**:
- State categorization matrix:
  - Server state (remote data) → TanStack Query / SWR / RTK Query / Apollo
  - Client state (UI state) → Zustand / Jotai / Signals / Redux / Vuex / Pinia
  - URL state (navigation) → search params, hash, path
  - Form state → React Hook Form / Formik / vee-validate / native
  - Transient state (animations, hover) → component-local
- What goes where: explicit rules for categorizing new state
- Cache invalidation strategy: when to refetch, when to use stale data
- Optimistic update patterns with rollback
- Global state shape: flat, normalized, with TypeScript types
- State persistence rules: what survives page refresh, what doesn't
- Derived/computed state patterns (avoid storing computable values)
- State debugging: devtools configuration, logging

### 18. `accessibility-standards`
**When**: Project has any user-facing interface
**Minimum content**:
- Target compliance level: WCAG 2.2 AA (or AAA for specific features)
- Semantic HTML rules: heading hierarchy, landmark regions, lists
- ARIA rules: when to use, what to avoid (no ARIA > bad ARIA), live regions
- Keyboard navigation: all interactive elements reachable, visible focus indicator, logical tab order
- Focus management: modals, route changes, dynamic content
- Color contrast: minimum ratios (4.5:1 text, 3:1 large text, 3:1 UI components)
- Screen reader testing: required tools, testing frequency, CI integration
- Alternative text: rules per image type (decorative, informative, complex)
- Form accessibility: labels, error association, required field indication
- Touch target sizes: minimum 44x44px
- Reduced motion: respect `prefers-reduced-motion`, provide controls
- Text scaling: UI must work at 200% zoom
- Language attribute: set on html element, change for mixed-language content
- Skip navigation links
- Automated testing: axe-core, Lighthouse, pa11y in CI
- Manual testing protocol: checklist, frequency, tools

---

## TIER 4 — Conditional: Operations

### 19. `devops-pipeline`
**When**: Project will be deployed (not a library-only project)
**Minimum content**:
- CI pipeline stages: lint → type-check → test → build → security-scan → deploy
- Pipeline tool: GitHub Actions / GitLab CI / CircleCI / Jenkins / etc.
- Environment hierarchy: local → dev → staging → production
- Environment variable management: source of truth, injection method, validation
- Build optimization: caching, parallelization, incremental builds
- Deployment strategy: blue-green / canary / rolling / direct
- Rollback procedure: automated triggers, manual process, data considerations
- Health check endpoints: liveness, readiness, startup probes
- Smoke tests: post-deployment verification
- Secret management in CI: vault integration, environment secrets, rotation
- Artifact management: Docker registry, package registry, asset storage
- Branch-to-environment mapping
- Preview environments / ephemeral environments (if applicable)
- Database migration in deployment pipeline
- Feature flag integration in deployment
- Deployment notifications: who gets notified, channels, failure escalation

### 20. `observability`
**When**: Project runs as a service in production
**Minimum content**:
- **Structured logging format**: exact JSON schema with timestamp, level, message, service, requestId, context
- **Log levels**: ERROR (needs attention), WARN (unexpected but handled), INFO (business events), DEBUG (dev only, never in prod)
- **What to log**: every request, auth events, authorization failures, external calls, job execution, slow queries
- **What NEVER to log**: passwords, tokens, credit cards, PII (hash/mask if operational need)
- **Correlation**: requestId generation at edge, propagation through all layers, in response header
- **Metrics to collect**: latency histograms, throughput counters, error rate, saturation (CPU, memory, connections)
- **Alerting**: thresholds, escalation paths, runbook links, alert fatigue prevention
- **Distributed tracing**: tool choice, span creation rules, sampling rate
- **Dashboard requirements**: key dashboards per service, SLI/SLO display
- **Error tracking**: Sentry or equivalent, release tracking, source maps, issue assignment
- **Uptime monitoring**: external checks, status page
- **Log retention**: per environment, compliance requirements
- **Cost management**: log volume limits, metric cardinality limits

---

## TIER 5 — Domain-Specific (Only When Needed)

### 21. `payment-integration`
**When**: Project handles money
**Minimum**: Stripe/provider patterns, webhook signature verification, idempotency keys, PCI compliance, refund flows, subscription state machine, tax calculation, invoice generation, dispute handling, test mode isolation

### 22. `internationalization`
**When**: Multi-language support
**Minimum**: i18n library, translation key naming, interpolation patterns, pluralization, RTL layout, number/date/currency formatting, locale detection chain, translation workflow, missing key handling

### 23. `file-handling`
**When**: File upload/download/processing
**Minimum**: Upload validation (type, size, content), virus scanning, storage provider (S3/R2/GCS/local), presigned URLs, CDN delivery, image processing pipeline (resize, format), video handling, document parsing, cleanup/expiry

### 24. `realtime-system`
**When**: Live updates, chat, collaboration
**Minimum**: Transport choice (WebSocket/SSE/polling), connection lifecycle, reconnection with backoff, message format (JSON/protobuf), presence system, room/channel architecture, message ordering, scaling (Redis pub/sub, etc.), offline queue

### 25. `email-system`
**When**: Transactional or marketing emails
**Minimum**: Provider (Resend/SES/Postmark/SendGrid), template system (MJML/React Email), queue management, bounce handling, complaint handling, unsubscribe (CAN-SPAM/GDPR), deliverability (SPF/DKIM/DMARC), rate limits

### 26. `search-implementation`
**When**: Search functionality
**Minimum**: Engine choice (Meilisearch/Typesense/Elasticsearch/Algolia), index design, sync strategy, relevance tuning, faceted search, autocomplete, typo tolerance, synonyms, language-specific analyzers, reindex procedure

### 27. `background-jobs`
**When**: Async processing, schedules, queues
**Minimum**: Queue tool (BullMQ/Inngest/Celery/Sidekiq/etc.), job serialization, retry policy per job type, dead letter handling, concurrency limits, priority queues, scheduled/cron jobs, monitoring, distributed locking, idempotency

### 28. `caching-strategy`
**When**: Performance-critical with cacheable data
**Minimum**: Cache layers (browser, CDN, reverse proxy, application, query, object), invalidation strategy per layer, TTL policy, cache warming, cache stampede prevention, stale-while-revalidate, cache key design, serialization, memory limits

### 29. `rate-limiting`
**When**: Public API or abuse-prone endpoints
**Minimum**: Algorithm (token bucket/sliding window/fixed window), per-tier limits, per-endpoint limits, distributed rate limiting, response headers, retry-after, bypass for internal services, rate limit key design (IP, user, API key)

### 30. `feature-flags`
**When**: Gradual rollout, A/B testing, kill switches
**Minimum**: Tool choice (LaunchDarkly/Unleash/Flagsmith/custom), flag naming convention, lifecycle (create → enable → stable → remove), targeting rules, percentage rollout, kill switch protocol, stale flag cleanup, testing with flags

### 31. `mobile-patterns`
**When**: React Native / Flutter / native mobile
**Minimum**: Navigation architecture, offline-first strategy, push notifications, deep linking, app store compliance, biometric auth, secure storage (Keychain/Keystore), background tasks, memory management, crash reporting

### 32. `desktop-patterns`
**When**: Electron / Tauri / native desktop
**Minimum**: Window management, system tray, auto-update (code signing), native file system, IPC security, cross-platform builds, sandboxing, menu bar, keyboard shortcuts, installer/packaging

### 33. `cli-design`
**When**: Command-line tool
**Minimum**: Command structure (subcommands, flags, args), help text, output formatting (table, JSON, plain), interactive prompts, configuration file, shell completion, exit codes, stdin/stdout piping, progress indicators, color handling

### 34. `monorepo-management`
**When**: Multiple packages/apps in one repo
**Minimum**: Workspace tool, package boundaries, shared configs, version strategy (independent vs lockstep), publish workflow, CI optimization (affected-only), dependency hoisting, internal package resolution, changeset management

### 35. `ai-integration`
**When**: LLM/ML features
**Minimum**: Provider abstraction layer, prompt versioning, token tracking/budgeting, streaming patterns, response parsing/validation, fallback chains (model A → B → C), retry with different models, safety filters, cost alerting, evaluation framework

### 36. `container-orchestration`
**When**: Dockerized deployment, Kubernetes
**Minimum**: Dockerfile best practices (multi-stage, non-root, .dockerignore), image security scanning, K8s resource definitions, health probes, resource requests/limits, HPA configuration, secret management, network policies, service mesh

### 37. `infrastructure-as-code`
**When**: Cloud infrastructure management
**Minimum**: Tool choice (Terraform/Pulumi/CDK/CloudFormation), state management, module design, environment separation, secrets handling, drift detection, cost estimation, destroy protection, module versioning

### 38. `event-driven-architecture`
**When**: Event sourcing, CQRS, async microservices
**Minimum**: Event schema design, event versioning, event store, projection patterns, saga/process manager, idempotent consumers, ordering guarantees, dead letter handling, event replay, schema registry

### 39. `graphql-patterns`
**When**: GraphQL API
**Minimum**: Schema-first vs code-first, type naming, resolver organization, N+1 prevention (DataLoader), pagination (Relay connections), authorization in resolvers, file uploads, subscriptions, schema stitching/federation, depth limiting, cost analysis

### 40. `microservice-patterns`
**When**: Distributed multi-service architecture
**Minimum**: Service boundary design, inter-service communication (sync/async), service discovery, API gateway, circuit breaker, distributed tracing, saga pattern, eventual consistency, health checking, shared nothing architecture, contract testing

---

## Skill Composition Rules

1. **No overlap**: If two skills cover the same topic, assign ownership to ONE skill, cross-reference from the other
2. **Consistent terminology**: All skills must use the same terms for the same concepts
3. **Consistent tech references**: If one skill says "use Zod", every skill mentioning validation references Zod
4. **Project-specific**: Every skill references actual project names, paths, tech versions
5. **Layered authority**: `project-architecture` decisions override individual skill preferences
6. **Version pinning**: All skills reference the same dependency versions
7. **Error format**: All skills use the same error shape and codes
8. **Logging format**: All skills use the same structured log format
