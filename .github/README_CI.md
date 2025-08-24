# GitHub Workflows

This directory contains GitHub Actions workflows for the Toast AI project.

## Workflows

### 1. `ci.yml` - Full CI Pipeline

**Triggers:** Push/PR to `main` or `develop` branches

Runs comprehensive checks for both backend and frontend:

- **Backend:** Linting (ruff), type checking (mypy), tests (pytest), app startup verification
- **Frontend:** ESLint, TypeScript checking, Prettier formatting, Next.js build
- **Security:** Bandit (Python), npm audit (Node.js)

### 2. `backend.yml` - Backend-Specific CI

**Triggers:** Push/PR to `main` or `develop` with changes in `apps/backend/`

Runs backend-specific checks:

- Python 3.11 and 3.12 compatibility
- Ruff linting
- MyPy type checking
- Bandit security scanning
- Pytest test suite
- FastAPI app startup verification

### 3. `frontend.yml` - Frontend-Specific CI

**Triggers:** Push/PR to `main` or `develop` with changes in `apps/frontend/`

Runs frontend-specific checks:

- Node.js 18 and 20 compatibility
- ESLint code quality checks
- TypeScript type checking
- Prettier formatting validation
- Next.js build verification
- npm security audit

## Workflow Features

### Caching

- **Backend:** UV virtual environment and package cache
- **Frontend:** npm dependencies cache

### Matrix Testing

- **Backend:** Tests against Python 3.11 and 3.12
- **Frontend:** Tests against Node.js 18 and 20

### Artifacts

- Test results and reports are uploaded as artifacts
- Build outputs are preserved for debugging
- Security reports are retained for 30 days

### Path Filtering

Individual workflows only run when relevant files are changed, improving CI efficiency.

## Local Development

To run the same checks locally:

### Backend

```bash
cd apps/backend
uv sync --dev
uv run ruff check .
uv run mypy src/ --ignore-missing-imports
uv run pytest tests/ -v
```

### Frontend

```bash
cd apps/frontend
npm ci
npm run lint
npm run type-check
npx prettier --check .
npm run build
```

## Security

- Backend security scanning with Bandit
- Frontend dependency vulnerability scanning with npm audit
- Optional Snyk integration (requires `SNYK_TOKEN` secret)

## Troubleshooting

### Common Issues

1. **Backend import errors in CI**: Ensure all dependencies are in `pyproject.toml`
2. **Frontend build failures**: Check for TypeScript errors and missing dependencies
3. **Cache misses**: Verify cache keys match dependency lock files

### Debugging

- Check workflow logs for detailed error messages
- Download artifacts to inspect test results
- Use `continue-on-error: true` for non-blocking security checks
