# Skill Generation Guide

Detailed instructions for generating each category of skill. Consult this BEFORE writing any skill. Contains the specific content, code patterns, and standards each skill type must include.

---

## Universal Generation Rules

1. **Project-specific, never generic**: Every skill references actual project names, tech choices, file paths, and decisions. If a skill could apply to any project unchanged, it's too generic — rewrite it.

2. **Opinionated by design**: Pick the best approach for THIS project and enforce it. Don't offer menus. "Use Zod for all validation" not "You can choose Zod, Joi, or Yup."

3. **Code-first**: Lead with working code examples, follow with explanation. Developers scan code faster than prose.

4. **Failure-aware**: Every skill documents what goes wrong and how to handle it. The happy path is only half the story.

5. **Measurable**: "Be fast" is not a rule. "p95 API response < 200ms" is a rule. Every performance and quality target must be a number.

6. **Language-native**: Use the idioms of the project's language. Don't write Java patterns in Python or C++ patterns in JavaScript. Leverage the language's strengths.

7. **Framework-native**: Use the framework's built-in features before reaching for external libraries. Don't fight the framework.

---

## Security Skill Generation

The security skill must be PARANOID. Assume every input is malicious, every dependency is compromised, every network is hostile.

### Must Include: Input/Output Security Matrix

```
┌──────────────────┬────────────────────────┬──────────────────────────┐
│ Context          │ Threat                 │ Defense                  │
├──────────────────┼────────────────────────┼──────────────────────────┤
│ HTML rendering   │ XSS (stored/reflected) │ Context-aware encoding   │
│ SQL query        │ SQL injection          │ Parameterized queries    │
│ URL construction │ Open redirect, SSRF    │ Allowlist, validation    │
│ File path        │ Path traversal         │ Basename extraction      │
│ JSON output      │ Prototype pollution    │ Safe serialization       │
│ HTTP headers     │ Header injection       │ No user input in headers │
│ Shell command    │ Command injection      │ Parameterized, no shell  │
│ Email address    │ Header injection       │ Strict RFC validation    │
│ XML parsing      │ XXE, billion laughs    │ Disable external entities│
│ Regex            │ ReDoS                  │ Bounded quantifiers      │
│ Deserialization  │ RCE                    │ Safe formats (JSON) only │
│ Template render  │ SSTI                   │ Sandbox, no eval         │
│ Log output       │ Log injection/forging  │ Structured logging       │
│ Error response   │ Info disclosure        │ Generic messages         │
│ Cookie           │ Theft, fixation        │ Secure, HttpOnly, SameSite│
│ CORS             │ Cross-origin attacks   │ Explicit origin allowlist│
│ WebSocket        │ Cross-site WS hijack   │ Origin validation        │
│ File upload      │ Malware, shell upload  │ Type check, rename, scan │
│ GraphQL          │ Query complexity DoS   │ Depth/cost limiting      │
└──────────────────┴────────────────────────┴──────────────────────────┘
```

### Must Include: Security Headers

Provide the EXACT header configuration for the project. Adapt CSP to the actual tech:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: {project-specific — MUST be customized}
X-XSS-Protection: 0  (disabled — use CSP instead)
```

### Must Include: Cryptography Rules
```
Password hashing:  Argon2id (preferred) or bcrypt (rounds ≥ 12)
                   NEVER: MD5, SHA-1, SHA-256 for passwords
Encryption:        AES-256-GCM for symmetric
                   RSA-OAEP or ECDH for asymmetric
                   NEVER: ECB mode, DES, 3DES, RC4
Key derivation:    HKDF or PBKDF2 (iterations ≥ 600,000)
Randomness:        Cryptographic PRNG only (crypto.getRandomValues, os.urandom, etc.)
                   NEVER: Math.random, rand(), or non-crypto PRNGs for security
