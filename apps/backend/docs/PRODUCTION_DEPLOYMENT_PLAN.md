# Production Deployment Plan for Clausea Crawler (Railway Deployment)

## 🚀 Quick Start: Production Deployment

**For detailed step-by-step instructions, see:** [`PRODUCTION_DEPLOYMENT.md`](./PRODUCTION_DEPLOYMENT.md)

### Essential Steps:

1. **Set up MongoDB Atlas** (5 minutes)

   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create free cluster (M0 tier)
   - Create database user
   - Configure network access (allow 0.0.0.0/0 for Railway)
   - Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/clausea?retryWrites=true&w=majority`

2. **Deploy to Railway** (10 minutes)

   - Create project → Deploy from GitHub
   - Root directory: `apps/backend`
   - Add environment variables (especially `MONGO_URI`)
   - Deploy FastAPI service
   - Deploy Streamlit service (separate service)

3. **Verify Connection** (2 minutes)

   ```bash
   railway run uv run python -m src.dashboard.test_connection
   ```

4. **Test Production Crawler**
   - Access Streamlit dashboard URL
   - Trigger a crawl
   - Verify data in MongoDB Atlas

---

## Current Architecture Analysis

### Current State

- **Streamlit Dashboard**: Admin UI for managing companies, triggering crawls manually
- **FastAPI Backend**: REST API for frontend (Next.js)
- **Crawler**: Runs synchronously from Streamlit via threads/async loops
- **Database**: MongoDB with Motor (async MongoDB driver)
- **Deployment**: Currently runs locally, exposing real IP

### Issues to Address (Production Deployment)

1. ⚠️ **Production deployment setup** - **FOCUS**
2. ⚠️ **Production database connection (MongoDB Atlas)** - **FOCUS**
3. ⚠️ Synchronous execution blocks UI (acceptable for manual workflow)
4. ✅ **Logging and monitoring** - Structured logging (structlog), LLM usage tracking, file logging, Railway built-in monitoring
5. ✅ Authentication for Streamlit dashboard (password-based)

### Design Decision

**Keep manual Streamlit workflow** - Focus on production deployment to Railway with MongoDB Atlas.
**Local development**: Use VPN for IP protection (acceptable for development).

---

## Production Architecture Plan (Simplified for Manual Workflow)

### Target Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI API    │
│  (Port 8000)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Streamlit      │
│  Dashboard      │
│  (Port 8501)    │
│  [Manual]       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Crawler       │
│   (Same Process)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MongoDB       │
│  (Atlas/Cloud)  │
└─────────────────┘
```

**Key Points:**

- Streamlit runs on Railway (production)
- Crawler executes in same process (manual trigger)
- MongoDB Atlas for production database
- Railway handles infrastructure (no server management)

---

## Implementation Plan (Simplified for Manual Workflow)

### Phase 1: Production Deployment Setup (Priority: HIGH)

#### 1.1 Railway Service Setup

**For FastAPI Service:**

1. Create new service in Railway
2. Connect to your GitHub repo
3. Set root directory: `apps/backend`
4. Railway will detect Dockerfile automatically
5. Set up MongoDB Atlas and configure `MONGO_URI`

**For Streamlit Service (Separate Service - Best Practice):**

1. Create second service in Railway (separate from FastAPI)
2. Same repo, same root directory: `apps/backend`
3. Override start command: `uv run streamlit run src/dashboard/app.py --server.port=$PORT --server.address=0.0.0.0 --server.headless=true`
4. Share same `MONGO_URI` environment variable
5. Configure separate resource limits (Streamlit may need more memory for UI)

**Why Separate Services? (Best Practice)**

✅ **Separation of Concerns**

- API serves frontend users (high availability needed)
- Streamlit is admin tool (can have downtime)

✅ **Independent Scaling**

- Scale API based on user traffic
- Scale Streamlit based on admin usage (often lower)

✅ **Resource Optimization**

- API: Lower memory footprint, optimized for requests
- Streamlit: Higher memory for UI rendering, can scale down when idle

✅ **Independent Deployment**

- Deploy API updates without affecting Streamlit
- Deploy Streamlit updates without affecting API
- Different deployment schedules

