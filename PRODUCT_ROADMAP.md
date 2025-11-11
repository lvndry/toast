# Toast AI – Product Roadmap

## First Principles: Who We Serve & Why

### Our Customers

**1. Privacy-Conscious Individuals**

- **Job-to-be-done**: "Should I sign up for this service?" or "What am I really agreeing to?"
- **Pain**: Legal documents are incomprehensible, take hours to read, and hide important details
- **Value**: Get a clear "safe to proceed" or "avoid this service" answer in 60 seconds
- **Emotional trigger**: Feeling vulnerable and uninformed about data practices

**2. Small Business Owners**

- **Job-to-be-done**: "Is this vendor safe to use without expensive legal review?"
- **Pain**: Can't afford lawyers for every vendor, don't know what clauses are dangerous
- **Value**: Understand vendor risks and make confident decisions without legal consultation
- **Emotional trigger**: Fear of unexpected liability or contract terms

**3. Compliance Officers**

- **Job-to-be-done**: "Are we compliant and are our vendors compliant?"
- **Pain**: Manual document review doesn't scale, can't track policy changes
- **Value**: Proactively identify compliance risks before they become problems
- **Emotional trigger**: Anxiety about missing a critical compliance issue

**4. Legal Teams**

- **Job-to-be-done**: "Review documents 10x faster while maintaining accuracy"
- **Pain**: Bottlenecked by document volume, hard to standardize reviews
- **Value**: Process more documents with the same team size
- **Emotional trigger**: Pressure to be both fast and thorough

### Core Value Proposition

**For everyone**: Transform legal complexity into clear, actionable insights that enable confident decision-making.

---

## Product Vision

Toast AI makes legal documents understandable in plain English, identifies risks and compliance issues, and provides clear next steps—all in under 60 seconds.

---

## Phase 1: Core Value Delivery (MVP)

**Goal**: Get first paying customers by delivering clear value in one focused use case.

### Focus: Privacy Policy Analysis for Individuals

**Why start here**: Highest demand, clearest value proposition, fastest path to "aha moment"

**Strategy**: Pre-scraped companies database

- Documents already extracted and analyzed → instant results
- Users select from popular services (Spotify, Netflix, Stripe, etc.)
- Upload option available for companies not yet in database
- **Advantage**: Fast user experience, no waiting for crawling/processing

### Core User Flow

**1. Landing Experience**

- User arrives → sees "Understand any privacy policy in 60 seconds"
- Two options:
  - **Browse companies**: Select from pre-scraped popular services (Spotify, Netflix, Stripe, etc.) - instant analysis
  - **Upload your own**: Upload a PDF (for companies not yet in our database)

**2. Analysis Experience**

- Select company from list → Instant results (documents already analyzed)
- OR Upload document → Processing (show progress) → Results in <60 seconds
- Results page shows:
  - **Verdict**: "Safe to proceed" / "Proceed with caution" / "Avoid this service"
  - **Risk score**: Visual (0-10 scale) with color coding
  - **Key findings**: Top 3-5 concerns in plain English
  - **What this means**: Plain English explanation of each finding
  - **What you can do**: Actionable next steps

**3. Value Demonstration**

- If high-risk finding detected → Show upgrade prompt: "See full analysis + comparison tools"
- Free tier: Basic verdict + top 3 findings
- Paid tier: Full analysis + citations + comparisons + monitoring

### Must-Have Features

**Document Analysis**

- **Primary**: Select from pre-scraped companies (instant analysis - documents already processed)
- **Secondary**: Upload PDF for companies not yet in database (on-demand processing)
- Return: verdict, risk score, key findings, plain English explanations

**Risk Communication**

- Visual risk score (0-10) with color coding
- Plain English verdict ("Safe" / "Caution" / "Avoid")
- Top concerns highlighted with explanations

**Trust Building**

- **Evidence strength** for each finding:
  - "Strong evidence" - Clear, unambiguous language found
  - "Moderate evidence" - Somewhat clear, but could be interpreted differently
  - "Weak evidence" - Ambiguous or incomplete information
- Citations to exact document passages (show the actual text)
- Document quality indicators:
  - "Complete analysis" - All sections reviewed
  - "Partial analysis" - Some sections unclear or missing
  - "Limited analysis" - Document is incomplete or poorly structured
