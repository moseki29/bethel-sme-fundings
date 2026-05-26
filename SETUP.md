# 🚀 BETHEL SME FUNDINGS - Setup Guide

Complete your loan app in **5 minutes**!

## Step 1: Create a Free Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** → Sign up with GitHub or email
3. Create a new project (name: `bethel-sme`, Region: Choose closest to you)
4. Wait for project to initialize (2-3 minutes)

## Step 2: Get Your Credentials

In Supabase Dashboard:
1. Go to **Settings** → **API** (left sidebar)
2. Copy **Project URL** - looks like: `https://xxxxx.supabase.co`
3. Copy **Anon Public** key - long string starting with `eyJ...`

## Step 3: Update HTML File

Open `index.html` in your code editor:

Find these lines (around line 662-663):
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Replace with your credentials:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';  // Your URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';  // Your anon key
```

## Step 4: Create Database Tables

In Supabase Dashboard:
1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Paste this SQL and run it:

```sql
-- Users Profile Table
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  account_status TEXT DEFAULT 'active',
  documents_verified BOOLEAN DEFAULT FALSE,
  national_id_path TEXT,
  student_id_path TEXT,
  business_plan_path TEXT,
  documents_uploaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login History Table
CREATE TABLE login_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  status TEXT,
  device_info TEXT
);

-- Loan Applications Table
CREATE TABLE loan_applications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  is_student BOOLEAN,
  institution TEXT,
  purpose TEXT,
  purpose_description TEXT,
  loan_amount INTEGER,
  monthly_revenue INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own login history"
  ON login_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own applications"
  ON loan_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON loan_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Step 5: Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **Create a new bucket**
3. Name it: `documents` (lowercase)
4. **Uncheck** "Private bucket" (make it public)
5. Click **Create bucket**

## Step 6: Test It!

1. Open `index.html` in your browser
2. Click **"Create Account"**
3. Fill in the signup form with:
   - Name: John Doe
   - Email: john@example.com
   - Phone: 71234567 (or +267 71234567)
   - Age: 22
   - Password: securepass123
   - Check "I agree to Terms"
4. Click **Create Account**
5. Check your email for verification link
6. Sign in with your email and password
7. Upload documents (images or PDF)
8. Fill in loan application

## 🎉 You're Done!

Your loan application system is now **LIVE** and ready to use!

---

## Features Included

✅ **Email-based authentication**
- Sign up with email and password
- Secure password validation
- Email verification required

✅ **User profiles**
- Store personal information
- Track application status
- Login history

✅ **Document upload**
- Upload National ID
- Upload Student ID
- Upload Business Plan
- Drag & drop support
- File validation (max 5MB)

✅ **Loan application form**
- Student status tracking
- Business plan description
- Loan amount selection (P500-P2000)
- Monthly revenue projection
- Terms acknowledgement

✅ **Admin features** (via Supabase)
- View all applications
- Check applicant documents
- Track application status

---

## Troubleshooting

### "Database error" message
- Check your SUPABASE_URL and SUPABASE_KEY are correct
- Make sure no extra spaces or quotes

### Signup fails
- Use valid email format
- Password must be 8+ characters
- Phone must be valid Botswana number (starts with 7)

### File upload fails
- Check file size (max 5MB)
- Make sure storage bucket is created and public
- Check browser console for errors (F12)

### Can't sign in after signup
- Check email for verification link
- Click the link to verify your account
- If no email, check spam folder

---

## Database Schema

### users_profile
- Stores user account information
- Tracks document verification status
- Links to auth.users

### login_history
- Records login timestamps
- Tracks device info
- Audit trail

### loan_applications
- Loan application submissions
- Business purpose details
- Monthly revenue info
- Application status

---

## Next Steps

1. **Customize styling** - Edit CSS in `index.html`
2. **Add admin dashboard** - Create an admin panel to review applications
3. **Email notifications** - Send confirmation emails to applicants
4. **Payment integration** - Add loan repayment functionality
5. **Export reports** - Generate CSV/PDF of applications

---

Need help? Check Supabase docs: https://supabase.com/docs

