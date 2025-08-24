# Toast AI 🍞

**The definitive legal document intelligence platform** - Transform complex legal documents into clear, actionable insights with AI-powered analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![Contributing](https://img.shields.io/badge/Contributing-Welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Mission

Toast AI democratizes legal understanding by making complex privacy policies, terms of service, and contracts accessible to everyone. We help:

- **Individuals** understand what they're agreeing to before signing up
- **Small businesses** assess vendor risks without expensive legal review
- **Enterprise teams** automate compliance monitoring and contract review
- **Developers** integrate legal intelligence into their applications

## 🚀 Features

### Core Capabilities

- **Document Analysis**: Upload any legal document for instant AI analysis
- **Risk Scoring**: Get quantified risk assessments (0-10 scale)
- **Plain Language Summaries**: Complex legal jargon made accessible
- **Compliance Checking**: Verify GDPR, CCPA, and other regulatory compliance
- **Change Monitoring**: Track policy changes across websites
- **Comparison Tools**: Side-by-side policy comparisons

### Technical Features

- **Multi-Model AI**: Combines GPT-4, Claude, and specialized models
- **Real-time Processing**: <10 second analysis for standard documents
- **95%+ Accuracy**: Validated against legal expert annotations
- **API-First**: RESTful API with webhook support
- **Enterprise Ready**: SOC2 compliance, data encryption, team collaboration

## 🏗️ Architecture

```
toast/
├── apps/
│   ├── backend/          # FastAPI + Python 3.11
│   │   ├── src/         # Core application logic
│   │   ├── routes/      # API endpoints
│   │   └── services/    # Business logic services
│   └── frontend/        # Next.js 15 + TypeScript
│       ├── app/         # App Router pages
│       ├── components/  # React components
│       └── lib/         # Utilities and types
├── dev.sh              # Development environment script
├── setup-precommit.sh  # Pre-commit setup
└── .pre-commit-config.yaml
```

## 🛠️ Tech Stack

### Backend

- **FastAPI**: Modern, fast web framework
- **Python 3.11+**: Latest Python with type hints
- **uv**: Fast Python package manager
- **Ruff**: Blazingly fast Python linter (replaces black, isort, flake8)
- **Motor**: Async MongoDB driver
- **LiteLLM**: Unified LLM interface
- **Pydantic**: Data validation and settings

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript 5.6**: Type-safe JavaScript
- **bun**: Fast JavaScript runtime and package manager
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Clerk**: Authentication and user management

### AI & ML

- **OpenAI GPT-4**: Complex legal reasoning
- **Anthropic Claude**: Nuanced risk assessment
- **Voyage Law**: Law focused embedding model
- **LangChain**: LLM orchestration
- **Pinecone**: Vector database for embeddings

### Development Tools

- **Pre-commit**: Automated code quality checks
- **ESLint 9**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Bandit**: Python security scanning

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with [uv](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js 18+** with [bun](https://bun.sh/)
- **MongoDB** (local or cloud)
- **OpenAI API key** and **Anthropic API key**

### 1 Development Setup

We provide a comprehensive Makefile for easy development setup and workflow:

```bash
git clone https://github.com/your-org/toast.git

# Complete project setup (recommended for new developers)
make setup

# Start development servers
make dev

# Or run individual components
make run-backend    # Backend only
make run-frontend   # Frontend only
```

**Available Make Commands:**

```bash
make help           # Show all available commands
make setup          # Complete project setup
make dev            # Start development environment
make test           # Run tests
make lint           # Run linting
make format         # Format code
make clean          # Clean up temporary files
```

For a complete list of commands, run `make help`.

### 2. Environment Configuration

```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env
# Edit with your API keys and database URLs

# Frontend environment
cp apps/frontend/.env.example apps/frontend/.env
# Edit with your Clerk and API configuration
```

### 3. Start Development

```bash
# Start both frontend and backend
./dev.sh

# Or start individually
cd apps/backend && uv run python -m uvicorn main:app --reload
cd apps/frontend && bun run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🧪 Development Workflow

### Code Quality Setup

```bash
# Set up pre-commit hooks
./setup-precommit.sh

# This installs:
# - Ruff (Python linting + formatting)
# - ESLint (TypeScript/JavaScript linting)
# - Prettier (Code formatting)
# - Bandit (Security scanning)
# - Type checking and build validation
```

### Development Commands

```bash
# Backend
cd apps/backend
uv run python -m uvicorn main:app --reload  # Development server
uv run ruff check .                          # Lint Python code
uv run ruff format .                         # Format Python code
uv run pytest                               # Run tests

# Frontend
cd apps/frontend
bun run dev                                 # Development server
bun run lint                                # Lint TypeScript/JavaScript
bun run format                              # Format code
bun run type-check                          # Type checking
bun run build                               # Production build
```

### Git Workflow

```bash
# Pre-commit hooks run automatically on:
git add .
git commit -m "feat: add new analysis feature"

# Manual pre-commit checks
pre-commit run --all-files
pre-commit run ruff        # Python only
pre-commit run eslint      # Frontend only
```

## 📚 API Documentation

### Core Endpoints

#### Document Analysis

```bash
POST /api/v1/analysis
Content-Type: multipart/form-data

{
  "document": <file>,
  "analysis_type": "privacy_policy|terms_of_service|contract",
  "jurisdiction": "US|EU|CA",
  "user_type": "individual|business|enterprise"
}
```

#### Analysis Results

```json
{
  "id": "analysis_123",
  "risk_score": 7.8,
  "risk_level": "HIGH",
  "confidence_score": 0.95,
  "summary": "This privacy policy allows broad data sharing...",
  "key_findings": [
    {
      "category": "data_sharing",
      "risk_level": "HIGH",
      "description": "Company may share personal data with unlimited third parties",
      "location": "Section 4.2",
      "recommendation": "Consider using alternative service"
    }
  ],
  "compliance": {
    "gdpr_compliant": false,
    "ccpa_compliant": true,
    "violations": ["Right to deletion not clearly specified"]
  }
}
```

### Webhook Integration

```bash
POST /api/v1/webhooks/analysis-complete
{
  "event": "analysis_complete",
  "analysis_id": "analysis_123",
  "risk_score": 7.8,
  "summary": "Analysis summary...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🏢 Enterprise Features

### Team Collaboration

- **Role-based access control**
- **Document sharing and commenting**
- **Approval workflows for high-risk findings**
- **Audit trails and compliance reporting**

### API Access

- **RESTful API with comprehensive documentation**
- **Webhook support for real-time notifications**
- **Rate limiting and usage tracking**
- **SDK support for multiple languages**

### Security & Compliance

- **SOC2 Type II compliance**
- **Data encryption at rest and in transit**
- **GDPR and CCPA compliance by design**
- **Automatic PII detection and redaction**

## 🤝 Contributing

We welcome contributions from developers, legal experts, and anyone passionate about making legal documents more accessible!

### Quick Start for Contributors

1. **Fork the repository** and clone your fork
2. **Set up development environment**: `make setup`
3. **Start development servers**: `make dev`
4. **Make your changes** and test them
5. **Submit a pull request** with clear description

### Special Areas for Contribution

- **Legal Analysis**: Improve AI accuracy for specific jurisdictions
- **UI/UX**: Make legal insights more accessible and user-friendly
- **Performance**: Optimize analysis speed and cost efficiency
- **Documentation**: Help users understand legal concepts better
- **Testing**: Validate legal accuracy and edge cases

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

<!-- - **Documentation**: [docs.toast.ai](https://docs.toast.ai) -->
<!-- - **API Reference**: [api.toast.ai](https://api.toast.ai) -->
<!-- - **Community**: [Discord](https://discord.gg/toast-ai) -->

- **Email**: lvndry@proton.me

---

**Built with ❤️ by the Toast AI team**

_Making legal intelligence accessible to everyone._
