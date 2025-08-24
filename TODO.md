## Toast AI – Strategic Roadmap & Actionable TODOs

This living backlog prioritizes features for rapid revenue generation and strong foundation building. Focus on Phase 1 to get paying clients, then scale through Phase 3.

### Product Vision

- Democratize legal understanding with legal‑grade accuracy and <10s responses
- Build trust with citations, confidence, and explainability
- Scale from individuals to enterprise compliance teams
- **Target: $100K MRR through privacy-conscious individuals → small business → enterprise**

---

## Strategic Phases

### Phase 1: MVP Foundation (2-3 weeks) - Get First Paying Clients

**Goal: 5+ paying customers, $45+ MRR, 95%+ legal accuracy**

#### Core Value Proposition (Must-Have)

- [ ] **Document Upload & Analysis Pipeline**

  - [ ] Basic PDF/TXT/DOCX support with OCR fallback
  - [ ] Simple RAG with citations and confidence scores
  - [ ] Risk scoring (Low/Medium/High/Critical) with plain English explanations
  - [ ] Focus on privacy policy analysis first (highest demand)

- [ ] **Essential Frontend Flow**

  - [ ] Upload → Analysis → Results in under 60 seconds
  - [ ] Clear risk communication with actionable insights
  - [ ] Basic Stripe integration for $9/month individual plan
  - [ ] "Analyze a sample policy" demo flow

- [ ] **Legal Accuracy Foundation**
  - [ ] GDPR/CCPA compliance checking with citations
  - [ ] 95%+ accuracy on core legal patterns
  - [ ] Legal expert validation badges
  - [ ] Confidence meters with reasoning

#### Technical MVP Priorities

- [ ] **Backend Core**

  - [ ] AuthN/AuthZ for all backend routes (JWT/Clerk) with user context
  - [ ] Rate limiting by tier (Free: 3 analyses/month, Individual: unlimited)
  - [ ] Upload pipeline: size/MIME checks, virus scan, S3 storage
  - [ ] OCR fallback for image‑based PDFs (Tesseract or cloud OCR)
  - [ ] Background jobs (Celery + Redis) for OCR, summarization, embeddings
  - [ ] RAG fast path: hybrid search (keyword + vector) + metadata filters + citations
  - [ ] Structured answers: answer, citations[], confidence, risk_level, recommended_actions[]

- [ ] **Frontend Core**

  - [ ] Analysis page with stepwise progress UI and streaming updates
  - [ ] Risk badges (low/medium/high/critical) with color coding
  - [ ] Confidence meter with rationale toggle
  - [ ] Inline citations that jump to exact source passages
  - [ ] Gated routes by plan and feature flags

- [ ] **Monetization**
  - [ ] Stripe paywall: Individual plan ($9/month) with usage metering
  - [ ] Free tier limitations: 3 analyses/month, basic risk scores
  - [ ] Upgrade prompts when hitting analysis limits
  - [ ] Value demonstration triggers for high-risk findings

#### Success Metrics (Phase 1)

- [ ] 100+ document analyses completed
- [ ] 5+ paying customers ($45+ MRR)
- [ ] 95%+ legal accuracy on test set
- [ ] <10 second average response time
- [ ] 60%+ user retention after first analysis

### Phase 2: Product-Market Fit (4-6 weeks) - Scale to $10K MRR

**Goal: 100+ paying customers, $5K+ MRR, 60%+ retention**

#### Conversion Optimization

- [ ] **Value Demonstration**

  - [ ] Industry-specific risk assessments (individual vs business)
  - [ ] High-risk finding highlights that trigger upgrades
  - [ ] ROI calculators for business users
  - [ ] Social proof: testimonials and case studies

- [ ] **Business Tier Features**

  - [ ] Vendor comparison tools (side-by-side policy analysis)
  - [ ] Basic policy change monitoring with email alerts
  - [ ] Exportable reports for compliance teams
  - [ ] Business plan ($49/month) with vendor risk assessment

- [ ] **Trust & Credibility**
  - [ ] Source citations with exact text references
  - [ ] Legal precedent and regulation citations
  - [ ] Uncertainty handling when AI is unsure
  - [ ] Human review prompts for complex cases

#### Advanced Features

- [ ] **Compliance MVP**

  - [ ] GDPR/CCPA checklist mapping with citations and pass/fail
  - [ ] Overall compliance score with violations list
  - [ ] Recommended remediations with specific actions
  - [ ] Industry benchmark comparisons

