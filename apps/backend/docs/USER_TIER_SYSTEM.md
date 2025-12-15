# User Tier System

This document describes the user tier system implemented in Toast AI, which tracks user usage and enforces rate limits based on subscription tiers.

## Overview

The user tier system provides:

- **Tier-based rate limiting**: Different monthly request limits for each tier
- **Usage tracking**: Monthly counters for API requests
- **Upgrade functionality**: Users can upgrade their tier to get higher limits
- **Usage monitoring**: Users can check their current usage and limits

## User Tiers

| Tier       | Monthly Limit | Description                           |
| ---------- | ------------- | ------------------------------------- |
| FREE       | 5 requests    | Basic tier for new users              |
| BUSINESS   | 100 requests  | Small business tier                   |
| ENTERPRISE | 1000 requests | Enterprise tier for high-volume usage |

## Database Schema

### User Model Updates

The `User` model has been extended with:

```python
class User(BaseModel):
    id: str
    email: str
    first_name: str | None = None
    last_name: str | None = None
    tier: UserTier = UserTier.FREE  # NEW: User subscription tier
    onboarding_completed: bool = False
    monthly_usage: Dict[str, int] = Field(default_factory=dict)  # NEW: Monthly usage tracking
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

### Monthly Usage Format

The `monthly_usage` field stores usage data in the format:

```json
{
  "2024-01": 3, // 3 requests in January 2024
  "2024-02": 7, // 7 requests in February 2024
  "2024-03": 2 // 2 requests in March 2024
}
```

## API Endpoints

### Usage Tracking

#### GET `/users/usage`

Get current user's usage information and limits.

**Response:**

```json
{
  "user_id": "user_123",
  "tier": "free",
  "current_month": "2024-03",
  "usage": {
    "used": 3,
    "limit": 5,
    "remaining": 2,
    "percentage": 60.0
  },
  "monthly_history": {
    "2024-01": 3,
    "2024-02": 7,
    "2024-03": 3
  }
}
```

#### POST `/users/upgrade-tier`

Upgrade user's tier.

**Request:**

```json
{
  "tier": "business"
}
```

**Response:**

```json
{
  "success": true,
  "user_id": "user_123",
  "old_tier": "free",
  "new_tier": "business",
  "upgraded_at": "2024-03-15T10:30:00Z"
}
```

### Rate Limited Endpoints

#### GET `/companies/meta-summary/{company_slug}`

This endpoint now includes usage tracking and rate limiting.

**Rate Limit Response (429):**

```json
{
  "message": "Monthly usage limit exceeded",
  "usage": {
    "limit": 5,
    "used": 5,
    "remaining": 0,
    "tier": "free",
    "month": "2024-03"
  },
  "upgrade_message": "Upgrade to business tier for higher limits"
}
```

## Implementation Details

### Usage Service

The `UsageService` class handles all usage tracking and rate limiting:

```python
class UsageService:
    # Monthly limits per tier
    TIER_LIMITS = {
        UserTier.FREE: 5,
        UserTier.BUSINESS: 100,
        UserTier.ENTERPRISE: 1000,
    }

    @staticmethod
    async def increment_usage(user_id: str, endpoint: str = "meta_summary") -> bool
    @staticmethod
    async def check_usage_limit(user_id: str) -> tuple[bool, dict]
    @staticmethod
    async def get_usage_summary(user_id: str) -> dict
```

### Key Methods

- `increment_usage()`: Increments the monthly counter and checks limits
- `check_usage_limit()`: Checks if user has exceeded their monthly limit
- `get_usage_summary()`: Returns detailed usage information

## Migration

### Running the Migration

To migrate existing users to the new tier system:

```bash
# Run the standalone migration script
python migrate_users.py

# Or use the API endpoint (dry run first)
curl -X POST "http://localhost:8000/migration/migrate-users-to-tier-system" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true}'

# Then run the actual migration
curl -X POST "http://localhost:8000/migration/migrate-users-to-tier-system" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": false}'
```

### Migration Process

The migration:

1. Finds all users without `tier` or `monthly_usage` fields
2. Sets `tier` to `FREE` for existing users
3. Initializes `monthly_usage` as an empty dictionary
4. Updates the `updated_at` timestamp

## Usage Examples

### Frontend Integration

```javascript
// Check user usage
const usage = await fetch("/users/usage", {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// Show usage progress
const percentage = usage.usage.percentage;
const remaining = usage.usage.remaining;

// Upgrade tier
await fetch("/users/upgrade-tier", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ tier: "business" }),
});
```

### Error Handling

```javascript
// Handle rate limit errors
try {
  const response = await fetch("/companies/meta-summary/company-slug");
  const data = await response.json();
} catch (error) {
  if (error.status === 429) {
    // Show upgrade prompt with error.detail.usage information
    showUpgradePrompt(error.detail.usage);
  }
}
```

## Monitoring and Analytics

### Usage Metrics

Track these key metrics:

- **Monthly Active Users**: Users making requests each month
- **Tier Distribution**: Percentage of users in each tier
- **Upgrade Conversion**: Users upgrading from free to paid tiers
- **Rate Limit Hits**: How often users hit their limits

### Business Intelligence

The system provides data for:

- **Revenue optimization**: Understanding usage patterns
- **Feature development**: Identifying which tiers need higher limits
- **Customer success**: Proactive outreach to users near limits

## Security Considerations

- **Rate limiting**: Prevents abuse while allowing legitimate usage
- **User isolation**: Each user's usage is tracked independently
- **Graceful degradation**: System continues to work even if usage tracking fails
- **Audit trail**: All tier changes and usage increments are logged

## Future Enhancements

Potential improvements:

- **Daily limits**: Add daily request limits in addition to monthly
- **Endpoint-specific limits**: Different limits for different API endpoints
- **Usage analytics**: More detailed usage breakdowns
- **Automatic tier suggestions**: Recommend tier upgrades based on usage
- **Usage notifications**: Alert users when approaching limits
