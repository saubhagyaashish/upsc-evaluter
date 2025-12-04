/* 
UPSC Evaluator - Trustworthy Professional Theme
Replace all purple/pink with blue/teal/green for educational credibility
*/

// SEARCH AND REPLACE GUIDE:
// Run these find & replaces across all files:

// 1. PURPLE → BLUE
from-purple-600 → from-blue-600
to-pink-600 → to-cyan-600
from-purple-700 → from-blue-700
to-pink-700 → to-cyan-700
purp le-400 → cyan-400
purple-300 → cyan-300
via-purple-900 → via-blue-900
purple-900 → blue-900
pink-900 → cyan-900
from-purple-800 → from-blue-800
to-pink-800 → to-cyan-800
purple-600 → blue-600
pink-600 → cyan-600  
purple-500 → blue-500
pink-500 → cyan-500

// 2. Additional accent colors (CTAs)
// For "Upload" buttons and primary CTAs, use orange-blue:
// from-purple-600 to-pink-600 → from-orange-500 to-blue-600

// 3. Background gradients:
from-slate-900 via-purple-900 to-slate-900 → from-slate-900 via-blue-900 to-slate-800

// 4. Score colors (keep these for meaning):
// Green = Good (keep)
// Yellow = Average (keep)
// Orange = Needs work (keep) 
// Red = Poor (keep)

/* NEW THEME PALETTE */
const theme = {
  // Primary: Trust & Education
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main blue
    600: '#2563eb',  // Dark blue
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',  // Very dark blue
  },
  
  // Secondary: Professional & Clean
  secondary: {
    500: '#06b6d4',  // Cyan
    600: '#0891b2',  // Dark cyan
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',  // Very dark cyan
  },
  
  // Success: Achievement & Growth
  success: {
    500: '#10b981',  // Green
    600: '#059669',
    700: '#047857',
  },
  
  // Warning: Encouragement
  warning: {
    500: '#f97316',  // Orange
    600: '#ea580c',
  },
  
  // Background: Stable dark blue-gray
  background: {
    dark: '#0f172a',      // slate-900
    medium: '#1e3a8a',    // blue-900
    light: '#1e293b',     // slate-800
  }
}

// FILES TO UPDATE:
// ✅ login/page.tsx - DONE
// ✅ signup/page.tsx - DONE  
// ❌ Navbar.tsx
// ❌ layout.tsx (app)
// ❌ upload/page.tsx
// ❌ evaluation/[id]/page.tsx
// ❌ history/page.tsx
// ❌ dashboard/page.tsx
// ❌ admin/page.tsx
// ❌ ImageUpload.tsx
