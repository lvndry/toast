use# Backend Scripts

This directory contains various utility scripts for managing the Toast AI backend database and services.

## Scripts

### Company Tier Management

#### `populate_company_tiers.py`

Comprehensive script for managing company tier visibility. Supports multiple strategies for setting which user tiers can access specific companies.

**Features:**

- Multiple population strategies (all, category-based, domain-based, specific companies)
- Configuration file support for complex rules
- Safety features (dry-run, validation, error handling)
- Current state inspection

**Usage:**

```bash
# Show current tier visibility
python scripts/populate_company_tiers.py --strategy show

# Set all companies to all tiers
python scripts/populate_company_tiers.py --strategy all

# Set fintech companies to business tier
python scripts/populate_company_tiers.py --strategy category --tier business --categories "fintech,saas"

# Use configuration file
python scripts/populate_company_tiers.py --strategy config --config-file tier_config.json
```

See `POPULATE_TIERS_README.md` for detailed documentation.

#### `test_tier_population.py`

Test script to verify tier population functionality and demonstrate usage.

**Usage:**

```bash
python scripts/test_tier_population.py
```

### Company Logo Management

#### `simple_logo_update.py` (Recommended)

A simple script that fetches logos by checking common paths on company domains. This script doesn't require any external API keys.

**Features:**

- Checks common logo paths on company domains (e.g., `/logo.png`, `/favicon.ico`)
- No external API dependencies
- Fast and reliable
- Handles errors gracefully

**Usage:**

```bash
cd apps/backend
python scripts/simple_logo_update.py
```

#### `update_company_logos.py` (Advanced)

A comprehensive script that uses multiple sources to find company logos.

**Features:**

- Clearbit Logo API (requires `CLEARBIT_API_KEY`)
- Google Custom Search API (requires `GOOGLE_API_KEY` and `GOOGLE_CSE_ID`)
- Domain-based logo detection
- Fallback mechanisms

**Required Environment Variables:**

```bash
# Optional - for Clearbit integration
CLEARBIT_API_KEY=your_clearbit_api_key

# Optional - for Google Custom Search
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id
```

**Usage:**

```bash
cd apps/backend
python scripts/update_company_logos.py
```

## How It Works

1. **Fetch Companies**: Both scripts fetch all companies from the database
2. **Logo Detection**:
   - Simple script: Checks common logo paths on company domains
   - Advanced script: Uses multiple APIs and fallback methods
3. **Database Update**: Updates the company record with the logo URL
4. **Logging**: Provides detailed logs of the process

## Logo Storage

Logos are stored as URLs in the `logo` field of the Company model:

```python
class Company(BaseModel):
    id: str
    name: str
    description: str | None = None
    slug: str
    domains: list[str] = []
    categories: list[str] = []
    crawl_base_urls: list[str] = []
    logo: str | None = None  # URL to the company logo
```

## Frontend Integration

The frontend automatically displays logos when they're available in the database:

1. **Direct Display**: If a company has a `logo` field, it's displayed directly
2. **Fallback**: If no logo is stored, the frontend shows the company's first letter
3. **API Endpoint**: `/api/companies/logos` provides fallback logo fetching

## Running the Scripts

### Prerequisites

1. Ensure the backend is running and connected to the database
2. Set up environment variables (for advanced script)
3. Install required dependencies:
   ```bash
   pip install aiohttp
   ```

### Execution

```bash
# Simple script (recommended)
python scripts/simple_logo_update.py

# Advanced script (requires API keys)
python scripts/update_company_logos.py
```

### Output

The scripts provide detailed logging:

```
2024-01-15 10:30:00 | INFO     | Connected to database successfully
2024-01-15 10:30:00 | INFO     | Found 150 companies to process
2024-01-15 10:30:01 | INFO     | Processing 1/150: Apple Inc
2024-01-15 10:30:01 | INFO     | Found logo at https://apple.com/logo.png
2024-01-15 10:30:01 | INFO     | Updated logo for Apple Inc: https://apple.com/logo.png
...
2024-01-15 10:35:00 | INFO     | Logo update process completed!
2024-01-15 10:35:00 | INFO     | Successfully updated: 45
2024-01-15 10:35:00 | INFO     | Errors: 5
2024-01-15 10:35:00 | INFO     | Skipped (already had logos): 100
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `MONGO_URI` is set correctly
2. **Rate Limiting**: The scripts include delays to avoid overwhelming servers
3. **API Keys**: For the advanced script, ensure API keys are valid
4. **Network Issues**: Some domains may be unreachable or block requests

### Logs

Logs are written to:

- Console output (INFO level)
- `logs/company_logos.log` (DEBUG level, for advanced script)

### Manual Logo Updates

You can also update logos manually via the API:

```bash
curl -X PUT "http://localhost:8000/toast/companies/{company_id}/logo" \
  -H "Content-Type: application/json" \
  -d '{"logo_url": "https://example.com/logo.png"}'
```

## Best Practices

1. **Run Regularly**: Update logos periodically as companies may change their logos
2. **Monitor Logs**: Check for errors and failed logo fetches
3. **Backup**: Consider backing up the database before running scripts
4. **Test**: Test scripts on a small subset of companies first
5. **Rate Limiting**: Respect rate limits of external APIs

## Future Improvements

- [ ] Add support for more logo sources
- [ ] Implement logo validation (check if URLs are still valid)
- [ ] Add support for logo uploads
- [ ] Create a web interface for logo management
- [ ] Add logo caching to improve performance
