# 🚀 Deployment Guide - Yamini Infotech

This guide covers deploying the application to **free-tier** cloud services:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (FastAPI)
- **Database**: Neon or Supabase (PostgreSQL)

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All hardcoded localhost URLs are removed (uses `import.meta.env.VITE_API_URL`)
- [ ] `.env` files are NOT committed to Git
- [ ] `requirements.txt` exists in `/backend`
- [ ] `package.json` exists in `/frontend`
- [ ] `.gitignore` includes all sensitive files

---

## 🗄️ Step 1: Database Setup (Neon or Supabase)

### Option A: Neon (Recommended - Generous Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string:
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this for the backend deployment

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings** → **Database** → **Connection string** → **URI**
4. Copy the connection string:
   ```
   postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
   ```

---

## ⚡ Step 2: Backend Deployment (Render)

### 2.1 Prepare Repository

Ensure your repository structure:
```
your-repo/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   └── ...
└── render.yaml (optional)
```

### 2.2 Deploy to Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | yamini-infotech-api |
   | **Region** | Oregon (or closest) |
   | **Branch** | main |
   | **Root Directory** | backend |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | **Plan** | Free |

5. Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon/Supabase connection string |
   | `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
   | `CORS_ORIGINS` | (Leave empty for now, add Vercel URL after frontend deploy) |
   | `CORS_ALLOW_ALL` | `true` (temporarily, for testing) |

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. Note your backend URL: `https://yamini-infotech-api.onrender.com`

### 2.3 Verify Backend

Visit:
- `https://your-backend.onrender.com/` - Should show API info
- `https://your-backend.onrender.com/docs` - Swagger documentation
- `https://your-backend.onrender.com/api/health` - Health check

---

## 🌐 Step 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | frontend |
   | **Build Command** | `npm run build` |
   | **Output Directory** | dist |
   | **Install Command** | `npm install` |

5. Add Environment Variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com` |

6. Click **Deploy**
7. Wait for deployment (2-3 minutes)
8. Note your frontend URL: `https://yamini-infotech.vercel.app`

### 3.2 Update Backend CORS

Go back to Render dashboard and update:

| Key | Value |
|-----|-------|
| `CORS_ORIGINS` | `https://yamini-infotech.vercel.app` |
| `CORS_ALLOW_ALL` | `false` |

Redeploy the backend for changes to take effect.

---

## ✅ Step 4: Verify Deployment

### Test the Full Stack

1. Open your Vercel frontend URL
2. Try logging in with demo credentials:
   - Username: `admin`
   - Password: `admin123`
3. Verify API calls work (check browser Network tab)

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure `CORS_ORIGINS` includes your Vercel URL |
| Database connection fails | Check `DATABASE_URL` format and SSL settings |
| API not responding | Check Render logs for errors |
| Frontend shows blank | Check browser console for errors |

---

## 🔧 Step 5: Initialize Database

After first deployment, you may need to seed the database:

### Option 1: Via API (if init endpoint exists)
```bash
curl -X POST https://your-backend.onrender.com/api/init-db
```

### Option 2: Via Render Shell

1. Go to Render dashboard → Your service → **Shell**
2. Run:
   ```bash
   python init_db.py
   ```

---

## 📊 Monitoring & Logs

### Render (Backend)
- Dashboard → Your service → **Logs**
- Real-time log streaming available

### Vercel (Frontend)
- Dashboard → Your project → **Deployments** → **Functions** (if any)
- Runtime logs available

---

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

- **Push to main** → Auto-deploy triggers
- **Pull Request** → Preview deployments created

---

## 💰 Free Tier Limits

### Render (Free)
- 750 hours/month (enough for 1 service)
- Sleeps after 15 minutes of inactivity
- Spins up on first request (30-60 second cold start)

### Vercel (Free/Hobby)
- 100GB bandwidth/month
- Unlimited static deployments
- Serverless function limits apply

### Neon (Free)
- 3GB storage
- 1 compute endpoint
- Auto-suspend after 5 minutes

### Supabase (Free)
- 500MB database
- 2GB bandwidth
- 50,000 monthly active users

---

## 🚨 Production Considerations

Before going live:

1. **Change all default passwords**
2. **Set strong `SECRET_KEY`**
3. **Restrict CORS origins**
4. **Enable database SSL**
5. **Set up database backups**
6. **Monitor for errors**

---

## 📞 Support

If you encounter issues:
1. Check Render/Vercel logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for frontend errors

---

**Happy Deploying! 🎉**