- Uncertainty handling: When we're not sure, say so explicitly ("We couldn't find clear information about data sharing")

**Example of Evidence Strength in Practice:**

- Finding: "This policy allows data sharing with third parties"
  - Evidence: Strong - Direct quote: "We may share your data with advertising partners..."
  - Citation: [Link to section 3.2] with highlighted text
- Finding: "Data retention period is unclear"
  - Evidence: Weak - Policy mentions "as long as necessary" but no specific timeframe
  - Citation: [Link to section 5.1] with note: "Ambiguous language found"

**Monetization**

- Free: 3 analyses/month, basic verdict + top 3 findings
- Individual ($9/month): Unlimited analyses, full reports, citations, comparisons

### Success Metrics

- 100+ analyses completed
- 5+ paying customers
- 60%+ users find a concerning finding in their first analysis
- <60 second average time to verdict

---

## Phase 2: Expand Use Cases

**Goal**: Expand to business users and add comparison/monitoring features.

### New User Flow: Vendor Risk Assessment

**For Small Business Owners**

**1. Vendor Dashboard**

- Add vendors (select from pre-scraped list OR upload)
- See all vendors at a glance with risk scores
- Sort by risk level, date added, compliance status

**2. Vendor Analysis**

- Select vendor from pre-scraped list OR upload vendor privacy policy/terms
- Get business-focused risk assessment:
  - **Data sharing risks**: Will they sell your data?
  - **Liability risks**: What are you responsible for?
  - **Compliance risks**: Are they GDPR/CCPA compliant?
  - **Business impact**: What could go wrong?

**3. Comparison Tools**

- Side-by-side comparison of 2+ vendors
- Highlight key differences
- "Which vendor is safer?" recommendation

**4. Change Monitoring**

- Track vendor policies over time
- Get alerts when policies change
- See what changed and if risk increased

### New Features

**Business Tier ($49/month)**

- Vendor risk dashboard
- Policy change monitoring
- Comparison tools
- Exportable reports

**Compliance Checking**

- GDPR/CCPA compliance score
- List of violations with citations
- Recommended remediations

**Document Comparison**

- Side-by-side view of 2 documents
- Highlighted differences
- Risk delta ("This policy is riskier because...")

### Success Metrics

- 100+ paying customers
- 25%+ free-to-paid conversion
- 60%+ retention after 7 days
- 4.5+ rating on helpfulness

---

## Phase 3: Enterprise Scale

**Goal**: Serve enterprise compliance teams with team collaboration and advanced features.

### Enterprise User Flow

**1. Team Dashboard**

- Team members can collaborate
- Assign document reviews
- Track completion status
- Audit trail of all actions

**2. Bulk Processing**

- Upload hundreds of documents at once
- Batch analysis with progress tracking
- Export compliance reports

**3. Advanced Compliance**

- Multi-jurisdiction support (GDPR, CCPA, PIPEDA, LGPD)
- Industry-specific compliance requirements
- Automated compliance reporting

**4. Integrations**

- API access for developers
- Webhooks for policy changes
- Slack/Teams bots for alerts

### Enterprise Features

**Team Collaboration**

- Role-based access control
- Document sharing and comments
- Approval workflows
- Team analytics

**Advanced Compliance**

- Custom compliance policies
- Weighted risk scoring by industry
- Regulatory change monitoring
- Gap analysis and remediation playbooks

**Enterprise Plan ($500+/month)**

- Unlimited team members
- SSO (SAML/OIDC)
- Custom compliance policies
- API access
- Priority support

### Success Metrics

- 500+ paying customers
- 3+ enterprise customers ($15K+ ACV)
- <5% monthly churn
- 4.7+ NPS score

---

## Feature Priorities (No Technical Details)

### Must-Have (Phase 1)

- [ ] Browse/search pre-scraped companies list (Spotify, Netflix, Stripe, etc.)
- [ ] Select company → Instant analysis results (documents already processed)
- [ ] Upload PDF option for companies not yet in database
- [ ] Get verdict + risk score + key findings instantly (or <60 seconds for uploads)
- [ ] Plain English explanations of legal concepts
- [ ] Citations to exact document passages with evidence strength indicators
- [ ] Document quality indicators (complete vs partial analysis)
- [ ] Explicit uncertainty handling ("We couldn't find clear information about...")
- [ ] Free tier (3 analyses/month) + Individual tier ($9/month)
- [ ] Upgrade prompts when high-risk findings detected

