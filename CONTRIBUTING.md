# Contributing to Toast AI 🍞

Thank you for your interest in contributing to Toast AI! We're building the definitive legal document intelligence platform, and we welcome contributions from developers, legal experts, and anyone passionate about making legal documents more accessible.

## 🎯 Our Mission

Toast AI democratizes legal understanding by transforming complex privacy policies, terms of service, and contracts into clear, actionable insights. We help:

- **Individuals** understand what they're agreeing to before signing up
- **Small businesses** assess vendor risks without expensive legal review
- **Enterprise teams** automate compliance monitoring and contract review
- **Developers** integrate legal intelligence into their applications

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with [uv](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js 18+** with [bun](https://bun.sh/)
- **Git** for version control
- **MongoDB** (local or cloud) for development

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/toast.git
cd toast

# Complete project setup (recommended)
make setup

# Start development servers
make dev
```

For a complete list of available commands, run `make help`.

## 📋 Contribution Guidelines

### Before You Start

1. **Check existing issues** - Search for existing issues or discussions
2. **Create an issue first** - For new features or significant changes
3. **Read our documentation** - Understand our architecture and legal domain
4. **Join our community** - Connect with other contributors

### Legal Considerations

Since we're building legal analysis tools, we have special considerations:

- **Accuracy is critical** - Legal analysis must be precise and reliable
- **Jurisdiction awareness** - Consider different legal systems and regulations
- **Privacy compliance** - We handle sensitive legal documents
- **Professional responsibility** - Legal advice implications

### Code Standards

#### Backend (Python/FastAPI)

- **Python 3.11+** with type hints
- **FastAPI** for API development
- **Pydantic** for data validation
- **Ruff** for linting and formatting
- **95%+ test coverage** for legal analysis components

#### Frontend (Next.js/TypeScript)

- **Next.js 15** with App Router
- **TypeScript 5.6** for type safety
- **Tailwind CSS** for styling
- **ESLint + Prettier** for code quality

#### Legal Analysis Components

- **Multi-model approach** - Combine different LLMs for accuracy
- **Confidence scoring** - Always provide certainty levels
- **Explainable AI** - Show reasoning behind legal conclusions
- **Validation** - Cross-reference with legal databases

### Development Workflow

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/toast.git
cd toast

# Add upstream remote
git remote add upstream https://github.com/your-org/toast.git
```

#### 2. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

#### 3. Make Your Changes

```bash
# Set up development environment
make setup

# Make your changes
# Test your changes
make test

# Format and lint your code
make format
make lint
```

#### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
git commit -m "feat(legal-analysis): add GDPR compliance checker"
git commit -m "fix(api): resolve rate limiting issue"
git commit -m "docs(readme): update installation instructions"
```

**Commit Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### 5. Push and Create a Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
make test

# Run backend tests only
cd apps/backend && source .venv/bin/activate && python -m pytest tests/ -v

# Run frontend tests only
cd apps/frontend && bun test
```

### Test Requirements

- **Legal accuracy tests** - Validate against expert-annotated documents
- **Performance tests** - Ensure <10 second analysis times
- **Security tests** - Verify data protection and privacy
- **Integration tests** - Test end-to-end workflows

### Writing Tests

```python
# Example legal analysis test
async def test_privacy_policy_analysis():
    """Test privacy policy analysis accuracy"""
    document = load_test_document("sample_privacy_policy.pdf")
    analysis = await legal_analyzer.analyze_document(document)

    # Validate legal accuracy
    assert analysis.risk_score >= 0 and analysis.risk_score <= 10
    assert analysis.confidence_score >= 0.8  # High confidence required
    assert len(analysis.key_findings) > 0
```

## 📝 Documentation

### Code Documentation

- **Docstrings** for all functions and classes
- **Type hints** for all Python functions
- **JSDoc comments** for TypeScript functions
- **README files** for each major component

### Legal Documentation

- **Legal reasoning** - Document legal analysis logic
- **Jurisdiction notes** - Specify applicable legal systems
- **Confidence explanations** - Why we're certain/uncertain
- **Limitations** - What our analysis can't determine

### Example Documentation

```python
async def analyze_gdpr_compliance(text: str) -> GDPRComplianceResult:
    """
    Analyze text for GDPR compliance.

    This function checks for key GDPR requirements including:
    - Lawful basis for processing
    - Data subject rights
    - Data protection principles
    - Breach notification requirements

    Args:
        text: The legal document text to analyze

    Returns:
        GDPRComplianceResult with compliance status and findings

    Note:
        This analysis is based on GDPR as of 2024. Legal landscape
        changes may affect accuracy over time.
    """
```

## 🔒 Security and Privacy

### Data Handling

- **No persistent storage** of user documents
- **Encryption** of all data in transit and at rest
- **Access controls** for sensitive legal data
- **Audit logging** for compliance purposes

### Legal Compliance

- **GDPR compliance** for EU users
- **CCPA compliance** for California users
- **SOC2 compliance** for enterprise customers
- **Regular security audits**

## 🎨 UI/UX Guidelines

### Design Principles

- **Legal clarity** - Make complex concepts accessible
- **Trust indicators** - Show accuracy and reliability
- **Progressive disclosure** - Start simple, allow drilling down
- **Emotional safety** - Legal documents can be anxiety-inducing

### Accessibility

- **WCAG 2.1 AA** compliance
- **Screen reader** support
- **Keyboard navigation** for all features
- **High contrast** mode for legal documents

## 🤝 Community Guidelines

### Code of Conduct

We're committed to providing a welcoming and inclusive environment:

- **Be respectful** - Treat everyone with dignity
- **Be collaborative** - Work together constructively
- **Be professional** - Maintain high standards
- **Be inclusive** - Welcome diverse perspectives

### Communication

- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for questions and ideas
- **Pull Requests** for code contributions
- **Discord/Slack** for real-time collaboration

## 🏆 Recognition

### Contributors

We recognize contributions in several ways:

- **Contributor Hall of Fame** in our README
- **Special badges** for legal experts and security researchers
- **Mention in release notes** for significant contributions
- **Invitation to core team** for consistent contributors

### Legal Expert Contributors

Special recognition for legal professionals:

- **Legal accuracy review** of AI analysis
- **Jurisdiction expertise** for international compliance
- **Case law updates** for legal precedent
- **Regulatory guidance** for compliance features

## 🚨 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (OS, browser, etc.)
- **Screenshots or logs** if applicable

### Security Issues

For security vulnerabilities:

- **Private disclosure** to security@toast.ai
- **Detailed description** of the vulnerability
- **Proof of concept** if possible
- **Responsible disclosure** timeline

### Legal Accuracy Issues

For legal analysis problems:

- **Document type** and jurisdiction
- **Expected legal interpretation**
- **AI analysis results**
- **Expert validation** if available

## 📚 Resources

### Learning Resources

- **FastAPI Documentation** - https://fastapi.tiangolo.com/
- **Next.js Documentation** - https://nextjs.org/docs
- **Legal AI Resources** - Industry best practices
- **Privacy Law Updates** - Regulatory changes

### Development Tools

- **Makefile** - `make help` for all commands
- **Pre-commit hooks** - Automated code quality
- **Development scripts** - `dev.sh` for local development
- **Testing framework** - Comprehensive test suite

## 🎯 Getting Help

### Questions and Support

- **GitHub Issues** for technical problems
- **GitHub Discussions** for general questions
- **Documentation** for setup and usage
- **Community channels** for real-time help

### Mentorship

We offer mentorship for new contributors:

- **Onboarding sessions** for first-time contributors
- **Code reviews** with detailed feedback
- **Legal domain guidance** for non-lawyers
- **Architecture walkthroughs** for complex features

---

Thank you for contributing to Toast AI! Together, we're making legal documents accessible to everyone. 🍞✨

## 📄 License

By contributing to Toast AI, you agree that your contributions will be licensed under the [MIT License](LICENSE).