- [ ] **Document Management**
  - [ ] Document viewer with source side panel
  - [ ] Text highlight sync when hovering citations
  - [ ] Version tracking for policy changes
  - [ ] Document organization and tagging

#### Success Metrics (Phase 2)

- [ ] 1000+ analyses completed
- [ ] 100+ paying customers ($5K+ MRR)
- [ ] 60%+ user retention after 7 days
- [ ] 25%+ free-to-paid conversion rate
- [ ] 4.5+ rating on analysis helpfulness

### Phase 3: Enterprise Scale (8-12 weeks) - Path to $100K MRR

**Goal: 500+ paying customers, $50K+ MRR, enterprise customers**

#### Enterprise Features

- [ ] **Team Collaboration**

  - [ ] RBAC + Teams: roles, sharing, comments, approvals, audit trails
  - [ ] SSO (SAML/OIDC): Okta, Azure AD, Google Workspace
  - [ ] Document sharing with role-based permissions
  - [ ] Approval workflows for high-risk findings
  - [ ] Team analytics and productivity tracking

- [ ] **Advanced Compliance Engine**

  - [ ] Multi-jurisdiction support (GDPR, CCPA, PIPEDA, LGPD)
  - [ ] Weighted risk scoring by industry
  - [ ] Automated compliance reporting for auditors
  - [ ] Gap analysis with remediation playbooks
  - [ ] Regulatory change monitoring and alerts

- [ ] **Integration & Automation**
  - [ ] Webhooks (HMAC): analysis_complete, policy_change, rate_limit_near
  - [ ] API access for enterprise customers
  - [ ] Bulk document processing (Drive/S3/email/ZIP)
  - [ ] Slack/Teams bots: push alerts + quick Q&A
  - [ ] Browser extension for in-page policy analysis

#### Enterprise Plan ($500+/month)

- [ ] Unlimited team members and document storage
- [ ] Custom compliance policies and scoring
- [ ] Advanced analytics and reporting
- [ ] Priority support and SLA guarantees
- [ ] White-label options for enterprise customers

#### Success Metrics (Phase 3)

- [ ] 10,000+ analyses completed
- [ ] 500+ paying customers ($50K+ MRR)
- [ ] 3+ enterprise customers ($15K+ ACV)
- [ ] <5% monthly churn rate
- [ ] 4.7+ NPS score

---

## Detailed Backlog (by area)

### Product & UX

- [ ] **Design System**

  - [ ] Design system pass (tokens, typography, risk colors)
  - [ ] Consistent risk communication patterns
  - [ ] Mobile-first responsive design
  - [ ] Accessibility compliance (WCAG 2.1 AA)

- [ ] **Analysis Interface**

  - [ ] Severity badges (low/medium/high/critical) with business impact
  - [ ] Plain English explanations for complex legal concepts
  - [ ] Actionable recommendations with next steps
  - [ ] Export options: PDF reports, summary emails, team sharing

- [ ] **Document Comparison**

  - [ ] Side‑by‑side doc diff with colored additions/removals
  - [ ] Summarized "what changed" and risk delta
  - [ ] Filtering options: privacy-related, data sharing, liability clauses
  - [ ] Industry standard benchmarking

- [ ] **Monitoring & Alerts**

  - [ ] Subscriptions (email/Slack/webhook) for policy changes
  - [ ] Manage tracked vendors; set recrawl cadence
  - [ ] Risk trend analysis and historical views
  - [ ] Automated alerts for compliance violations

- [ ] **Onboarding**
  - [ ] "Analyze a sample policy" 60‑second demo
  - [ ] Industry presets (individual vs SMB vs enterprise)
  - [ ] Progressive feature discovery
  - [ ] Success moment: highlight concerning finding in uploaded document

### Frontend (Next.js)

- [ ] **Core Features**

  - [ ] Streaming answers with progressive disclosure (server actions)
  - [ ] Chunked uploads + resumable for large files
  - [ ] Gated routes in `middleware.ts` by plan and feature flags
  - [ ] Components: RiskBadge, ConfidenceMeter, CitationList, SourcePanel, DiffViewer

- [ ] **Performance & UX**

  - [ ] Code splitting by user type (individual vs enterprise features)
  - [ ] Keyboard navigation and screen reader support
  - [ ] High contrast mode and adjustable font sizes
  - [ ] Core Web Vitals: LCP < 2s, FID < 100ms, CLS < 0.1

