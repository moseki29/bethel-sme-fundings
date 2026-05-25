# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project name (e.g., "bethel-sme-fundings")
5. Create a strong password
6. Choose your region
7. Click "Create new project" (wait 5-10 minutes for setup)

## Step 2: Get Your Credentials

1. Once project is created, go to **Settings → API**
2. Copy these two values:
   - **Project URL** (copy the entire URL)
   - **Anon/Public Key** (labeled "anon public")

## Step 3: Create Database Table

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents from `supabase-setup.sql`
4. Click "Run"

## Step 4: Update Your Website

1. Open `index.html`
2. Find these lines (around line 250):
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-actual-anon-key';
   ```

## Step 5: Test It

1. Open your website locally or push to GitHub Pages
2. Fill out an application and click "CHECK LOAN ELIGIBILITY"
3. Click the "Dashboard" tab
4. You should see your application in the table

## Managing Applications (Admin)

To update application status to "Approved" or "Rejected":

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select the **loans** table
4. Click on any row and change the **status** field
5. Changes update automatically on the website

## Column Reference

| Column | Type | Description |
|--------|------|-------------|
| id | auto | Unique ID |
| created_at | timestamp | When application was submitted |
| full_name | text | Applicant name |
| age | number | Applicant age |
| is_student | boolean | Student status |
| business_purpose | text | "Establishing" or "Scaling" |
| purpose_description | text | Loan explanation |
| loan_amount | decimal | Amount requested |
| monthly_revenue | decimal | Expected monthly revenue |
| status | text | "Pending Review", "Approved", or "Rejected" |
| documents_submitted | json | Checklist items submitted |
| notes | text | Admin notes |