Token generation:  Minimum 256 bits of entropy
Comparison:        Constant-time comparison for secrets (timing attack prevention)
TLS:               1.3 preferred, 1.2 minimum. No SSL, no TLS 1.0/1.1
```

### Must Include: Dependency Security Protocol
```
1. AUTOMATED: Security audit in every CI run (fail on critical/high)
2. AUTOMATED: Lockfile integrity verification
3. AUTOMATED: Known-vulnerability database check (npm audit, pip-audit, cargo-audit)
4. POLICY: No postinstall/preinstall scripts from untrusted packages
5. POLICY: New dependency approval checklist:
   - Maintained? (commits in last 6 months)
   - Trusted? (known maintainers, significant usage)
   - Minimal? (does it do only what you need?)
   - Small? (check bundle impact)
   - License compatible?
6. POLICY: Pin major versions for security-critical deps
7. TOOL: Supply chain monitoring (Socket.dev, Snyk, or Dependabot)
```

---

## Error Handling Skill Generation

### Must Define: Project Error Hierarchy

Adapt to the project's language:

**TypeScript/JavaScript**:
```typescript
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly isOperational = true;
  constructor(message: string, public readonly context?: Record<string, unknown>, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError { readonly code = 'VALIDATION_FAILED'; readonly statusCode = 400; }
class AuthenticationError extends AppError { readonly code = 'AUTH_REQUIRED'; readonly statusCode = 401; }
class AuthorizationError extends AppError { readonly code = 'FORBIDDEN'; readonly statusCode = 403; }
class NotFoundError extends AppError { readonly code = 'NOT_FOUND'; readonly statusCode = 404; }
class ConflictError extends AppError { readonly code = 'CONFLICT'; readonly statusCode = 409; }
class RateLimitError extends AppError { readonly code = 'RATE_LIMITED'; readonly statusCode = 429; }
class ExternalServiceError extends AppError { readonly code = 'EXTERNAL_FAILURE'; readonly statusCode = 502; }
```

**Python**:
```python
class AppError(Exception):
    code: str = "INTERNAL_ERROR"
    status_code: int = 500
    is_operational: bool = True
    def __init__(self, message: str, context: dict | None = None):
        super().__init__(message)
        self.context = context or {}

class ValidationError(AppError): code = "VALIDATION_FAILED"; status_code = 400
class AuthenticationError(AppError): code = "AUTH_REQUIRED"; status_code = 401
# ...etc
```

**Go**:
```go
type AppError struct {
    Code         string         `json:"code"`
    Message      string         `json:"message"`
    StatusCode   int            `json:"-"`
    Operational  bool           `json:"-"`
    Context      map[string]any `json:"context,omitempty"`
    Err          error          `json:"-"`
}
func (e *AppError) Error() string { return e.Message }
func (e *AppError) Unwrap() error { return e.Err }
```

**Rust**:
```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Validation failed: {message}")]
    Validation { message: String, context: serde_json::Value },
    #[error("Authentication required")]
    Authentication,
    #[error("Forbidden: {message}")]
    Authorization { message: String },
    // ...
}
```

### Must Define: Error Propagation Layer Map
```
┌─────────────────────────────────────────────────────────────┐
│ Layer          │ Catches        │ Throws          │ Logs    │
├────────────────┼────────────────┼─────────────────┼─────────┤
│ HTTP Handler   │ All AppError   │ HTTP Response   │ Full    │
│ API Middleware  │ Unhandled      │ 500 response    │ Full    │
│ Service Layer  │ Domain errors  │ AppError        │ Context │
│ Repository     │ DB errors      │ AppError        │ Query   │
│ External Client│ Network errors │ ExternalService │ Req/Res │
│ Job Processor  │ All            │ Retry/DLQ       │ Full    │
│ Event Handler  │ All            │ Ack/Nack        │ Full    │
│ UI Boundary    │ Render errors  │ Fallback UI     │ Client  │
└────────────────┴────────────────┴─────────────────┴─────────┘
```

---

## Testing Skill Generation

### Must Define: Concrete Test Pyramid
```
Project Type          Unit    Integration    E2E
─────────────────────────────────────────────────
API Service           60%     30%            10%
Web App (SSR)         50%     30%            20%
SPA                   50%     25%            25%
Library/SDK           80%     15%            5%
CLI Tool              60%     30%            10%
Mobile App            50%     25%            25%
Microservices         40%     40%            20%
Data Pipeline         30%     50%            20%
```

### Must Define: Mock Decision Matrix
```
Dependency           Unit Test    Integration Test    E2E Test
────────────────────────────────────────────────────────────
Database             MOCK         Real (test DB)      Real
External API         MOCK         MOCK                Real or Mock
File System          MOCK         Real (temp dir)     Real
Time/Date            MOCK         MOCK                Real
Randomness           MOCK (seed)  MOCK (seed)         Real
Email Service        MOCK         MOCK                Mock
Payment Provider     MOCK         MOCK                Test mode
Cache (Redis etc)    MOCK         Real (test instance) Real
Queue/Job System     MOCK         Real (test instance) Real
Auth Provider        MOCK         Mock or Test mode    Real
```

### Must Include: Test Naming Convention
```
Pattern: describe("{Unit}") > it("{should_verb_when_condition}")