- [ ] **Mobile Optimization**
  - [ ] Thumb-friendly navigation and swipe gestures
  - [ ] Optimized document reading and zoom controls
  - [ ] Camera capture for physical documents
  - [ ] Progressive web app capabilities

### Backend API (FastAPI)

- [ ] **Core Infrastructure**

  - [ ] Enforce auth on `apps/backend/src/routes/*`; attach `user` to request context
  - [ ] API versioning `/api/v1`, consistent error model, pagination helpers
  - [ ] Request validation & size/MIME guards; ClamAV/cloud AV
  - [ ] S3 integration: original file storage, signed URLs

- [ ] **Background Processing**

  - [ ] Celery worker for OCR, classification, summarization, embeddings
  - [ ] Webhooks and polling endpoints
  - [ ] Job status tracking and error handling
  - [ ] Retry logic with exponential backoff

- [ ] **Rate Limiting & Usage**
  - [ ] Rate limiting middleware by tier; burst control; usage tracking per user
  - [ ] Usage analytics for business intelligence
  - [ ] Cost optimization and token usage monitoring
  - [ ] Budget alerts and anomaly detection

### Document Pipeline

- [ ] **Document Processing**
  - [ ] `document_processor.py`
    - [ ] Language detection + optional translation
    - [ ] Robust MIME sniffing; DOC/PDF/TXT/DOCX parity; image‑PDF OCR
    - [ ] Region tagging (EU/US/UK/…); effective_date extraction heuristics
    - [ ] Persist to DB and S3; return normalized metadata
  - [ ] Versioning: immutable snapshots with `content_hash`, `effective_date`, `source_url`
  - [ ] Dedupe by normalized URL + canonicalization; robots.txt politeness for crawler

### Retrieval & LLM Orchestration

- [ ] **RAG System**
  - [ ] `rag.py`
    - [ ] Hybrid retrieval (keyword + vector) with metadata filters (doc_type, region, effective_date)
    - [ ] Cross‑encoder re‑ranking step before generation
    - [ ] Structured outputs (JSON): answer, citations (exact quotes + URLs + spans), confidence, risk_level
    - [ ] Low‑confidence path: HyDE expansion and verify‑with‑evidence pass (selective)
  - [ ] Chunking
    - [ ] Heading/semantic chunking; store token/char spans for pinpoint citations
    - [ ] Batch embeddings; back‑pressure and retry logic
  - [ ] Indexing
    - [ ] Per‑company namespace; include `doc_type`, `region`, `effective_date` in metadata
    - [ ] On‑startup Pinecone index existence check and creation
    - Cron to check every n days (could start with 7) if there's an update in the documents (we do a sha 256 comparison between stored content and crawled content)

### Compliance Engine

- [ ] **MVP Compliance**
  - [ ] GDPR/CCPA checklist mapping to findings with citations
  - [ ] Report: overall score, violations[], recommended remediations[]
  - [ ] Industry-specific compliance requirements
- [ ] **Advanced Compliance**
  - [ ] Weighted controls, configurable policies by industry
  - [ ] Multi-jurisdiction regulatory mapping
  - [ ] Automated compliance reporting and audit trails

### Data & Storage

- [ ] **Database Optimization**
  - [ ] Mongo indexes
    - [ ] `documents(company_id, doc_type, regions, effective_date)`
    - [ ] `documents.url` unique
    - [ ] `conversations(user_id, updated_at)`
  - [ ] Migrations: backfill indexes and normalize existing data
  - [ ] S3: lifecycle policies; KMS; encryption at rest
  - [ ] Redis: job queues + short‑term caches (retrieval results)

### Security & Privacy

- [ ] **Security Foundation**
  - [ ] Secrets via manager; key rotation
  - [ ] HSTS, strict CORS allowlist, secure cookies
  - [ ] Input validation and output escaping for user content
  - [ ] PII redaction in logs; privacy‑by‑default telemetry
- [ ] **Enterprise Security**
  - [ ] Audit logs for access, role changes, exports/deletes
  - [ ] DSR workflows (export/delete) + retention policies
  - [ ] WAF/CDN in front of API; IP throttling and bot detection
  - [ ] SOC2 compliance and security certifications

### Observability & Cost

- [ ] **Monitoring & Metrics**
  - [ ] Prometheus metrics: latency, error rate, queue time, tokens, per‑model costs
  - [ ] Business metrics: analyses completed, high‑risk findings, upgrades
  - [ ] Tracing (OpenTelemetry) across OCR→classify→analyze→embed
  - [ ] Sentry for exceptions with PII redaction
