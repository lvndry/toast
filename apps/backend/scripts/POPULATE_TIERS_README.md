# Company Tier Visibility Population Script

This script provides a comprehensive solution for populating the `visible_to_tiers` field for companies in the Toast AI database. It supports multiple strategies for setting tier visibility based on business requirements.

## Overview

The `visible_to_tiers` field determines which user tiers can access specific companies. This is used for:

- Freemium model: Free users see basic companies, paid users see premium companies
- Enterprise features: Enterprise-only companies for high-value customers
- Compliance: Sensitive companies only visible to verified business users

## Available Strategies

### 1. All Tiers (`--strategy all`)

Sets all companies to be visible to all user tiers (FREE, BUSINESS, ENTERPRISE).

```bash
python populate_company_tiers.py --strategy all
```

### 2. Category-Based (`--strategy category`)

Sets companies with specific categories to a minimum tier.

```bash
# Set all fintech companies to require business tier or higher
python populate_company_tiers.py --strategy category --tier business --categories "fintech,saas,enterprise"
```

### 3. Domain-Based (`--strategy domain`)

Sets companies with specific domains to a minimum tier.

```bash
# Set all banking domains to require enterprise tier
python populate_company_tiers.py --strategy domain --tier enterprise --domains "banking,healthcare,government"
```

### 4. Specific Company (`--strategy specific`)

Sets a specific company to specific tiers.

```bash
# Set company-123 to be accessible to free and business tiers only
python populate_company_tiers.py --strategy specific --company-id "company-123" --tiers "free,business"
```

### 5. Configuration File (`--strategy config`)

Uses a JSON configuration file to apply multiple rules.

```bash
python populate_company_tiers.py --strategy config --config-file tier_config.json
```

### 6. Default Visibility (`--strategy default`)

Ensures all companies have default visibility (all tiers) where missing.

```bash
python populate_company_tiers.py --strategy default
```

### 7. Show Current State (`--strategy show`)

Displays current tier visibility for all companies.

```bash
python populate_company_tiers.py --strategy show
```

## Configuration File Format

Create a JSON file with rules for complex tier assignments:

```json
{
  "description": "Company tier visibility configuration",
  "rules": [
    {
      "type": "category",
      "tier": "business",
      "categories": ["enterprise", "saas", "fintech"],
      "description": "Enterprise companies require business tier or higher"
    },
    {
      "type": "domain",
      "tier": "enterprise",
      "domains": ["banking", "healthcare"],
      "description": "Sensitive domains require enterprise tier"
    },
    {
      "type": "specific",
      "company_id": "premium-company-123",
      "tiers": ["business", "enterprise"],
      "description": "Premium company for business+ users only"
    }
  ]
}
```

## User Tiers

- **FREE**: Basic tier with limited access
- **BUSINESS**: Mid-tier with expanded company access
- **ENTERPRISE**: Premium tier with full access

## Common Use Cases

### Freemium Model Setup

```bash
# Make all companies free by default
python populate_company_tiers.py --strategy all

# Then restrict premium companies to business+ users
python populate_company_tiers.py --strategy category --tier business --categories "enterprise,saas"
```

### Enterprise-Only Companies

```bash
# Set sensitive companies to enterprise only
python populate_company_tiers.py --strategy domain --tier enterprise --domains "banking,healthcare,government"
```

### Gradual Rollout

```bash
# Start with all companies free
python populate_company_tiers.py --strategy all

# Move specific high-value companies to business tier
python populate_company_tiers.py --strategy specific --company-id "premium-company" --tiers "business,enterprise"
```

## Safety Features

- **Dry Run**: Use `--dry-run` to see what would be changed without making changes
- **Validation**: Script validates all inputs before making database changes
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Logging**: Detailed logging of all operations

## Examples

### Example 1: Basic Setup

```bash
# Show current state
python populate_company_tiers.py --strategy show

# Set all companies to be accessible to all tiers
python populate_company_tiers.py --strategy all

# Verify changes
python populate_company_tiers.py --strategy show
```

### Example 2: Business Model Implementation

```bash
# Set enterprise companies to business tier
python populate_company_tiers.py --strategy category --tier business --categories "enterprise,saas"

# Set fintech companies to business tier
python populate_company_tiers.py --strategy category --tier business --categories "fintech"

# Set banking companies to enterprise tier
python populate_company_tiers.py --strategy domain --tier enterprise --domains "banking,financial"
```

### Example 3: Configuration File Approach

```bash
# Create your configuration file
cp tier_config_example.json my_tier_config.json
# Edit my_tier_config.json with your specific rules

# Apply the configuration
python populate_company_tiers.py --strategy config --config-file my_tier_config.json
```

## Troubleshooting

### Common Issues

1. **"Company not found"**: Verify the company ID exists in the database
2. **"Invalid tier"**: Use only "free", "business", or "enterprise"
3. **"Configuration file not found"**: Check the file path is correct
4. **"Invalid JSON"**: Validate your configuration file JSON syntax

### Debugging

- Use `--strategy show` to see current state
- Check the script output for detailed error messages
- Verify database connection and permissions

## Integration with Existing Code

The script uses the existing `CompanyService` class, so it integrates seamlessly with the current codebase:

```python
from src.services.company_service import company_service
from src.user import UserTier

# The script uses these same classes and methods
companies = await company_service.get_companies_by_tier(UserTier.BUSINESS)
```

## Best Practices

1. **Start with show**: Always check current state before making changes
2. **Use dry run**: Test your configuration with `--dry-run` first
3. **Backup first**: Consider backing up your database before bulk changes
4. **Test incrementally**: Start with small changes and verify results
5. **Document changes**: Keep track of tier assignments for business reasons

## Monitoring

After running the script, monitor:

- User access patterns to ensure tier restrictions work as expected
- Business metrics to measure impact of tier changes
- User feedback on company availability

## Support

For issues or questions:

1. Check the script output for error messages
2. Verify your configuration file syntax
3. Test with `--strategy show` to understand current state
4. Use `--dry-run` to preview changes before applying them
