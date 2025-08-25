# Streamlit Dashboard Setup

The Toast AI backend includes a Streamlit dashboard for database management, data migration, and system monitoring. This guide will help you set up and run the Streamlit dashboard.

## 📋 Prerequisites

Before running the Streamlit dashboard, ensure you have:

- **Python 3.11+** with [uv](https://docs.astral.sh/uv/getting-started/installation/)
- **MongoDB** running (local or cloud)
- **Toast AI backend** running (for API integration)
- **Environment variables** configured

## 🚀 Quick Start

### 1. Activate Virtual Environment

First, activate the Python virtual environment:

```bash
cd apps/backend

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# OR
.venv\Scripts\activate     # On Windows
```

### 2. Create Streamlit Secrets File

Create the Streamlit secrets configuration file:

```bash
# Create .streamlit directory if it doesn't exist
mkdir -p .streamlit

# Create secrets.toml file
touch .streamlit/secrets.toml
```

Edit `.streamlit/secrets.toml` with your database configuration:

```toml
# Streamlit Secrets Configuration
# Copy this file to .streamlit/secrets.toml and fill in your database URIs

# Local MongoDB connection string
MONGO_URI = "mongodb://localhost:27017/toast"

# Production MongoDB connection string
PRODUCTION_MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/toast"

# API Base URL (optional, defaults to localhost:8000)
API_BASE_URL = "http://localhost:8000"
```

**⚠️ Security Note:** Add `.streamlit/secrets.toml` to your `.gitignore` file to prevent sensitive credentials from being committed to version control.

### 3. Run Streamlit Dashboard

With your virtual environment activated, run the Streamlit dashboard:

```bash
# From apps/backend directory
streamlit run src/dashboard/app.py
```

The dashboard will be available at: **http://localhost:8501**

## 🔧 Configuration

### Environment Variables

The Streamlit dashboard uses the following environment variables:

| Variable               | Description                          | Default                           |
| ---------------------- | ------------------------------------ | --------------------------------- |
| `MONGO_URI`            | Local MongoDB connection string      | `mongodb://localhost:27017/toast` |
| `PRODUCTION_MONGO_URI` | Production MongoDB connection string | Required for migrations           |
| `API_BASE_URL`         | Toast AI API base URL                | `http://localhost:8000`           |

### Database Configuration

#### Local Development

```toml
MONGO_URI = "mongodb://localhost:27017/toast"
```

#### MongoDB Atlas (Cloud)

```toml
MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/toast?retryWrites=true&w=majority"
```

#### Production Database

```toml
PRODUCTION_MONGO_URI = "mongodb+srv://prod-username:prod-password@prod-cluster.mongodb.net/toast-prod"
```

## 📊 Dashboard Features

### Available Pages

1. **Database Migration**

   - Migrate data between local and production databases
   - View migration summaries and status
   - Execute bulk data operations

2. **Company Management**

   - Create and manage company profiles
   - View company data and analytics
   - Update company information

3. **Document Processing**

   - Monitor document processing status
   - View embedding generation progress
   - Manage document queues

4. **RAG System**

   - Configure and test RAG (Retrieval-Augmented Generation)
   - View vector database status
   - Test query responses

5. **System Monitoring**
   - View system health and performance
   - Monitor API endpoints
   - Check database connectivity

## 🛠️ Development

### Adding New Dashboard Pages

1. Create a new component in `src/dashboard/components/`
2. Import and register the component in `src/dashboard/app.py`
3. Add any required secrets to `.streamlit/secrets.toml`

### Example Component Structure

```python
# src/dashboard/components/example.py
import streamlit as st

def show_example():
    st.title("Example Dashboard Page")
    st.markdown("This is an example dashboard component.")

    # Access secrets
    api_url = st.secrets.get("API_BASE_URL", "http://localhost:8000")

    # Your dashboard logic here
    if st.button("Test Connection"):
        # API call logic
        pass
```

### Registering Components

```python
# src/dashboard/app.py
from .components import example

# Add to page selection
if page == "Example":
    example.show_example()
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Virtual Environment Not Activated

**Error:** `ModuleNotFoundError: No module named 'streamlit'`

**Solution:**

```bash
cd apps/backend
source .venv/bin/activate
pip install streamlit
```

#### 2. Secrets File Not Found

**Error:** `st.secrets.get()` returns None

**Solution:**

- Ensure `.streamlit/secrets.toml` exists
- Check file permissions
- Verify the secrets file is in the correct location

#### 3. Database Connection Failed

**Error:** MongoDB connection timeout

**Solution:**

- Verify MongoDB is running
- Check connection string format
- Ensure network connectivity for cloud databases

#### 4. API Connection Failed

**Error:** Cannot connect to Toast AI API

**Solution:**

- Ensure the backend API is running on `http://localhost:8000`
- Check `API_BASE_URL` in secrets.toml
- Verify API endpoints are accessible

### Debug Mode

Run Streamlit in debug mode for more detailed error information:

```bash
streamlit run src/dashboard/app.py --logger.level=debug
```

## 📚 Additional Resources

- [Streamlit Documentation](https://docs.streamlit.io/)
- [Streamlit Secrets Management](https://docs.streamlit.io/library/advanced-features/secrets-management)
- [Toast AI Backend Documentation](../README.md)
- [MongoDB Connection Guide](https://docs.mongodb.com/guides/server/drivers/)

## 🤝 Support

If you encounter issues with the Streamlit dashboard:

1. Check the troubleshooting section above
2. Review the Streamlit logs in the terminal
3. Verify your configuration in `.streamlit/secrets.toml`
4. Ensure all prerequisites are met

For additional support, contact the Toast AI team or create an issue in the repository.