Example:
describe("UserService.createUser") {
  it("should create user with valid email")
  it("should reject duplicate email with ConflictError")
  it("should hash password before storage")
  it("should emit user.created event")
  it("should rollback on event publish failure")
}
```

---

## Database Skill Generation

### Must Include: Schema Conventions Table
```
Element              Convention           Example
──────────────────────────────────────────────────
Table name           snake_case, plural   user_profiles
Column name          snake_case           first_name
Primary key          id                   id (UUID v7)
Foreign key          {table}_id           user_id
Timestamp            *_at                 created_at, deleted_at
Boolean              is_* or has_*        is_active, has_mfa
Counter              *_count              login_count
Index name           idx_{table}_{cols}   idx_users_email
Unique constraint    uq_{table}_{cols}    uq_users_email
FK constraint        fk_{table}_{ref}     fk_orders_user_id
Check constraint     ck_{table}_{rule}    ck_users_age_positive
```

### Must Include: Required Columns
```
EVERY table must have:
  id          UUID v7 / ULID / CUID2 (distributed-safe, sortable)
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at  TIMESTAMP WITH TIME ZONE (auto-updated via trigger or ORM)

IF soft delete:
  deleted_at  TIMESTAMP WITH TIME ZONE DEFAULT NULL

IF multi-tenant:
  tenant_id   UUID NOT NULL (foreign key, indexed, in every query)

IF auditable:
  created_by  UUID (foreign key to users)
  updated_by  UUID (foreign key to users)
```

### Must Include: Migration Rules
```
1. One concern per migration (don't mix schema + data)
2. Forward-only in production (never run down migrations)
3. Idempotent (safe to run twice)
4. Backward compatible (old code works with new schema during rolling deploy)
5. Tested against production-sized dataset before deploy
6. Includes rollback plan as a comment
7. Data migrations in separate files from schema migrations
8. Migration naming: {timestamp}_{action}_{target}.{ext}
   Example: 20260309120000_add_mfa_columns_to_users.sql
```

---

## API Design Skill Generation

### Must Include: Response Envelope
```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": { "cursor": "abc", "hasMore": true, "total": 150 }
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human-readable summary",
    "details": [
      { "field": "email", "message": "Must be a valid email", "code": "invalid_format" }
    ],
    "requestId": "req_abc123"
  }
}
```

### Must Include: Status Code Decision Tree
```
Was the request syntactically valid?
├── No → 400 Bad Request
└── Yes → Is the user authenticated?
    ├── No (and auth required) → 401 Unauthorized
    └── Yes → Is the user authorized for this action?
        ├── No → 403 Forbidden
        └── Yes → Does the target resource exist?
            ├── No → 404 Not Found
            └── Yes → Is there a conflict?
                ├── Yes (duplicate, version) → 409 Conflict
                └── No → Is the input semantically valid?
                    ├── No → 422 Unprocessable Entity
                    └── Yes → Is the user rate limited?
                        ├── Yes → 429 Too Many Requests
                        └── No → Process the request
                            ├── Created something → 201 Created
                            ├── No body needed → 204 No Content
                            ├── Server error → 500 Internal Server Error
                            └── Success with body → 200 OK
