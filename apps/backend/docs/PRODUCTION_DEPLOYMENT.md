# Production Deployment Guide - Railway + MongoDB Atlas

## Quick Start: Deploy to Production

### Step 1: Set Up MongoDB Atlas (Production Database)

1. **Sign up for MongoDB Atlas**

   - Go to https://www.mongodb.com/cloud/atlas
   - Create free account (or use existing)
   - Free tier: 512MB storage (perfect for getting started)

2. **Create a Cluster**

   - Click "Build a Database"
   - Choose **FREE** M0 tier
   - Select cloud provider and region (choose closest to your Railway region)
   - Cluster name: `clausea-production` (or any name)

3. **Create Database User**

   - Go to "Database Access" → "Add New Database User"
   - Username: `clausea-admin` (or your choice)
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Atlas admin" (or "Read and write to any database")

4. **Configure Network Access**

   - Go to "Network Access" → "Add IP Address"
   - For Railway: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Railway's IP ranges (more secure, but requires updating)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: "Python", Version: "3.11 or later"
   - Copy the connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Important**: Replace `<username>` and `<password>` with your actual credentials
   - Add database name: `...mongodb.net/clausea?retryWrites=true&w=majority`
   - Final format:
     ```
     mongodb+srv://clausea-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/clausea?retryWrites=true&w=majority
     ```

### Step 2: Deploy to Railway

1. **Create Railway Project**

   - Go to https://railway.app
   - Sign up/Login (GitHub OAuth recommended)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `clausea` repository

2. **Deploy FastAPI Service**

   - Click "+ New" → "GitHub Repo" → Select your repo
   - **Root Directory**: `apps/backend`
   - **Dockerfile**: Railway will auto-detect `Dockerfile` (or set to `Dockerfile` in settings)
   - Railway will auto-detect `railway.toml` for configuration
   - Service will start building automatically

3. **Configure Environment Variables**

   - Go to your service → "Variables" tab
   - Add these variables:

   ```bash
   # MongoDB Atlas Connection (CRITICAL)
   MONGO_URI=mongodb+srv://clausea-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/clausea?retryWrites=true&w=majority
   MONGODB_DATABASE=clausea

   # API Keys
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   API_KEY=your-secret-api-key

   # CORS (adjust to your frontend domain)
   CORS_ORIGINS=https://www.clausea.co,https://clausea.co

   # Optional: Other config
   ENV=production
   DEBUG=false
   ```

4. **Deploy Streamlit Service (Separate Service - Recommended)**

   **Why Separate Services?**

   - ✅ **Separation of concerns**: API and admin dashboard are different services
   - ✅ **Independent scaling**: Scale API and Streamlit separately based on usage
   - ✅ **Resource optimization**: API needs less memory, Streamlit needs more for UI
   - ✅ **Independent deployment**: Deploy API without affecting Streamlit
   - ✅ **Better isolation**: If one crashes, the other keeps running
   - ✅ **Security**: Can restrict Streamlit access separately
   - ✅ **Cost optimization**: Scale down Streamlit when not in use

   **Setup:**

   - Click "+ New" → "GitHub Repo" → Select same repo
   - **Root Directory**: `apps/backend`
   - **Dockerfile Path**: Set to `Dockerfile.streamlit` (in service settings)
   - **OR** use start command override if using default Dockerfile:
     ```
     uv run streamlit run src/dashboard/app.py --server.port=$PORT --server.address=0.0.0.0 --server.headless=true
     ```
   - **Environment Variables**: Share same variables (especially `MONGO_URI`), plus:
     ```bash
     # Streamlit Dashboard Authentication (REQUIRED for production)
     STREAMLIT_DASHBOARD_PASSWORD=your-secure-password-here
     ```
   - **Resource Allocation**: Can set different memory/CPU limits per service

   **Note:** `Dockerfile.streamlit` includes Playwright browser dependencies needed for the crawler.

   **Security:** The Streamlit dashboard requires password authentication. Set `STREAMLIT_DASHBOARD_PASSWORD` to a strong password. If not set, the dashboard will allow access (development mode only).

### Step 3: Verify Production Database Connection

