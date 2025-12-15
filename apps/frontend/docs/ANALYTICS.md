# PostHog Analytics Implementation

This document outlines the comprehensive PostHog analytics implementation for Toast AI's frontend application.

## Overview

We've implemented a robust analytics system that tracks user behavior throughout the application, with a focus on legal document analysis interactions and user journey optimization.

## Key Features

### 1. User Identification

- **Early Identification**: Users are identified as soon as they're loaded in the app
- **Comprehensive User Properties**: Tracks email, name, creation date, and last sign-in
- **Automatic Updates**: User properties are updated whenever user data changes

### 2. Page View Tracking

- **All Major Pages**: Landing page, sign-in, sign-up, dashboard, companies, conversations
- **Contextual Properties**: Includes relevant context like company slugs, conversation IDs
- **Performance Metrics**: Tracks page load times and performance

### 3. User Journey Tracking

- **Onboarding Flow**: Tracks onboarding start and completion
- **Authentication Events**: Sign-in, sign-up, and sign-out events
- **Feature Usage**: Tracks which features users interact with

### 4. Legal Document Analysis Tracking

- **Question Analysis**: Tracks questions asked to the LLM with categorization
- **Response Metrics**: Response times, answer lengths, success/failure rates
- **Document Uploads**: File types, sizes, success/failure tracking
- **Company Interactions**: Company views, searches, and analysis sessions

## Implementation Details

### Analytics Utility (`lib/analytics.ts`)

The main analytics utility provides:

```typescript
// User identification
identifyUser(user: any)

// Page view tracking
trackPageView(pageName: string, properties?: Record<string, any>)

// User journey tracking
trackUserJourney.onboardingStarted()
trackUserJourney.signIn(method: string)
trackUserJourney.companyViewed(companySlug: string, companyName: string)
trackUserJourney.questionAsked(question: string, questionLength: number, ...)
trackUserJourney.documentUploadCompleted(fileType: string, fileSize: number, companyName: string)

// Session tracking
trackSession.started()
trackSession.ended(duration: number)

// Performance tracking
trackPerformance.pageLoad(pageName: string, loadTime: number)
trackPerformance.apiCall(endpoint: string, responseTime: number, success: boolean)
```

### Analytics Hook (`hooks/useAnalytics.ts`)

Provides easy access to analytics functions throughout the app:

```typescript
const { trackPageView, trackUserJourney, user, isLoaded } = useAnalytics()
```

### Question Categorization

The system automatically categorizes user questions into legal domains:

- **privacy_policy**: Questions about privacy and data collection
- **terms_of_service**: Questions about terms and liability
- **compliance**: GDPR, CCPA, and regulatory questions
- **data_rights**: Data deletion and opt-out questions
- **data_sharing**: Third-party sharing questions
- **security**: Security and breach-related questions
- **general**: Other legal questions

## Tracked Events

### Authentication Events

- `user_signed_in` - User successfully signs in
- `user_signed_up` - User creates new account
- `user_signed_out` - User signs out

### Onboarding Events

- `onboarding_started` - User begins onboarding
- `onboarding_completed` - User completes onboarding

### Page View Events

- `page_viewed` - User views any page
- `landing_page` - User visits landing page
- `sign_in_page` - User visits sign-in page
- `sign_up_page` - User visits sign-up page
- `dashboard` - User visits dashboard
- `companies` - User visits companies page
- `company_analysis` - User views company analysis
- `conversation` - User views conversation

### Company Interaction Events

- `company_viewed` - User views a specific company
- `company_searched` - User searches for companies

### Document Upload Events

- `document_upload_started` - User starts uploading document
- `document_upload_completed` - Document upload succeeds
- `document_upload_failed` - Document upload fails

### Conversation Events

- `conversation_started` - User starts or views conversation

### Question Events

- `question_asked` - User asks a question to the LLM
- `question_answered` - LLM successfully answers question
- `question_failed` - LLM fails to answer question

### Feature Usage Events

- `feature_used` - User uses a specific feature
- `get_started_clicked` - User clicks "Get Started" button

### Session Events

- `session_started` - User session begins
- `session_ended` - User session ends

### Performance Events

- `page_load_time` - Page load performance
- `api_call` - API call performance

### Error Events

- `error_occurred` - Application errors

## Privacy Considerations

### Data Protection

- **No PII in Questions**: Full questions are not captured, only metadata
- **Question Categorization**: Questions are categorized without storing content
- **Legal Terms Detection**: Only detects presence of legal terms, not content
- **User Consent**: Analytics respect user privacy preferences

### Question Tracking Privacy

```typescript
// What we track:
{
  question_length: 150,
  question_category: "privacy_policy",
  has_legal_terms: true,
  conversation_id: "conv_123",
  company_slug: "example-corp"
}

// What we DON'T track:
// - Full question content
// - Personal information in questions
// - Sensitive legal details
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

### PostHog Provider Setup

The PostHog provider is configured in `components/PostHogProvider.tsx` with:

- Exception tracking enabled
- Debug mode in development
- Session tracking
- Automatic user identification

## Usage Examples

### Basic Page Tracking

```typescript
const { trackPageView } = useAnalytics()

useEffect(() => {
  trackPageView("companies")
}, [trackPageView])
```

### Question Tracking

```typescript
const { trackUserJourney } = useAnalytics()

// Track when user asks a question
trackUserJourney.questionAsked(
  "What data does this company collect?",
  35,
  conversationId,
  companySlug,
)
```

### Document Upload Tracking

```typescript
const { trackUserJourney } = useAnalytics()

// Track successful upload
trackUserJourney.documentUploadCompleted(
  "application/pdf",
  1024000,
  "Example Corp",
)
```

### Feature Usage Tracking

```typescript
const { trackUserJourney } = useAnalytics()

// Track feature usage
trackUserJourney.featureUsed("document_comparison", {
  comparison_type: "privacy_policies",
  companies_count: 2,
})
```

## Analytics Dashboard

### Key Metrics to Monitor

1. **User Journey Funnel**
   - Landing page → Sign up → Onboarding → First analysis
   - Conversion rates at each step

2. **Question Analysis**
   - Most common question categories
   - Response time trends
   - Success/failure rates

3. **Document Uploads**
   - Upload success rates
   - File type distribution
   - Upload volume trends

4. **Company Interactions**
   - Most viewed companies
   - Search patterns
   - Analysis session duration

5. **Feature Adoption**
   - Feature usage rates
   - User engagement patterns
   - Conversion opportunities

### PostHog Insights

Use these insights to optimize the user experience:

- **Question Patterns**: Identify common legal concerns
- **Upload Issues**: Detect and fix upload problems
- **Performance**: Monitor response times and optimize
- **User Flow**: Understand how users navigate the app
- **Conversion**: Track free-to-paid conversion rates

## Best Practices

1. **Consistent Event Names**: Use snake_case for all event names
2. **Meaningful Properties**: Include relevant context with events
3. **Privacy First**: Never capture sensitive user data
4. **Performance**: Don't block UI for analytics calls
5. **Error Handling**: Track errors without exposing sensitive information

## Troubleshooting

### Common Issues

1. **Events Not Appearing**: Check PostHog key and network connectivity
2. **User Not Identified**: Ensure user is loaded before identification
3. **Duplicate Events**: Check for multiple useEffect calls
4. **Performance Impact**: Use debouncing for frequent events

### Debug Mode

Enable debug mode in development:

```typescript
debug: process.env.NODE_ENV === "development"
```

This will log all events to the console for debugging.