```

---

## Performance Skill Generation

### Must Include: Budget Table (adapt to project type)

**Web Application**:
```
Metric                    Target        Hard Limit    Tool
──────────────────────────────────────────────────────────────
LCP                       < 2.0s        < 2.5s        Lighthouse
INP                       < 100ms       < 200ms       Lighthouse
CLS                       < 0.05        < 0.1         Lighthouse
TTFB                      < 200ms       < 500ms       WebPageTest
JS bundle (initial)       < 80KB gz     < 150KB gz    bundlesize
JS bundle (route)         < 30KB gz     < 60KB gz     bundlesize
CSS (initial)             < 20KB gz     < 40KB gz     bundlesize
Total page weight         < 500KB       < 1MB         Lighthouse
Font files                < 100KB       < 200KB       bundlesize
Image (hero)              < 150KB       < 300KB       imageOptim
```

**API Service**:
```
Metric                    Target        Hard Limit    Tool
──────────────────────────────────────────────────────────────
Response time p50         < 50ms        < 100ms       APM
Response time p95         < 200ms       < 500ms       APM
Response time p99         < 500ms       < 1000ms      APM
Throughput                > 1000 rps    > 500 rps     Load test
Error rate                < 0.01%       < 0.1%        APM
Memory baseline           < 256MB       < 512MB       Metrics
Cold start                < 2s          < 5s          Timer
DB query (simple)         < 5ms         < 20ms        Query log
DB query (complex)        < 50ms        < 200ms       Query log
Cache hit ratio           > 90%         > 80%         Metrics
```

**Library/SDK**:
```
Metric                    Target        Hard Limit    Tool
──────────────────────────────────────────────────────────────
Package size (minified)   < 10KB        < 30KB        size-limit
Package size (gzipped)    < 3KB         < 10KB        size-limit
Install size              < 500KB       < 2MB         packagephobia
Dependencies              0             ≤ 3           npm
Import time               < 5ms         < 20ms        Benchmark
Operation benchmark       {custom}      {custom}      Vitest bench
Tree-shakeable            YES           YES           Bundle check
```

---

## Observability Skill Generation

### Must Include: Log Level Decision Tree
```
Did something break?
├── Yes → Did it affect users?
│   ├── Yes → ERROR (page ops, trigger alert)
│   └── No → WARN (investigate soon)
└── No → Is it a significant business event?
    ├── Yes → INFO (user signup, payment, deployment)
    └── No → Is it useful for debugging?
        ├── Yes → DEBUG (never in production)
        └── No → Don't log it