✅ **Better Isolation**

- If Streamlit crashes, API keeps serving users
- If API crashes, Streamlit can still be used for debugging
- Easier to debug issues

✅ **Security & Access Control**

- Different authentication requirements
- Can restrict Streamlit to VPN/internal network
- API exposed publicly, Streamlit can be private

✅ **Cost Optimization**

- Scale down Streamlit when not in use (saves money)
- API needs to stay up 24/7, Streamlit can sleep

#### 1.2 Streamlit Authentication ✅ **COMPLETED**

**File:** `apps/backend/src/dashboard/auth.py`

**Implementation:** Password-based authentication with SHA-256 hashing.

**Features:**

- ✅ Environment variable support (`STREAMLIT_DASHBOARD_PASSWORD`)
- ✅ Streamlit secrets fallback (for local development)
- ✅ Session-based authentication (persists during session)
- ✅ Logout functionality
- ✅ Development mode (allows access if no password is set)
- ✅ Secure password hashing

**Usage:**

1. Set `STREAMLIT_DASHBOARD_PASSWORD` environment variable in Railway
2. Dashboard will show login form on first access
3. User enters password to access dashboard
4. Logout button available in sidebar

**Security:**

- Passwords are hashed using SHA-256 before comparison
- No password stored in session state
- Logs failed login attempts

---

### Phase 2: VPS Deployment (Priority: HIGH)

---

#### 2.1 VPS Setup

1. **Choose VPS Provider**: DigitalOcean, AWS EC2, Linode, etc.
2. **Minimum Specs**: 2GB RAM, 1 CPU, 20GB storage
3. **OS**: Ubuntu 22.04 LTS

#### 2.2 Server Configuration

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Install Docker Compose
sudo apt install docker-compose-plugin -y

# 4. Add user to docker group
sudo usermod -aG docker $USER

# 5. Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (if using reverse proxy)
sudo ufw allow 443/tcp   # HTTPS (if using reverse proxy)
sudo ufw allow 8000/tcp  # FastAPI (or use reverse proxy)
sudo ufw allow 8501/tcp  # Streamlit (or use reverse proxy)
sudo ufw enable
```

#### 2.3 Deployment Scripts

**File:** `apps/backend/scripts/deploy.sh`

```bash
#!/bin/bash
# Production deployment script

# 1. Pull latest code
git pull origin main

# 2. Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Run migrations
docker-compose -f docker-compose.prod.yml exec api uv run alembic upgrade head

