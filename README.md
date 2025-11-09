# Toast AI 🍞

**The definitive legal document intelligence platform** - Transform complex legal documents into clear, actionable insights with AI-powered analysis.

[Try now](toast-mu.vercel.app)

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Contributing](https://img.shields.io/badge/Contributing-Welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Mission

Toast AI democratizes legal understanding by making complex privacy policies, terms of service, and contracts accessible to everyone. We help:

- **Individuals** understand what they're agreeing to before signing up
- **Small businesses** assess vendor risks without expensive legal review
- **Enterprise teams** automate compliance monitoring and contract review
- **Developers** integrate legal intelligence into their applications

## Features

### Core Capabilities

- **Plain Language Summaries**: Complex legal jargon made accessible
- **Risk Scoring**: Get quantified risk assessments (0-10 scale)
- **Compliance Checking**: Verify GDPR, CCPA, and other regulatory compliance
- **Document Analysis**: Upload any legal document for instant AI analysis
- **Change Monitoring**: Track policy changes across websites
- **Comparison Tools**: Side-by-side policy comparisons

### Technical Features

- **Multi-Model AI**: Combines GPT-4, Claude, and specialized models
- **Real-time Processing**: <10 second analysis for standard documents
- **95%+ Accuracy**: Validated against legal expert annotations
- **API-First**: RESTful API with webhook support
- **Enterprise Ready**: SOC2 compliance, data encryption, team collaboration

## Quick Start

### Prerequisites

- **Python 3.11+** with [uv](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js 18+** with [bun](https://bun.sh/)
- **MongoDB** (local or cloud)
- **OpenAI API key** and **Anthropic API key**

### 1 Development Setup

We provide a comprehensive Makefile for easy development setup and workflow:

```bash
git clone https://github.com/lvndry/toast.git

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
- **Streamlit Dashboard**: http://localhost:8501 (see [Streamlit Setup Guide](apps/backend/docs/STREAMLIT_SETUP.md))

## 🤝 Contributing

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

This project is licensed under the AGPL-3.0 License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

<!-- - **Documentation**: [docs.toast.ai](https://docs.toast.ai) -->
<!-- - **API Reference**: [api.toast.ai](https://api.toast.ai) -->
<!-- - **Community**: [Discord](https://discord.gg/toast-ai) -->

- **Email**: lvndry@proton.me

---

**Built with ❤️ by the Toast AI team**

_Making legal intelligence accessible to everyone._
