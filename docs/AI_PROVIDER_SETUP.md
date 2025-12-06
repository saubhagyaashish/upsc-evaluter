# AI Provider Setup Guide

Switch between **Google Gemini** and **OpenAI** for both answer generation and OCR (text extraction) using environment variables.

## Quick Setup

### 1. Choose Your Provider

Set the `AI_PROVIDER` variable in your `.env.local`:

```env
# Choose 'gemini' or 'openai'
AI_PROVIDER=gemini

# API Keys (only need the key for your chosen provider)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

That's it! Your app will now use the specified provider for **both**:
- ✅ Answer generation
- ✅ OCR (text extraction from images)

---

## Features by Provider

| Feature | Gemini | OpenAI |
|---------|--------|--------|
| **Answer Generation** | ✅ gemini-2.0-flash | ✅ gpt-4o |
| **OCR (Question Extraction)** | ✅ gemini-2.0-flash | ✅ gpt-4o-mini |
| **OCR (Full Text)** | ✅ gemini-2.0-flash | ✅ gpt-4o-mini |
| **Free Tier** | 1500 requests/day | Limited |
| **Cost** | Free tier generous | Pay per use |

---

## Getting API Keys

### Google Gemini (Recommended for Free Tier)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key
5. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

**Free Tier**: 1500 requests per day

### OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or log in
3. Click "Create new secret key"
4. Copy your API key
5. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ```

**Pricing**: Pay-as-you-go (check [OpenAI Pricing](https://openai.com/pricing))

---

## Troubleshooting

### "API key not set"

**Problem**: 
```
Error: GEMINI_API_KEY is not set in environment variables
```

**Solution**:
1. Check your `.env.local` file exists in project root
2. Ensure the API key is set correctly
3. Restart your development server

### "429 Quota Exceeded" (OpenAI)

**Problem**: Hit OpenAI's rate limit or quota

**Solutions**:
1. **Switch to Gemini** (Free tier):
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key_here
   ```
2. Or add credits to your OpenAI account

### Provider Not Switching

**Problem**: Changed `AI_PROVIDER` but still using old provider

**Solution**: Restart your dev server:
```bash
# Stop (Ctrl+C)
npm run dev
```

### Check Which Provider is Active

Look at your terminal logs when making requests:
```
🤖 Using AI provider: gemini
🔍 Using OCR provider: gemini
```

---

## Comparison

### When to use Gemini ✅

- **Free tier users**: 1500 requests/day
- **Cost-conscious**: No billing required
- **High volume**: Generous free limits
- **Latest features**: Access to newest models

### When to use OpenAI ⚡

- **Paid tier**: Already have OpenAI credits
- **Specific requirements**: Need GPT-4o specifically
- **Production**: Established billing relationship

---

## Environment Variables Reference

```env
# Provider Selection (required)
AI_PROVIDER=gemini  # or 'openai'

# API Keys (provide at least one)
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...

# Optional: Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Support

- **Gemini Issues**: [Google AI Studio](https://aistudio.google.com/)
- **OpenAI Issues**: [OpenAI Help](https://help.openai.com/)
- **App Issues**: Check terminal logs for detailed error messages

**Pro Tip**: Start with Gemini's free tier to test everything, then decide if you need OpenAI's features!
