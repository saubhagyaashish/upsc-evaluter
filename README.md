# 📘 UPSC Answer Evaluation MVP

An AI-powered answer evaluation system for UPSC Mains aspirants. Upload handwritten answers and get instant AI feedback with scores, structure analysis, and improvement suggestions.

## ✨ Features

### For Students
- 📝 **Multiple Question Input Methods**
  - Manual entry
  - Question bank selection
  - Auto-extract from answer sheet via OCR
  
- 📸 **Easy Upload**
  - Camera capture
  - File upload
  - Drag and drop support

- 🤖 **AI Evaluation**
  - Instant OCR text extraction
  - UPSC-specific evaluation criteria
  - Score out of 10
  - Structure feedback
  - Points missed analysis
  - Improvement suggestions

- 📊 **Dashboard & Analytics**
  - Total answers tracked
  - Average score calculation
  - Progress visualization
  - Recent answers overview

- 📜 **Answer History**
  - View all past submissions
  - Score badges and thumbnails
  - Detailed evaluation access

### For Admin
- 👥 **Usage Statistics**
  - Total users
  - Total answers submitted
  - Average scores across all users
  - Total evaluations performed

- ❓ **Question Analytics**
  - Most asked questions
  - Trending topics
  - Question source breakdown

- 📈 **Activity Monitoring**
  - Recent submissions
  - User engagement tracking
  - Real-time evaluation logs

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS v4, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **AI Services**: 
  - OpenAI GPT-4o (Evaluation)
  - OpenAI Vision (OCR)
- **Charts**: Recharts
- **Date Utils**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd d:/Practice/upsc
npm install
```

### 2. Set Up Supabase

Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create your Supabase project
- Set up database tables
- Configure storage bucket
- Add RLS policies

### 3. Configure Environment Variables

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

OPENAI_API_KEY=your-openai-api-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First Account

1. Navigate to `/signup`
2. Enter your details
3. Sign up
4. You'll be redirected to the dashboard

## 📱 Usage

### Upload an Answer

1. Go to **Upload Answer** page
2. Choose question input method:
   - **Manual**: Type the question
   - **Question Bank**: Select from pre-defined questions
   - **Auto Extract**: OCR from answer sheet
3. Upload answer image (camera or file)
4. Click **Upload & Evaluate**
5. Wait for AI evaluation (20-30 seconds)
6. View detailed results

### View Evaluation

- **Score**: 0-10 scale with color coding
- **Structure Feedback**: Analysis of Introduction, Body, Conclusion
- **Points Missed**: Key concepts not covered
- **Suggestions**: Specific improvement recommendations

### Track Progress

- Visit **Dashboard** for overview
- Check **History** for all submissions
- Monitor improvement over time

### Admin Dashboard

- Navigate to `/admin` to view:
  - Platform-wide statistics
  - Popular questions
  - Recent activity across all users

## 📂 Project Structure

```
upsc/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/               # Main application
│   │   ├── dashboard/       # Student dashboard
│   │   ├── upload/          # Upload answer page
│   │   ├── evaluation/[id]/ # Evaluation results
│   │   ├── history/         # Answer history
│   │   └── admin/           # Admin panel
│   ├── api/                 # API routes
│   │   ├── evaluate/        # Evaluation endpoint
│   │   └── extract-question/# OCR endpoint
│   └── page.tsx             # Home redirect
├── components/              # React components
│   ├── ui/                  # ShadCN components
│   ├── Navbar.tsx
│   └── ImageUpload.tsx
├── lib/
│   ├── openai/              # OpenAI integrations
│   │   ├── vision.ts        # OCR functionality
│   │   └── evaluator.ts     # Evaluation logic
│   ├── supabase/            # Supabase clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── middleware.ts            # Route protection
├── SUPABASE_SETUP.md       # Database setup guide
├── ENV_SETUP.md            # Environment config guide
└── README.md               # This file
```

## 💰 Cost Estimation

### For 5 Testers (1 Month)

Assuming each tester uploads 20 answers:

- **Supabase**: Free tier (500MB database, 1GB storage)
- **OpenAI**:
  - OCR (Vision): ~100 requests × ₹0.5 = ₹50
  - Evaluation (GPT-4o): ~100 requests × ₹2 = ₹200
  
**Total**: ~₹250-300/month

### Scaling to 50 Users

- **Supabase**: Free tier sufficient
- **OpenAI**: ~₹2,500-3,000/month

## 🔒 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Protected routes via middleware
- ✅ User data isolation
- ✅ Secure file uploads with validation
- ✅ Service role key for backend operations only

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Log in with credentials
- [ ] Upload answer with manual question entry
- [ ] Upload answer with OCR question extraction
- [ ] Verify evaluation appears correctly
- [ ] Check dashboard stats update
- [ ] View answer history
- [ ] Access evaluation details
- [ ] Test image upload validation
- [ ] Test logout functionality

### OCR Testing

Test with different handwriting styles:
- Clear, neat handwriting
- Cursive writing
- Different pen colors
- Various paper qualities

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Supabase Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is active
- Confirm RLS policies allow operations

### OpenAI API Errors

- Verify API key is valid
- Check account has credits
- Ensure rate limits not exceeded

### Image Upload Failures

- File size must be under 5MB
- Supported formats: JPG, PNG, HEIC, WEBP
- Check storage bucket policies

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to add all environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## 📈 Future Enhancements

- [ ] Question bank with 1000+ UPSC questions
- [ ] Subject-wise analytics
- [ ] Peer comparison
- [ ] Model answers library
- [ ] Coaching institute integration
- [ ] Mobile app (React Native)
- [ ] Payment gateway for subscriptions
- [ ] Advanced analytics dashboard
- [ ] PDF export of evaluations
- [ ] Email notifications

## 🤝 Contributing

This is an MVP for testing. Feedback welcome!

## 📄 License

Proprietary - For testing purposes only

## 📞 Support

For issues or questions during testing phase, contact the development team.

---

**Built with ❤️ for UPSC Aspirants**
