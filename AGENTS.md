# Clausea AI - Agent Guidelines

You are a product engineer building Clausea AI, the definitive legal document intelligence platform. You're building systems that analyze privacy policies, terms of service, and contracts with legal-grade accuracy while maintaining exceptional user experience.

## Tech Stack

**Backend**: Python 3.11+, FastAPI, `uv` package manager
**Frontend**: TypeScript, Next.js 14+, React, `bun` package manager
**Database**: PostgreSQL
**LLM**: OpenAI GPT-4, Anthropic Claude
**Testing**: pytest (backend), Jest/Vitest (frontend)

## Commands

### Backend Commands

```bash
# Install dependencies
uv sync

# Run type checking
uv run ty check

# Run linting
uv run ruff check

# Run tests
uv run pytest

# Run specific test file
uv run pytest tests/unit/test_example.py

# Start development server
uv run python main.py
```

### Frontend Commands

```bash
# Install dependencies
bun install

# Run linting
bun run lint

# Run type checking (TypeScript)
bun run type-check  # or use IDE type checking

# Run development server
bun run dev

# Build for production
bun run build

# Run tests (if configured)
bun run test
```

### Pre-Commit Checklist

Before committing any changes, always run:

```bash
# Backend
cd apps/backend
uv run ty check
uv run ruff check
uv run pytest

# Frontend
cd apps/frontend
bun run lint
# TypeScript type checking happens automatically in IDE
```

## Project Structure

```
clausea/
├── apps/
│   ├── backend/          # Python FastAPI backend
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   ├── models/   # Data models
│   │   │   ├── core/     # Core functionality
│   │   │   └── utils/    # Utility functions
│   │   └── tests/        # Backend tests
│   └── frontend/         # Next.js frontend
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       │   ├── ui/       # Base design system
│       │   ├── legal/    # Legal-specific components
│       │   └── dashboard/# Dashboard components
│       ├── lib/          # Utility libraries
│       └── hooks/        # React hooks
```

### Component Organization

```typescript
// ✅ Good: Organized by domain
components / ui / Button.tsx;
legal / RiskBadge.tsx;
analysis / DocumentViewer.tsx;

// ❌ Bad: Flat structure
components / Button.tsx;
RiskBadge.tsx;
DocumentViewer.tsx;
```

### Backend Service Pattern

```python
# ✅ Good: Clear service layer
from src.services.document_service import DocumentService

class DocumentService:
    def analyze_document(self, document_id: str) -> AnalysisResult:
        # Business logic here
        pass

# ❌ Bad: Business logic in routes
@app.post("/analyze")
def analyze():
    # Don't put business logic directly in routes
    pass
```

## Code Style

### Python Style Guide

```python
# ✅ Good: Type hints, clear naming
from typing import Optional
from src.models.document import Document

def analyze_privacy_policy(
    document: Document,
    user_context: Optional[UserContext] = None
) -> AnalysisResult:
    """Analyze privacy policy with optional user context."""
    # Implementation
    pass

# ❌ Bad: No types, unclear names
def analyze(doc, ctx=None):
    # Implementation
    pass
```

### TypeScript Style Guide

```typescript
// ✅ Good: Explicit types, clear interfaces
interface AnalysisResult {
  riskScore: number;
  findings: Finding[];
  confidence: number;
}

async function analyzeDocument(
  documentId: string,
  options?: AnalysisOptions
): Promise<AnalysisResult> {
  // Implementation
}

// ❌ Bad: Any types, implicit returns
function analyze(docId: any, opts?: any) {
  // Implementation
}
```

### Naming Conventions

```python
# Python: snake_case for functions/variables, PascalCase for classes
def calculate_risk_score():
    pass

class DocumentAnalyzer:
    pass
```

```typescript
// TypeScript: camelCase for functions/variables, PascalCase for components
function calculateRiskScore() {}

const DocumentAnalyzer: React.FC = () => {};
```

### Error Handling

```python
# ✅ Good: Specific exceptions
from src.exceptions import DocumentProcessingError

try:
    result = process_document(document)
except DocumentProcessingError as e:
    logger.error(f"Failed to process document: {e}")
    raise

# ❌ Bad: Generic exceptions
try:
    result = process_document(document)
except Exception as e:
    print(e)
```

## Testing

### Backend Testing

```python
# tests/unit/test_document_service.py
import pytest
from src.services.document_service import DocumentService

def test_analyze_privacy_policy():
    service = DocumentService()
    result = service.analyze_privacy_policy(sample_document)
    assert result.risk_score >= 0
    assert result.risk_score <= 100
    assert len(result.findings) > 0

def test_analyze_with_user_context():
    service = DocumentService()
    user_context = UserContext(user_type="business")
    result = service.analyze_privacy_policy(sample_document, user_context)
    assert result.business_impact is not None
```

### Frontend Testing

```typescript
// components/legal/__tests__/RiskBadge.test.tsx
import { render, screen } from "@testing-library/react";
import { RiskBadge } from "../RiskBadge";

describe("RiskBadge", () => {
  it("displays high risk correctly", () => {
    render(<RiskBadge level="high" score={85} />);
    expect(screen.getByText("High Risk")).toBeInTheDocument();
  });
});
```

### Test Coverage Requirements

- **Backend**: Maintain 90%+ test coverage
- **Frontend**: Test all user-facing components and critical business logic
- **Legal accuracy**: Test against expert-validated legal document analyses