- [ ] **Cost Management**
  - [ ] Cost alerts on model spend; anomaly detection for token spikes
  - [ ] Per-model routing for cost optimization
  - [ ] Caching layers for common analyses
  - [ ] Budget controls and usage forecasting

### Testing & QA

- [ ] **Quality Assurance**
  - [ ] Unit: classification fixtures; parser edge cases; URL canonicalization
  - [ ] Integration: upload→OCR→classify→summarize→embed→answer
  - [ ] E2E: user journey and visual regression for diff/citations
  - [ ] Evaluation harness: legal accuracy vs expert annotations (≥95% gate)
  - [ ] Load tests: concurrent uploads/queries; <10s P50/P95 targets

### DevEx, CI/CD, IaC

- [ ] **Development Experience**
  - [ ] Pre‑commit hooks (Ruff/ESLint/Prettier/Bandit) finalized
  - [ ] CI: type‑check, tests, container build, SBOM, SCA, image scan
  - [ ] CD: blue‑green deploy; config via secrets manager; migrations gating
  - [ ] IaC (Terraform): Mongo/Redis/S3/Pinecone, env parity (dev/stage/prod)

### Growth & New Ideas

- [ ] **Product Extensions**
  - [ ] Browser extension MVP for in‑page policy analysis
  - [ ] Public policy diff pages for SEO (major vendors)
  - [ ] "Privacy‑friendly alternatives" suggestions on high risk
  - [ ] Bulk ingestion (GDrive/S3/email)
  - [ ] Slack/Teams bots: push alerts + quick Q&A

---

## File‑level Pointers

### Phase 1 Priority Files

- [ ] `apps/backend/src/routes/conversation.py`: enforce auth; size/MIME guards; async background handoff; idempotency; structured responses
- [ ] `apps/backend/src/document_processor.py`: OCR fallback; language detection; region tagging; robust sniffing; persist to S3
- [ ] `apps/backend/src/rag.py`: hybrid retrieval; re‑ranking; structured outputs; selective verification
- [ ] `apps/backend/src/embedding.py`: heading chunking; batch upserts; retry/backoff; per‑namespace upserts
- [ ] `apps/backend/src/vector_db.py`: lazy index init; health checks; metrics
- [ ] `apps/backend/src/db.py`: indexes on startup; unique URL; pagination helpers

### New Services to Create

- [ ] `services/llm_service.py` (retry/timeouts/cost)
- [ ] `services/compliance_engine.py`
- [ ] `middlewares/security.py`
- [ ] `workers/` (Celery)
- [ ] `schemas/` (pydantic response models)
- [ ] `webhooks/` (HMAC verify)

---

## Acceptance Targets

### Phase 1 Targets

- [ ] Legal accuracy ≥95% on curated test set
- [ ] P95 response <10s for standard docs; deterministic fallbacks when exceeded
- [ ] 100% of answers include at least one exact‑text citation or clearly state insufficiency
- [ ] 5+ paying customers with $45+ MRR

### Phase 2 Targets

- [ ] 100+ paying customers with $5K+ MRR
- [ ] 60%+ user retention after 7 days
- [ ] 25%+ free-to-paid conversion rate
- [ ] 4.5+ rating on analysis helpfulness

### Phase 3 Targets

- [ ] 500+ paying customers with $50K+ MRR
- [ ] 3+ enterprise customers with $15K+ ACV
- [ ] <5% monthly churn rate
- [ ] 4.7+ NPS score

---

## Revenue Strategy

### Pricing Tiers

- **Free**: 3 analyses/month, basic risk scores, no exports
- **Individual ($9/month)**: Unlimited analyses, detailed reports, email alerts
- **Business ($49/month)**: Vendor comparisons, change monitoring, team sharing
- **Enterprise ($500+/month)**: SSO, advanced compliance, API access, white-label

### Conversion Optimization

- High-risk findings trigger upgrade prompts
- Industry-specific value demonstrations
- ROI calculators for business users
- Social proof and testimonials throughout

---

## References

- Agentic retrieval inspiration (auto‑routed, composite retrieval, re‑ranking, HyDE/Self‑RAG): [RAG is dead, long live agentic retrieval](https://www.llamaindex.ai/blog/rag-is-dead-long-live-agentic-retrieval)