### Should-Have (Phase 2)

- [ ] Vendor dashboard for business users
- [ ] Policy change monitoring with alerts
- [ ] Side-by-side document comparison
- [ ] GDPR/CCPA compliance checking
- [ ] Exportable reports
- [ ] Business tier ($49/month)

### Nice-to-Have (Phase 3)

- [ ] Team collaboration and sharing
- [ ] Bulk document processing
- [ ] Multi-jurisdiction compliance
- [ ] API access
- [ ] Webhooks and integrations
- [ ] Enterprise tier ($500+/month)

---

## UX Principles

### Clarity Over Complexity

- Every screen should answer: "What should I do next?"
- Use plain English, not legal jargon
- Show the most important information first

### Trust Through Transparency

- Show evidence strength for each finding (strong/moderate/weak)
- Cite exact sources with highlighted passages
- Explain reasoning clearly
- Be explicit about uncertainty ("We couldn't find clear information about...")
- Show document quality (complete vs partial analysis)

### Action-Oriented

- Every finding should have a "what you can do" section
- Make next steps obvious
- Guide users toward decisions

### Emotional Safety

- Legal documents are anxiety-inducing
- Design for confidence and control
- Celebrate when users make informed decisions

---

## Success Criteria

### Phase 1 Success

- Users can analyze a privacy policy and get a clear verdict in <60 seconds
- 60%+ of users find a concerning finding in their first analysis
- 5+ paying customers
- Users understand what they're agreeing to

### Phase 2 Success

- Business users can assess vendor risks confidently
- Users can compare policies and make informed choices
- 100+ paying customers
- Users feel protected and informed

### Phase 3 Success

- Enterprise teams can process documents at scale
- Compliance teams can monitor vendors proactively
- 500+ paying customers
- Users trust Toast AI for critical decisions

---

## Revenue Strategy

### Pricing Tiers

**Free**

- 3 analyses/month
- Basic verdict + top 3 findings
- No exports or comparisons

**Individual ($9/month)**

- Unlimited analyses
- Full reports with citations
- Comparison tools
- Email alerts

**Business ($49/month)**

- Everything in Individual
- Vendor dashboard
- Policy change monitoring
- Exportable reports
- Team sharing (up to 5 members)

**Enterprise ($500+/month)**

- Everything in Business
- Unlimited team members
- SSO
- Custom compliance policies
- API access
- Priority support

### Conversion Strategy

- High-risk findings trigger upgrade prompts
- Show value before asking for payment
- Make upgrade frictionless
- Demonstrate ROI for business users

---

## What We're NOT Building (Yet)

- Generic document Q&A (focus on legal analysis first)
- Contract negotiation tools (focus on understanding first)
- Legal document generation (focus on analysis first)
- Browser extension (focus on web app first)
- Mobile app (focus on web experience first)
- On-demand URL crawling (focus on pre-scraped database first - too slow for MVP)

## Company Database Strategy

### Phase 1: Start with Popular Services

- Focus on high-demand companies (Spotify, Netflix, Stripe, Google, etc.)
- Pre-scrape and analyze their privacy policies
- Users get instant results when selecting these companies

### Phase 2: Expand Based on Demand

- Track which companies users request (via uploads)
- Prioritize adding most-requested companies to pre-scraped database
- Build up library of 100+ popular services

### Phase 3: Automated Expansion

- Automated crawling for new companies
- User requests trigger background scraping
- Maintain freshness of existing company documents

---

## Key Questions to Answer

1. **What's the fastest path to "aha moment"?**

   - Answer: Analyze a privacy policy and find a concerning data sharing clause

2. **What makes users want to pay?**

   - Answer: Finding something concerning + wanting to compare with alternatives

3. **What makes users come back?**

   - Answer: Monitoring vendor policies + comparing new services

4. **What makes users tell others?**
   - Answer: Finding something surprising + sharing comparison results

---

**Remember**: We're not building a generic AI tool. We're building a legal intelligence platform that helps people make confident decisions about their privacy and business risks. Every feature should serve that goal.