**Using Railway CLI:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Test MongoDB connection
railway run uv run python -m src.dashboard.test_connection
```

**Expected Output:**

```
🔗 Connecting to MongoDB...
✅ MongoDB connection successful
📊 Testing database operations...
✅ Found X companies in database
✅ Found Y documents in database
✅ All tests passed!
```

**Or via Streamlit Dashboard:**

- Access your Streamlit service URL
- Go to "View Companies" page
- If it loads companies, connection is working ✅

### Step 4: Test Production Crawler

1. **Access Streamlit Dashboard**

   - Go to your Streamlit service URL (Railway provides this)
   - Navigate to "Start Crawling"
   - Select a company
   - Click "Start Crawling"

2. **Monitor Logs**

   ```bash
   # View Streamlit service logs
   railway logs --service streamlit

   # View API service logs
   railway logs --service api
   ```

3. **Verify Data in MongoDB Atlas**
   - Go to MongoDB Atlas dashboard
   - Click "Browse Collections"
   - You should see `companies` and `documents` collections
   - Verify data is being stored

## Production Database Best Practices

### Security

1. **Database User Permissions**

   - Use least privilege: Create user with only necessary permissions
   - Don't use "Atlas admin" in production (use specific database permissions)

2. **Network Access**

   - Initially: Allow 0.0.0.0/0 for testing
   - Production: Restrict to Railway IP ranges (more secure)
   - Or use MongoDB Atlas VPC peering (advanced)

3. **Connection String Security**
   - Store `MONGO_URI` in Railway Variables (encrypted)
   - Never commit connection strings to git
   - Rotate passwords regularly

### Monitoring

1. **MongoDB Atlas Monitoring**

   - Free tier includes basic monitoring
   - Check "Metrics" tab for:
     - Connection count
     - Read/write operations
     - Storage usage
     - Performance metrics

2. **Set Up Alerts**
   - Go to "Alerts" in MongoDB Atlas
   - Set up alerts for:
     - High connection count
     - Storage approaching limit
     - Slow queries

### Backup

1. **MongoDB Atlas Backups**

   - Free tier: Point-in-time backups (limited)
   - Paid tiers: Continuous backups
   - Configure backup schedule in "Backups" tab

2. **Manual Backups**
   ```bash
   # Export data (using Railway CLI)
   railway run uv run python -c "
   from motor.motor_asyncio import AsyncIOMotorClient
   import asyncio
   async def export():
       client = AsyncIOMotorClient('$MONGO_URI')
       # Export logic here
   asyncio.run(export())
   "
   ```

## Troubleshooting Production Database Connection

### Issue: Connection Timeout

**Symptoms:**

- `ServerSelectionTimeoutError`
- Connection fails in Railway logs

**Solutions:**

1. Check MongoDB Atlas Network Access:
   - Ensure 0.0.0.0/0 is allowed (or Railway IPs)
2. Verify connection string:
   - Check username/password are correct
   - Ensure database name is in connection string
3. Check Railway logs:
   ```bash
   railway logs --service api
   ```

### Issue: Authentication Failed

**Symptoms:**

- `Authentication failed` error
- `Invalid credentials`

**Solutions:**

1. Verify database user exists in MongoDB Atlas
2. Check password is correct (no special characters need URL encoding)
3. Test connection string locally first:
   ```bash
   MONGO_URI="your-connection-string" uv run python -m src.dashboard.test_connection
   ```

### Issue: Database Not Found

**Symptoms:**

- Connection succeeds but collections are empty
- "Database does not exist" errors

**Solutions:**

1. MongoDB creates databases automatically on first write
2. Ensure `MONGODB_DATABASE=clausea` matches your connection string
3. Check your code uses the correct database name:
   ```python
   # In src/core/database.py
   DATABASE_NAME = "clausea"  # Should match MONGODB_DATABASE
   ```

### Issue: Slow Queries

**Symptoms:**

- Crawler is slow
- Streamlit dashboard loads slowly

**Solutions:**

1. Add indexes in MongoDB Atlas:
   - Go to "Collections" → "Indexes"
   - Add indexes for frequently queried fields:
     - `companies.slug` (unique)
     - `documents.company_id`
     - `documents.url` (unique)
2. Check query patterns in MongoDB Atlas "Performance Advisor"

## Environment Variables Checklist

**FastAPI Service:**

- [ ] `MONGO_URI` - MongoDB Atlas connection string
- [ ] `MONGODB_DATABASE` - Database name (usually `clausea`)
- [ ] `OPENAI_API_KEY` - For LLM features
- [ ] `ANTHROPIC_API_KEY` - For LLM features
- [ ] `API_KEY` - Service API key for authentication
- [ ] `CORS_ORIGINS` - Your frontend domains
- [ ] `ENV=production` - Environment flag
- [ ] `DEBUG=false` - Disable debug mode

**Streamlit Service (Additional):**

- [ ] `STREAMLIT_DASHBOARD_PASSWORD` - **REQUIRED** - Password for dashboard access (use strong password)
- [ ] All FastAPI variables (especially `MONGO_URI`)

## Production URLs

After deployment, Railway provides:

- **FastAPI**: `https://your-api-service.railway.app`
- **Streamlit**: `https://your-streamlit-service.railway.app`

You can also set up custom domains in Railway dashboard.

## Service Architecture

**Best Practice: Separate Services** ✅

Deploy FastAPI and Streamlit as **separate services** in Railway. This is the production best practice.

**See detailed explanation:** [`SERVICE_ARCHITECTURE.md`](./SERVICE_ARCHITECTURE.md)

**Quick Benefits:**

- ✅ Independent scaling
- ✅ Independent deployment
- ✅ Better fault tolerance
- ✅ Cost optimization
- ✅ Better security isolation

## Next Steps

1. ✅ Deploy FastAPI to Railway
2. ✅ Deploy Streamlit to Railway (separate service)
3. ✅ Connect to MongoDB Atlas
4. ✅ Add Streamlit authentication
5. ⏭️ Test crawler in production
6. ⏭️ Set up custom domain
7. ⏭️ Configure monitoring and alerts

## Support

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
