# Toast AI Dashboard

A Streamlit-based dashboard for managing Toast AI companies, documents, and operations.

## Features

- **Company Management**: Create, edit, and delete companies
- **Document Viewing**: View and manage company documents
- **Crawling**: Start web crawling for companies
- **Embeddings**: Generate embeddings for documents
- **Summarization**: Create document summaries
- **RAG Operations**: Manage RAG (Retrieval-Augmented Generation) operations
- **Migration Tools**: Database migration utilities

## Prerequisites

1. **Python Environment**: Make sure you have Python 3.8+ installed
2. **Dependencies**: Install required packages using `uv` or `pip`
3. **MongoDB**: Ensure your MongoDB instance is running and accessible
4. **Environment Variables**: Set up your `.env` file with required variables

## Installation

1. **Install dependencies**:

   ```bash
   cd apps/backend
   uv sync
   ```

2. **Set up environment variables**:
   Create a `.env` file in the `apps/backend` directory:

   ```env
   MONGO_URI=mongodb://localhost:27017/toast
   # or for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/toast
   ```

3. **Install Streamlit** (if not already installed):
   ```bash
   uv add streamlit
   ```

## Running the Dashboard

### Option 1: Using the provided script (Recommended)

```bash
cd apps/backend
python run_dashboard.py
```

This script will:

- Check environment variables
- Test database connectivity
- Start the Streamlit dashboard
- Provide helpful error messages if something goes wrong

### Option 2: Direct Streamlit command

```bash
cd apps/backend
streamlit run src/dashboard/app.py --server.port 8501
```

## Accessing the Dashboard

Once running, the dashboard will be available at:

- **Local**: http://localhost:8501
- **Network**: http://your-ip:8501

## Troubleshooting

### "Event loop is closed" Error

This error typically occurs when there are async/await conflicts. The dashboard has been updated to handle this properly, but if you still encounter issues:

1. **Restart the dashboard**: Stop and restart the Streamlit application
2. **Check database connection**: Run the connection test:
   ```bash
   python src/dashboard/test_connection.py
   ```
3. **Clear browser cache**: Clear your browser cache and refresh the page

### Database Connection Issues

1. **Test connection manually**:

   ```bash
   python src/dashboard/test_connection.py
   ```

2. **Check environment variables**:

   ```bash
   echo $MONGO_URI
   ```

3. **Verify MongoDB is running**:

   ```bash
   # For local MongoDB
   mongosh

   # For MongoDB Atlas, check your connection string
   ```

### "Failed to load companies from database"

1. **Check database connectivity**: Use the test script above
2. **Verify collections exist**: Make sure your MongoDB has the required collections
3. **Check permissions**: Ensure your MongoDB user has read/write permissions
4. **Network issues**: If using remote MongoDB, check firewall and network connectivity

## Dashboard Components

### Company Management

- **View Companies**: See all companies with search and filtering
- **Create Company**: Add new companies with domains and categories
- **Edit Company**: Modify existing company information
- **Delete Company**: Remove companies (with confirmation)

### Document Operations

- **View Documents**: Browse company documents
- **Upload Documents**: Add new documents to companies
- **Document Analysis**: View document analysis results

### Crawling

- **Start Crawling**: Begin web crawling for selected companies
- **Crawl Status**: Monitor crawling progress
- **Crawl Results**: View crawled data

### Embeddings

- **Generate Embeddings**: Create embeddings for documents
- **Embedding Status**: Check embedding generation progress

### Summarization

- **Create Summaries**: Generate document summaries
- **Summary Management**: View and manage existing summaries

### RAG Operations

- **RAG Setup**: Configure RAG systems
- **Query Testing**: Test RAG queries
- **Performance Monitoring**: Monitor RAG performance

## Development

### Adding New Components

1. Create a new component file in `src/dashboard/components/`
2. Import and add it to the main dashboard in `src/dashboard/app.py`
3. Update the navigation options

### Database Operations

All database operations use isolated connections to prevent event loop conflicts:

- Use `run_async_with_retry()` for async operations
- Database connections are automatically managed
- Proper error handling and retry logic included

### Styling

The dashboard uses Streamlit's built-in components with custom styling:

- Consistent color scheme
- Clear navigation
- Responsive layout
- Error states and loading indicators

## Security Notes

- The dashboard is designed for internal use
- Database credentials should be properly secured
- Consider using authentication for production deployments
- Monitor database access and usage

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the error messages in the dashboard
3. Test database connectivity using the provided test script
4. Check the logs for detailed error information