# 4. Health check
curl http://localhost:8000/health
```

---

### Phase 3: Security & Access Control (Priority: MEDIUM)

#### 4.1 Structured Logging ✅ **COMPLETED**

**Current Implementation:**

- ✅ Structured logging with structlog (JSON in production, console in dev)
- ✅ LLM usage tracking with detailed token/cost metrics
- ✅ File logging for crawler sessions (async, fire-and-forget)
- ✅ Comprehensive logging throughout application (crawler, API, dashboard)
- ✅ Railway built-in log aggregation and monitoring

**Optional Enhancements:**

- [ ] Custom metrics service for business KPIs (crawl success rates, document counts, etc.)
- [ ] External log aggregation (Datadog, LogRocket, etc.) for advanced analytics
- [ ] Alert system for error thresholds

#### 4.2 Metrics Collection (Optional Enhancement)

**File:** `apps/backend/src/services/metrics_service.py` (not yet implemented)

```python
# Track:
# - Crawl jobs started/completed/failed
# - Documents discovered per crawl
# - Average crawl duration
# - Error rates
# - IP addresses used (for monitoring)
```

**Note:** Railway provides basic metrics (CPU, memory, requests). Custom metrics service is optional for advanced analytics.

#### 4.3 Health Checks

**Current:** Basic `/health` endpoint exists

**Optional Enhancements:**

- Enhanced `/health` endpoint with:
  - Database connection status
  - LLM API connectivity
  - Disk space checks
  - Memory usage

---

### Phase 4: Monitoring & Logging (Priority: LOW - Mostly Complete)

#### 5.1 Retry Logic

- Automatic retry for transient failures
- Exponential backoff
- Max retry attempts (3-5)

#### 5.2 Graceful Shutdown

- Handle SIGTERM in workers
- Complete current crawl before shutdown
- Save progress state

#### 5.3 Error Recovery

- Store failed crawl state
- Manual retry endpoint
- Error notification system

---

### Phase 5: Optional Improvements (Priority: LOW)

#### 6.1 IP Protection

- Deploy to VPS (DigitalOcean, AWS, etc.)
- Use server IP instead of personal IP
- Configure firewall rules

#### 6.2 Rate Limiting

- API rate limiting (FastAPI-limiter)
- Per-user crawl limits
- Per-company crawl cooldown

#### 6.3 Input Validation

- Validate company slugs
- Sanitize crawl URLs
- Prevent malicious input

---

## Migration Strategy (Manual Workflow)

### Step 1: Deploy to VPS

- Set up server and Docker
- Deploy Streamlit + API + Database
- Test manual crawl from server

### Step 2: Secure Access

- Add Streamlit password protection
- Configure firewall rules
- Set up SSL/HTTPS (optional but recommended)

### Step 3: Monitor & Optimize

- Monitor logs and performance
- Optimize crawler settings
- Add better error handling

### Future: When Ready for Automation

- Can add Celery + Redis later
- Keep Streamlit as admin interface
- Add API endpoints for automation

---

## Deployment Checklist

### Pre-Deployment

- [ ] Set up VPS/server (DigitalOcean, AWS EC2, etc.)
- [ ] Configure domain/DNS if needed
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure firewall (only expose 80, 443, 8000)
- [ ] Set up environment variables
- [ ] Configure database backups

### Deployment

- [ ] Clone repository on server
- [ ] Set up Docker and Docker Compose
- [ ] Configure `.env` file with production secrets
- [ ] Run `docker-compose.prod.yml up -d`
- [ ] Run database migrations
- [ ] Verify health checks
- [ ] Test crawl endpoint

### Post-Deployment

- [ ] Monitor logs for errors
- [ ] Set up log aggregation (optional)
- [ ] Configure alerts (optional)
- [ ] Test crawl from production
- [ ] Verify IP is server IP (not personal)
- [ ] Document deployment process

---

## Environment Variables

### Required for Production

```bash
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/clausea?retryWrites=true&w=majority
MONGODB_DATABASE=clausea

# Redis
REDIS_URL=redis://redis:6379/0

# API
API_KEY=your-secret-api-key
CORS_ORIGINS=https://www.clausea.co,https://clausea.co

# LLM APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Proxy (if needed)
CRAWLER_PROXY=http://proxy:port  # Leave empty to use server IP
```

---

## Cost Estimation

### Railway Pricing

- **Hobby Plan**: $5/month + usage
  - $0.000463/GB RAM per hour
  - $0.000231/GB storage per hour
  - $0.000231/GB egress per hour
- **Pro Plan**: $20/month + usage (better pricing)
- **MongoDB Atlas**: Free tier available (512MB storage)
- **SSL/HTTPS**: Free (automatic)
- **Custom Domain**: Free

### Estimated Monthly Cost

- **Small deployment** (512MB RAM, minimal usage): ~$10-15/month
- **Medium deployment** (1GB RAM, moderate usage): ~$20-30/month
- **Large deployment** (2GB+ RAM, high usage): ~$40-60/month

**Note**: Railway has a free $5 credit monthly, so small deployments can be very affordable.

---

## Next Steps (Railway Deployment)

1. **Immediate**: Sign up for Railway account
2. **Day 1**: Create project, set up MongoDB Atlas, deploy FastAPI
3. **Day 2**: Deploy Streamlit service (or combine with API)
4. **Day 3**: Configure environment variables, test crawler
5. **Day 4**: Add authentication, set up custom domain (optional)
6. **Week 2**: Monitor usage, optimize costs

## Railway-Specific Benefits

✅ **No server management** - Railway handles infrastructure
✅ **Automatic HTTPS** - SSL certificates included
✅ **Easy scaling** - Adjust resources in dashboard
✅ **MongoDB Atlas** - Easy integration with managed MongoDB
✅ **GitHub integration** - Auto-deploy on push
✅ **Environment variables** - Easy management in dashboard
✅ **Logs & monitoring** - Built-in in Railway dashboard
✅ **IP protection** - Runs on Railway's infrastructure

## Quick Start Deployment (Railway)

### Step 1: Set Up Railway Project

1. **Sign up/Login**: https://railway.app
2. **Create New Project**: Click "New Project"
3. **Deploy from GitHub**: Connect your repository
4. **Select Repository**: Choose your `clausea` repo

### Step 2: Set Up MongoDB Atlas (Production Database)

**See detailed instructions in:** [`PRODUCTION_DEPLOYMENT.md`](./PRODUCTION_DEPLOYMENT.md#step-1-set-up-mongodb-atlas-production-database)

**Quick Summary:**

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Create database user (save credentials!)
4. Configure network access: Allow 0.0.0.0/0 (or Railway IPs)
5. Get connection string and add to Railway as `MONGO_URI`

**Connection String Format:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/clausea?retryWrites=true&w=majority
```