```

### Must Include: Metric Types
```
Type          Use For                     Example
──────────────────────────────────────────────────────────
Counter       Monotonically increasing    http_requests_total
Gauge         Current value (up and down) active_connections
Histogram     Distribution of values      request_duration_seconds
Summary       Pre-calculated percentiles  response_size_bytes
```

---

## Privacy Skill Generation

### Must Include: PII Classification Matrix
```
Category        Examples                      Storage Rule         Log Rule
──────────────────────────────────────────────────────────────────────────────
Direct PII      Name, email, phone, address   Encrypt at rest      NEVER log
Sensitive PII   SSN, passport, health data    Encrypt + isolate    NEVER log
Indirect PII    IP address, device ID, GPS    Encrypt at rest      Hash in logs
Financial       Credit card, bank account     PCI-compliant vault  NEVER log
Auth            Password, token, API key      Hash/encrypt         NEVER log
Behavioral      Browsing history, searches    Anonymize after N    Aggregate only
User Content    Messages, uploads, notes      Encrypt at rest      NEVER log
```

### Must Include: Data Lifecycle Rules
```
Phase           Requirement
──────────────────────────────────────────────
Collection      Minimum necessary, explicit consent, purpose documented
Storage         Encrypted at rest, access-controlled, retention limit set
Processing      Purpose-limited, logged, anonymized where possible
Sharing         DPA required, documented, user-consented
Retention       Auto-delete schedule, configurable per data type
Deletion        Complete removal from all stores (DB, backups, caches, search indexes, logs)
Breach          Detection (<24h), assessment, notification (72h GDPR), remediation
```

---

## Framework-Specific Generation Guidance

When the project uses a specific framework, generate an additional framework skill. Key areas to cover per framework family:

**React-based (Next.js, Remix, React Router)**: Component composition rules, server vs client component decisions, data fetching patterns, caching, code splitting, hydration, state management integration, form handling, error boundaries, suspense boundaries, streaming SSR

**Vue-based (Nuxt, Vue)**: Composition API patterns, composable design, Pinia state patterns, auto-imports policy, server routes, universal rendering, lazy components

**Svelte-based (SvelteKit)**: Runes patterns, load functions, form actions, server hooks, streaming, progressive enhancement

**Python Web (Django, FastAPI, Flask)**: Request lifecycle, middleware, ORM usage, serialization, async views, background tasks, admin customization, management commands

**Go Web (Gin, Echo, Fiber, stdlib)**: Handler patterns, middleware chains, context usage, graceful shutdown, structured errors, dependency injection

**Rust Web (Actix, Axum, Rocket)**: Extractor patterns, state management, tower middleware, error types, async runtime, graceful shutdown

**JVM (Spring Boot, Ktor, Quarkus)**: DI patterns, configuration, profiles/environments, actuator/health, security filters, transaction management

**PHP (Laravel, Symfony)**: Service providers, middleware, Eloquent/Doctrine patterns, queues, events, blade/twig templates, authorization gates

**Ruby (Rails, Sinatra)**: Convention patterns, concerns, service objects, jobs, mailers, callbacks policy, N+1 prevention

---

## Language-Specific Type Safety Generation

When generating `{language}-standards`, include these type-safety rules per language:

**TypeScript**: no `any` (use `unknown`), no non-null assertion abuse, branded types for IDs, discriminated unions for states, `satisfies` for type checking, `const` assertions, strict tsconfig flags

**Python**: mypy strict mode, Protocol/ABC for interfaces, TypedDict for dicts, Literal for enums, runtime validation (Pydantic), no `# type: ignore` without comment

**Go**: error wrapping (fmt.Errorf with %w), interface design (accept interfaces, return structs), nil checking, goroutine leak prevention, context propagation

**Rust**: minimize `unwrap()` (use `?` operator), avoid `clone()` where borrow suffices, `#[must_use]` on fallible functions, custom error types, lifetime elision rules

**Java/Kotlin**: `@Nullable`/`@NonNull` annotations, Optional usage rules, sealed interfaces, record types for DTOs, no raw types

**Swift**: no force unwrapping, optional binding, Result type, actor isolation, Sendable protocol, structured concurrency (async let, TaskGroup)

**C#**: nullable reference types enabled, record types, pattern matching, async/await (no .Result blocking), span for perf-critical paths

---

## Language-Agnostic Version Verification Guide

When generating skills for ANY language, verify these versions BEFORE generating code.

### Universal Version Matrix (2026)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ LANGUAGE   │ COMPILER    │ LTS VERSION  │ PACKAGE MGR  │ MIN TOOLS              │
├────────────────────────────────────────────────────────────────────────────────┤
│ TypeScript │ Node.js     │ 22.x LTS     │ npm 10+      │ TypeScript 5.7+, ESLint│
│ Python     │ CPython     │ 3.12+        │ pip/uv       │ mypy 1.8+, ruff 0.9+   │
│ Go         │ go          │ 1.24+        │ go modules   │ golangci-lint 1.60+    │
│ Rust       │ rustc       │ 1.85+        │ cargo        │ clippy, rustfmt        │
│ Java       │ OpenJDK     │ 21 LTS       │ Maven/Gradle │ checkstyle, spotbugs   │
│ Kotlin     │ kotlinc     │ 2.1+         │ Gradle       │ ktlint, detekt         │
│ C#         │ .NET SDK    │ 9.0+         │ NuGet        │ analyzers, format      │
│ Swift      │ swiftc      │ 6.0+         │ SwiftPM      │ swiftlint, swiftformat │
│ PHP        │ PHP         │ 8.4+         │ Composer 2+  │ PHPStan 2+, Psalm      │
│ Ruby       │ Ruby        │ 3.4+         │ Bundler      │ RuboCop, solargraph    │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Verification Commands per Language

