# 🚀 Deployment Guide: Daily News Hub

This guide walks you step-by-step through pushing your project to Git/GitHub, deploying the **Backend API on Render**, and deploying the **Frontend Client on Vercel**.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Step 1: Git & `.gitignore` Configuration](#step-1-git--gitignore-configuration)
3. [Step 2: Push Repository to GitHub](#step-2-push-repository-to-github)
4. [Step 3: Deploy Backend on Render](#step-3-deploy-backend-on-render)
5. [Step 4: Deploy Frontend on Vercel](#step-4-deploy-frontend-on-vercel)
6. [Step 5: Final Cross-Connect (CORS & Environment Setup)](#step-5-final-cross-connect-cors--environment-setup)
7. [Testing & Post-Deployment Checklist](#-testing--post-deployment-checklist)
8. [Troubleshooting Common Issues](#-troubleshooting-common-issues)

---

## 🛠 Prerequisites

Make sure you have active accounts for:
- [GitHub](https://github.com/)
- [Render](https://render.com/)
- [Vercel](https://vercel.com/)

---

## Step 1: Git & `.gitignore` Configuration

The project is already pre-configured with a root `.gitignore` file that safely excludes sensitive `.env` files, `node_modules/`, build folders (`dist/`), local SQLite database files (`*.sqlite`), and uploaded newspaper PDFs/thumbnails.

### Verified `.gitignore` contents:
- `node_modules/`
- `.env` & `.env.*`
- `server/database/*.sqlite`
- `server/storage/newspapers/*` (except `.gitkeep`)
- `server/public/thumbnails/*` (except `.gitkeep`)
- `client/dist/`

---

## Step 2: Push Repository to GitHub

1. Open your terminal in the root directory of your project: `d:\Downloads\Newspaper app`
2. Initialize git and commit all files:

```bash
# Add all tracked files
git add .

# Commit changes
git commit -m "Initial commit - Daily News Hub application ready for deployment"
```

3. Go to [GitHub](https://github.com/new) and create a **New Repository** (e.g., `daily-news-hub`). Keep it **Public** or **Private**. Do *not* initialize with a README (as we already have code locally).

4. Link local repository to GitHub and push:

```bash
# Rename branch to main if needed
git branch -M main

# Add your GitHub remote URL
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/daily-news-hub.git

# Push to GitHub
git push -u origin main
```

---

## Step 3: Deploy Backend on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> Select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repository `daily-news-hub`.
4. Configure the Web Service parameters:
   - **Name**: `daily-news-hub-server` (or your choice)
   - **Region**: Choose the closest location (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: `server` *(Important: Specify `server` directory)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run seed`
   - **Start Command**: `node app.js`
   - **Instance Type**: `Free`

5. Scroll down to **Environment Variables** and add the following keys:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Environment mode |
   | `PORT` | `5000` | Server listening port |
   | `JWT_SECRET` | `your_super_secret_jwt_key_here_123!` | Secret for user sessions |
   | `CLIENT_URL` | `*` *(Update later with Vercel URL)* | CORS allowed origin |
   | `ADMIN_EMAIL` | `admin@dailynewshub.com` | Initial admin account email |
   | `ADMIN_PASSWORD` | `Admin@123456` | Initial admin account password |

6. Click **Create Web Service**.
7. Wait 2-3 minutes for the build process to complete.
8. Once live, copy your Render Service URL (e.g., `https://daily-news-hub-server.onrender.com`).

---

## Step 4: Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `daily-news-hub`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `client` *(Important: Specify `client` directory)*
   - **Build Command**: `npm run build` *(Auto-detected)*
   - **Output Directory**: `dist` *(Auto-detected)*

5. Expand **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://daily-news-hub-server.onrender.com` |

   *(Replace with your actual Render URL from Step 3 without a trailing slash)*

6. Click **Deploy**.
7. Wait 1 minute for Vercel to build and publish your app.
8. Copy your Vercel Production URL (e.g., `https://daily-news-hub-client.vercel.app`).

> **Note on Client Routing**: A `client/vercel.json` file has already been added to your project. This prevents 404 errors when reloading sub-pages like `/newspapers` or `/admin/dashboard`.

---

## Step 5: Final Cross-Connect (CORS & Environment Setup)

Now that both services are live, update Render's CORS settings to point specifically to your Vercel URL:

1. Open your [Render Dashboard](https://dashboard.render.com/) -> Select `daily-news-hub-server`.
2. Go to **Environment**.
3. Edit `CLIENT_URL` and change its value to your Vercel URL:
   `https://daily-news-hub-client.vercel.app`
4. Save Changes. Render will automatically redeploy with the updated CORS policy.

---

## ✅ Testing & Post-Deployment Checklist

- [ ] **Homepage Verification**: Open your Vercel URL in your browser. Verify newspapers, language tags, and UPSC briefs load without errors.
- [ ] **Admin Authentication**:
  - Go to `https://<your-vercel-app>.vercel.app/admin`
  - Login with Email: `admin@dailynewshub.com`
  - Password: `Admin@123456`
- [ ] **PDF Reader Security**: Open any newspaper edition and test navigation, zoom controls, and security overlays.
- [ ] **Admin Uploads**: Upload a sample PDF edition from the Admin Dashboard to test file processing.

---

## ❓ Troubleshooting Common Issues

### 1. CORS Error in Browser Console (`Access-Control-Allow-Origin`)
- **Fix**: Ensure `CLIENT_URL` in Render matches your exact Vercel frontend URL (including `https://` without trailing slash).

### 2. API Network Error (`Failed to fetch`)
- **Fix**: Ensure `VITE_API_URL` in Vercel environment variables is correctly set to your Render backend URL (`https://daily-news-hub-server.onrender.com`). After editing environment variables in Vercel, you **must redeploy** for Vite to inject them into the build.

### 3. Page Reload Returns 404 on Vercel
- **Fix**: Ensure `client/vercel.json` exists in your repository containing:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### 4. Data resets on Render free instance restart
- **Fix**: Render's free tier filesystem is ephemeral. The build command `npm install && npm run seed` automatically initializes and seeds the database whenever the app restarts or redeploys. For persistent PDF storage, you can connect an S3 bucket or Google Drive API (pre-built in your admin tools).