**Important:** Replace `<username>` and `<password>` with actual credentials, and include `/clausea` before the `?`

### Step 3: Deploy FastAPI Service

1. Click **"+ New"** → **"GitHub Repo"** → Select your repo
2. **Root Directory**: Set to `apps/backend`
3. **Build Command**: Railway auto-detects Dockerfile
4. **Start Command**: `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Healthcheck Path**: `/health`

### Step 4: Configure Environment Variables

In Railway dashboard, add these variables:

```bash
# Database (MongoDB Atlas connection string)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/clausea?retryWrites=true&w=majority
MONGODB_DATABASE=clausea

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
API_KEY=your-secret-api-key

# CORS
CORS_ORIGINS=https://www.clausea.co,https://clausea.co

# Optional: Streamlit config
STREAMLIT_SERVER_PORT=$PORT
STREAMLIT_SERVER_HEADLESS=true
```

### Step 5: Deploy Streamlit Service (Separate Service - Recommended)

**Best Practice: Separate Services**

1. Create another service from same repo
2. Root directory: `apps/backend`
3. Start command: `uv run streamlit run src/dashboard/app.py --server.port=$PORT --server.address=0.0.0.0 --server.headless=true`
4. Share same environment variables (especially `MONGO_URI`)
5. Configure resource limits (Streamlit may need 512MB-1GB RAM)

**Benefits of Separate Services:**

- ✅ Independent scaling and resource allocation
- ✅ Deploy updates independently
- ✅ Better isolation and fault tolerance
- ✅ Cost optimization (scale down when not in use)
- ✅ Different security/access controls

**Note:** While you _could_ run both in one service, separate services is the production best practice for maintainability and scalability.

### Step 6: Verify Production Database Connection

**See detailed troubleshooting in:** [`PRODUCTION_DEPLOYMENT.md`](./PRODUCTION_DEPLOYMENT.md#step-3-verify-production-database-connection)

**Quick Test:**

```bash
# Install Railway CLI (if not already installed)
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Test MongoDB Atlas connection
railway run uv run python -m src.dashboard.test_connection
```

**Expected Output:**

```
✅ MongoDB connection successful
✅ Found X companies in database
✅ Found Y documents in database
✅ All tests passed!
```

**Or verify via Streamlit:**

- Access Streamlit dashboard URL
- Navigate to "View Companies"
- If companies load, database connection is working ✅

**Note**: MongoDB doesn't require migrations. Your Pydantic models define the schema automatically.

### Step 7: Access Your Services

- **FastAPI**: Railway provides a public URL (e.g., `https://your-api.railway.app`)
- **Streamlit**: Railway provides a public URL (e.g., `https://your-streamlit.railway.app`)

### Railway CLI Commands (Optional)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run commands
railway run uv run python -m src.crawling

# Open dashboard
railway open
```

---

## References

- [Docker Compose Production](https://docs.docker.com/compose/production/)
- [DigitalOcean Deployment Guide](https://www.digitalocean.com/community/tutorials)
- [Streamlit Authentication](https://docs.streamlit.io/knowledge-base/deploy/authentication-without-sso)
- [Ubuntu Server Setup](https://ubuntu.com/server/docs)