```bash
# TypeScript / Node.js
node --version          # Verify v22.x
npm --version           # Verify 10.x
npx tsc --version       # Verify 5.7+

# Python
python --version        # Verify 3.12+
pip --version           # Verify 24+
python -m mypy --version # Verify 1.8+

# Go
go version              # Verify 1.24+
go env GOVERSION

# Rust
rustc --version         # Verify 1.85+
cargo --version

# Java
java --version          # Verify 21
javac --version

# C#
dotnet --version        # Verify 9.0+

# Swift
swift --version         # Verify 6.0+

# PHP
php --version           # Verify 8.4+
composer --version      # Verify 2.x

# Ruby
ruby --version          # Verify 3.4+
bundle --version
```

### Code Example Requirements

Every generated skill MUST:
1. Use **verified latest version** APIs only
2. Include **version pragma** where applicable
3. Show **import/require** statements
4. Use **modern syntax** (not legacy compatibility mode)
5. Include **type annotations** where language supports it

**Example: TypeScript 5.7+ vs Legacy**
```typescript
// ❌ OLD (TypeScript < 5.0)
import { useState } from 'react';
const [count, setCount] = useState<number>(0);

// ✅ NEW (TypeScript 5.7+)
import { useState } from 'react';
const [count, setCount] = useState(0); // Inference improved
```

**Example: Python 3.12+ Features**
```python
# ✅ NEW (Python 3.12+)
# Type parameter syntax
def process[T](items: list[T]) -> T:
    return items[0]

# Improved f-strings
value = 42
print(f"The value is {value=}")  # The value is value=42

# Exception groups
try:
    raise ExceptionGroup("multiple", [ValueError(), TypeError()])
except* ValueError:
    print("Caught ValueError")
```

### Version Verification Script Template

Include this in every `{language}-standards` skill:

```python
# version_check.py — Run before bootstrap
def verify_versions():
    """Verify all tools are at required minimum versions."""
    checks = {
        "python": ("3.12.0", sys.version_info),
        "pip": ("24.0.0", get_pip_version()),
        "ruff": ("0.9.0", get_ruff_version()),
        # Add all tools...
    }
    
    for tool, (min_ver, current_ver) in checks.items():
        if not version_gte(current_ver, min_ver):
            raise VersionError(
                f"{tool} {current_ver} < required {min_ver}. "
                f"Please upgrade: pip install --upgrade {tool}"
            )
```

### Version Pinning in Generated Projects

Every generated project MUST include locked versions:

**TypeScript (package.json)**
```json
{
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    "next": "16.1.0",  // Pinned exact
    "react": "19.0.0",
    "typescript": "5.7.3"
  }
}
```

**Python (requirements.txt)**
```
# requirements.txt — All versions pinned
fastapi==0.115.0
pydantic==2.10.0
uvicorn==0.34.0
```

**Rust (Cargo.toml)**
```toml
[dependencies]
tokio = "=1.43.0"  # Pinned with =
axum = "=0.8.0"
serde = "=1.0.217"
```

**Go (go.mod)**
```
go 1.24

require (
    github.com/gin-gonic/gin v1.10.0
)
```

### Outdated Version Detection

Flag these patterns as **REJECT**:
- Node.js < 20 (EOL)
- Python < 3.11 (security risk)
- Go < 1.22 (missing generics improvements)
- Rust < 1.75 (async traits unstable)
- Java < 21 (missing virtual threads)
- PHP < 8.3 (missing readonly classes)
