-- Create loans table
CREATE TABLE loans (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  is_student BOOLEAN NOT NULL,
  business_purpose TEXT NOT NULL,
  purpose_description TEXT NOT NULL,
  loan_amount DECIMAL(10, 2) NOT NULL,
  monthly_revenue DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'Pending Review',
  documents_submitted JSONB,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX loans_created_at_idx ON loans(created_at DESC);
CREATE INDEX loans_status_idx ON loans(status);

-- Enable RLS (Row Level Security)
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for form submissions)
CREATE POLICY "Allow public inserts" ON loans
  FOR INSERT WITH CHECK (true);

-- Create policy to allow public reads (for dashboard)
CREATE POLICY "Allow public reads" ON loans
  FOR SELECT USING (true);

-- Optional: Create an admin-only update policy
CREATE POLICY "Allow updates by authenticated admins" ON loans
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
