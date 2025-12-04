# 🚀 Deploy UPSC Evaluator to Vercel

## Quick Deployment Steps

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click **"New Project"**
   - Select your `upsc-evaluter` repository
   - Click **"Import"**

3. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (keep default)
   - Build Command: `next build` (default)
   - Click **"Deploy"**

4. **Add Environment Variables**:
   After initial deployment, go to **Settings → Environment Variables** and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=your-openai-key
   NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
   ```

5. **Redeploy**:
   - After adding env vars, click **"Redeploy"** from Deployments tab

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? upsc-evaluator
# - Directory? ./
# - Override settings? N

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

---

## ✅ Pre-Deployment Checklist

- [x] Database tables created in Supabase
- [x] Storage bucket configured
- [x] Environment variables ready
- [x] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] First deployment successful

---

## 🔧 Troubleshooting

### Build Fails with "Cannot find module"
**Solution**: Make sure all dependencies are in `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working
**Solution**: 
1. Double-check variable names (copy from `.env.local`)
2. Make sure `NEXT_PUBLIC_` prefix is correct for client-side vars
3. Redeploy after adding variables

### "Invalid Supabase URL" Error
**Solution**: 
- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- No trailing slashes in URL

### OpenAI API Errors
**Solution**:
- Verify API key is valid
- Check OpenAI account has credits
- Regenerate key if needed

---

## 📊 Post-Deployment Testing

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test signup**: Create a new account
3. **Test upload**: Upload an answer
4. **Test AI Generator**: Generate a model answer
5. **Check dashboard**: Verify stats display
6. **Test admin panel**: `/admin` route

---

## 🎯 Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your domain (e.g., `upsc-evaluator.com`)
3. Follow DNS configuration steps
4. Wait for DNS propagation (~24 hours)

---

## 💰 Estimated Vercel Costs

**Hobby Plan (Free)**:
- 100GB bandwidth/month
- Unlimited deployments
- Perfect for MVP testing with 4-5 users

**Will NOT exceed free tier** with your usage!

---

## 🔄 Future Deployments

Every push to `main` branch auto-deploys! 🎉

Or manually:
```bash
vercel --prod
```

---

## 🎉 You're Live!

Once deployed, share with your testers:
- **App URL**: `https://your-app.vercel.app`
- **Signup**: `/signup`
- **Dashboard**: `/dashboard`

**Monitor usage in**:
- Vercel Dashboard (traffic, logs)
- Supabase Dashboard (database queries)
- OpenAI Dashboard (API usage)

---

## Need Help?

**Vercel Docs**: https://vercel.com/docs
**Deploy Issues**: Check build logs in Vercel dashboard
**Runtime Errors**: Check Vercel Functions logs