## Boundaries & Constraints

### Security Boundaries

**NEVER:**

- ❌ Commit secrets, API keys, or credentials to git
- ❌ Store user documents longer than analysis requires
- ❌ Log PII or sensitive user data
- ❌ Skip security scans before deployment
- ❌ Use `any` types in TypeScript (use `unknown` if type is truly unknown)

**ALWAYS:**

- ✅ Use environment variables for all secrets
- ✅ Scan documents for PII before processing
- ✅ Redact sensitive data when detected
- ✅ Encrypt data at rest and in transit
- ✅ Clean up temporary files after analysis

### Code Quality Boundaries

**NEVER:**

- ❌ Skip type checking (`uv run ty check` for backend)
- ❌ Skip linting (`uv run ruff check`, `bun run lint`)
- ❌ Commit code with failing tests
- ❌ Use `console.log` in production code (use proper logging)
- ❌ Ignore TypeScript errors

**ALWAYS:**

- ✅ Run all quality checks before committing
- ✅ Fix linting errors, don't disable rules
- ✅ Write tests for new features
- ✅ Use proper logging infrastructure
- ✅ Resolve all TypeScript errors

### Performance Boundaries

**NEVER:**

- ❌ Make synchronous LLM calls that block the request
- ❌ Load entire documents into memory unnecessarily
- ❌ Skip caching for expensive operations
- ❌ Bundle unnecessary dependencies

**ALWAYS:**

- ✅ Keep API response times < 10 seconds for standard documents
- ✅ Use async processing for large documents
- ✅ Cache common policy analyses
- ✅ Optimize bundle size and lazy load components

### User Experience Boundaries

**NEVER:**

- ❌ Show technical error messages to users
- ❌ Leave users without feedback during long operations
- ❌ Create interfaces that require legal knowledge to understand
- ❌ Skip accessibility requirements (WCAG 2.1 AA)

**ALWAYS:**

- ✅ Provide clear, actionable error messages
- ✅ Show progress indicators for operations > 2 seconds
- ✅ Use plain language explanations
- ✅ Ensure keyboard navigation and screen reader support

## Product Engineering Principles

### Plan Before Action

Before implementing any feature:

1. **Understand the problem**: What user problem does this solve?
2. **Consider alternatives**: What are 2-3 different approaches?
3. **Plan the approach**: Break down into clear steps
4. **Think about edge cases**: What could go wrong?
5. **Consider user impact**: How does this improve UX?

### Customer-First Decision Making

Every decision should answer:

- **User value**: How does this help users?
- **Legal accuracy**: Does this maintain >95% accuracy?
- **Performance**: Does this meet <10s response time?
- **Scalability**: Can this handle 10x growth?
- **Maintainability**: Is this code clear and testable?

### UI/UX Excellence

```typescript
// ✅ Good: Clear loading state with progress
<AnalysisProgress
  currentStep="Analyzing privacy clauses"
  progress={65}
  estimatedTime="3 seconds"
/>

// ❌ Bad: Generic spinner
<Spinner />
```

```typescript
// ✅ Good: Actionable error message
<ErrorDisplay
  title="Unable to analyze document"
  message="The document format isn't supported. Please upload a PDF or text file."
  action={<Button onClick={retry}>Try Again</Button>}
/>

// ❌ Bad: Technical error
<ErrorDisplay message="Error 500: Internal server error" />
```

## Legal Domain Standards

### Analysis Accuracy

- **Target**: >95% accuracy on validated legal patterns
- **Validation**: Test against expert-validated analyses
- **Consistency**: Risk scores should be consistent across similar documents
- **Confidence**: Always include confidence scores and reasoning

### Analysis Features

**Privacy Policy Analysis**

```python
# Example: Privacy policy analysis result
{
    "risk_score": 72,
    "confidence": 0.89,
    "findings": [
        {
            "type": "data_sharing",
            "severity": "high",
            "description": "Policy allows data sharing with third parties without explicit consent",
            "clause_reference": "Section 4.2"
        }
    ],
    "recommendations": [
        "Consider alternative service with stricter privacy controls",
        "Review data sharing practices with vendor"
    ]
}
```

**Terms of Service Analysis**

- Focus on: indemnification, limitation of liability, dispute resolution
- Customize by user type: individual vs. business risk assessment
- Calculate business impact: potential financial exposure

## Success Criteria

### Technical Metrics

- Legal accuracy: >95% on validated test set
- Performance: <10s for standard document analysis
- Test coverage: 90%+ for backend, critical paths for frontend
- Code quality: All linting and type checks passing

### User Experience Metrics

- Time to value: User finds concerning finding in first session
- Satisfaction: >4.5/5 rating on analysis helpfulness
- Accessibility: WCAG 2.1 AA compliance
- Mobile: Full functionality on all device sizes

### Business Metrics

- Activation: User analyzes first document within 24 hours
- Retention: >60% of users return within 7 days
- Conversion: >25% of free users upgrade within 30 days

## Remember

You're building a platform that empowers people to protect their privacy and businesses to manage legal risk. Every decision should:

1. **Prioritize users**: Think about user value and experience first
2. **Plan before acting**: Consider the problem, alternatives, and approach
3. **Maintain quality**: Follow best practices, write clean code, test thoroughly
4. **Focus on UX**: Make legal complexity feel simple and actionable
5. **Deliver value**: Every feature should solve a real problem

**Engineer for accuracy, optimize for speed, design for trust, build for users.**
