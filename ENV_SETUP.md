# UPSC Answer Evaluation - Environment Setup

To set up your environment variables, create a `.env.local` file in the project root with the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Your Keys

### Supabase
1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings > API
3. Copy the Project URL and Anon/Public key
4. Copy the Service Role key (keep this secret!)

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key
