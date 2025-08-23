# Database Migration Guide

This guide explains how to use the migration functionality to transfer data from your local MongoDB database to production.

## Overview

The migration system allows you to:
- View a summary of data in both local and production databases
- Perform dry runs to see what would be migrated
- Execute actual migrations with safety checks
- Migrate specific data types (companies, documents, meta summaries)

## Prerequisites

1. **Environment Variables**: Make sure you have both database URIs configured:
   - `MONGO_URI`: Your local MongoDB connection string
   - `PRODUCTION_MONGO_URI`: Your production MongoDB connection string

2. **Streamlit Secrets (Optional)**: For convenience, you can create a secrets file:
   ```bash
   # Create the .streamlit directory
   mkdir -p .streamlit

   # Copy the template and edit it
   cp .streamlit/secrets.toml .streamlit/secrets.toml
   ```

   Then edit `.streamlit/secrets.toml` with your database URIs:
   ```toml
   MONGO_URI = "mongodb://localhost:27017/toast"
   PRODUCTION_MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/toast"
   API_BASE_URL = "http://localhost:8000"
   ```

3. **API Server**: Ensure the Toast API server is running (default: http://localhost:8000)

4. **Dependencies**: Install the required dependencies:
   ```bash
   uv sync
   ```

## Running the Migration Dashboard

1. **Start the Streamlit Dashboard**:
   ```bash
   python run_dashboard.py
   ```
   Or directly with Streamlit:
   ```bash
   streamlit run src/dashboard/app.py
   ```

2. **Navigate to Migration**: In the dashboard sidebar, select "Migration"

## Using the Migration Interface

### 1. Configuration
- **Local Database URI**: Your local MongoDB connection string
- **Production Database URI**: Your production MongoDB connection string
- **API Base URL**: The URL where your Toast API is running (default: http://localhost:8000)

**Note**: If you've set up the `.streamlit/secrets.toml` file, these fields will be pre-populated with your configuration. Otherwise, you'll need to enter them manually each time.

### 2. Migration Summary
Click "Get Migration Summary" to see:
- Number of companies, documents, and meta summaries in both databases
- Detailed breakdown of what data exists where

### 3. Dry Run
Before performing actual migrations, always run a dry run to:
- See what data would be migrated
- Identify any potential issues
- Verify the migration plan

Available dry run options:
- **All Data**: Complete migration simulation
- **Companies Only**: Only company data
- **Documents Only**: Only document data

### 4. Execute Migration
⚠️ **Warning**: This will actually modify your production database!

1. **Confirm**: Check the confirmation checkbox
2. **Choose Migration Type**:
   - **All Data**: Complete migration
   - **Companies Only**: Only company data
   - **Documents Only**: Only document data

## Migration Behavior

### Data Safety
- **Duplicate Prevention**: The system checks for existing records and skips duplicates
- **Error Handling**: Failed migrations are logged and reported
- **Dry Run Mode**: Always test with dry runs first

### What Gets Migrated
- **Companies**: Company information, domains, categories
- **Documents**: Document content, metadata, analysis
- **Meta Summaries**: Company-level document summaries

### Migration Process
1. **Connection**: Establishes connections to both databases
2. **Validation**: Checks data integrity
3. **Migration**: Transfers data with duplicate checking
4. **Reporting**: Provides detailed results and error logs

## API Endpoints

The migration system provides these REST API endpoints:

- `GET /toast/migration/summary` - Get migration summary
- `POST /toast/migration/dry-run` - Run dry run migration
- `POST /toast/migration/execute` - Execute actual migration
- `POST /toast/migration/migrate-companies` - Migrate companies only
- `POST /toast/migration/migrate-documents` - Migrate documents only
- `POST /toast/migration/migrate-meta-summaries` - Migrate meta summaries only

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify MongoDB URIs are correct
   - Check network connectivity
   - Ensure MongoDB instances are running

2. **Permission Errors**:
   - Verify database user permissions
   - Check if production database allows writes

3. **API Connection Issues**:
   - Ensure the Toast API server is running
   - Check the API Base URL configuration
   - Verify CORS settings if accessing from different domains

### Error Handling
- All errors are logged and displayed in the interface
- Failed migrations don't affect successfully migrated data
- Check the migration results for detailed error information

## Best Practices

1. **Always Backup**: Create a backup of your production database before migration
2. **Test First**: Always run dry runs before actual migrations
3. **Monitor**: Watch the migration progress and check results
4. **Verify**: After migration, verify data integrity in production
5. **Document**: Keep records of what was migrated and when

## Security Considerations

- Database URIs contain sensitive credentials - keep them secure
- Production database access should be restricted
- Consider using environment variables for sensitive configuration
- Monitor migration logs for any security-related issues

## Support

If you encounter issues:
1. Check the error logs in the migration interface
2. Verify your database connections
3. Ensure all prerequisites are met
4. Review the migration results for specific error details
