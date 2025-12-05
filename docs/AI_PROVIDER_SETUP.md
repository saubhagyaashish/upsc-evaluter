# AI Provider Configuration

This project supports multiple AI providers for answer generation. You can switch between Google Gemini and OpenAI by configuring environment variables.

## Setup Instructions

### 1. Add Environment Variables

Add these variables to your `.env.local` file:

```env
# AI Provider Selection (choose: 'gemini' or 'openai')
AI_PROVIDER=gemini

# API Keys (add the one you're using)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get API Keys

**Google Gemini (Free Tier Available):**
- Visit: https://ai.google.dev/
- Free tier: 15 requests/minute, 1500 requests/day
- Model used: `gemini-1.5-pro`

**OpenAI:**
- Visit: https://platform.openai.com/api-keys
- Requires payment (minimum $5)
- Model used: `gpt-4o`

### 3. Restart Development Server

After updating `.env.local`, restart your development server:

```bash
npm run dev
```

## Switching Providers

To switch providers, simply change the `AI_PROVIDER` value in `.env.local`:

```env
# Use Gemini
AI_PROVIDER=gemini

# OR use OpenAI
AI_PROVIDER=openai
```

Then restart the dev server.

## Provider Comparison

| Feature | Gemini | OpenAI |
|---------|--------|--------|
| **Free Tier** | ✅ Yes (1500/day) | ❌ No |
| **Model** | gemini-1.5-pro | gpt-4o |
| **Cost** | Free | ~$0.005/request |
| **Speed** | Fast | Fast |
| **Quality** | Excellent | Excellent |

## Troubleshooting

**Error: "API key is not set"**
- Make sure you've added the correct API key to `.env.local`
- Restart your dev server after adding the key

**Error: "429 quota exceeded"**
- For Gemini: You've hit the free tier limit (1500/day)
- For OpenAI: You need to add credits to your account
- Try switching to the other provider

**Provider not switching**
- Verify `AI_PROVIDER` is set correctly in `.env.local`
- Check for typos (should be lowercase: `gemini` or `openai`)
- Restart the dev server

## Default Behavior

If `AI_PROVIDER` is not set, the system defaults to OpenAI.
