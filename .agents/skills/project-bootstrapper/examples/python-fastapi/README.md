# Example: Python + FastAPI Project

This example demonstrates a complete skill suite generated for a Python-based API service using FastAPI.

## Project Details

- **Name**: Task Management API
- **Type**: REST API service
- **Tech Stack**:
  - Python 3.12.0
  - FastAPI 0.115.0
  - Pydantic 2.10.0
  - PostgreSQL 17.2
  - SQLAlchemy 2.0.36
  - pytest 8.3.0
  - Ruff 0.9.0
  - uv (package manager)

## Generated Skills

### Tier 1 — Core (11 skills)
1. `project-architecture` — Clean architecture, dependency injection
2. `python-standards` — Type hints, ruff, mypy strict mode
3. `security-hardening` — Input validation, secrets, HTTPS
4. `error-handling` — HTTP exceptions, middleware, logging
5. `data-validation` — Pydantic models, request/response schemas
6. `testing-strategy` — pytest, fixtures, coverage 85%+
7. `performance-optimization` — p95 < 200ms, async patterns
8. `git-workflow` — Conventional commits, PR templates
9. `documentation-standards` — Docstrings, OpenAPI, README
10. `privacy-compliance` — GDPR, data retention, anonymization
11. `dependency-management` — uv, lockfiles, audit

### Tier 2 — Data & API (4 skills)
12. `database-design` — SQLAlchemy models, migrations (Alembic)
13. `api-design` — REST conventions, HATEOAS, versioning
14. `auth-patterns` — JWT tokens, OAuth2, role-based access
15. `caching-strategy` — Redis, cache headers, invalidation

### Tier 3 — Operations (3 skills)
16. `devops-pipeline` — GitHub Actions, Docker, cloud deploy
17. `observability` — Structured logging, Prometheus metrics
18. `background-jobs` — Celery, task queues, scheduling

## Directory Structure

```
.claude/skills/
├── project-architecture/
│   ├── SKILL.md
│   └── references/
│       ├── patterns.md
│       ├── anti-patterns.md
│       └── checklist.md
├── python-standards/
│   ├── SKILL.md
│   ├── references/
│   └── templates/
│       └── pyproject.template.toml
├── fastapi-patterns/
│   ├── SKILL.md
│   └── references/
├── ... (all 18 skills)
└── _bootstrap-manifest.json
```

## Key Features

### Version Verification
All versions verified on 2026-03-09:
- Python 3.12.0
- FastAPI 0.115.0
- Pydantic 2.10.0
- PostgreSQL 17.2

### Python-Specific Rules
- **Type Safety**: mypy strict mode enabled
- **Linting**: ruff for formatting and linting
- **Async**: Proper async/await patterns
- **Dependencies**: uv for fast package management
- **Modern Syntax**: Python 3.12+ features (type params, improved f-strings)

### API Design Patterns
```python
# Example: Pydantic v2 schema with validation
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Annotated

class TaskCreate(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=200)]
    description: str | None = None
    due_date: datetime | None = None
    priority: int = Field(ge=1, le=5, default=3)
    
    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
```

### Security Highlights
- Pydantic v2 for input validation
- JWT token authentication
- HTTPS enforcement
- SQL injection prevention via SQLAlchemy
- Rate limiting per endpoint

### Performance Targets
- API response p95: < 200ms
- Database query: < 10ms (simple), < 100ms (complex)
- Throughput: > 1000 req/s

## Running Validation

```bash
# Validate all skills
python ../../scripts/validate_bootstrap.py .claude/skills/

# Check versions
python ../../scripts/version_checker.py .claude/skills/

# Check Python versions locally
python --version  # Should be 3.12+
uv --version      # Should be 0.6+
```

## Project Commands

```bash
# Setup
uv sync

# Run tests
pytest --cov=app --cov-report=html

# Run linting
ruff check .
ruff format .
mypy app/

# Start server
uvicorn app.main:app --reload
```

## Next Steps

1. Review each generated skill
2. Adjust SQLAlchemy models for your schema
3. Add domain-specific business logic skills
4. Configure deployment pipeline
5. Start building API endpoints

---

**Note**: This is an example structure. Generate actual skills using the bootstrapper for your real project.
