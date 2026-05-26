CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('international', 'local', 'admin')),
  home_country VARCHAR(100),
  city VARCHAR(100),
  study_program VARCHAR(150),
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  hobbies TEXT[] DEFAULT ARRAY[]::TEXT[],
  about_you TEXT,
  gender VARCHAR(30),
  gender_preference VARCHAR(30),
  buddy_status VARCHAR(30) NOT NULL DEFAULT 'not_applied'
    CHECK (buddy_status IN ('not_applied', 'pending', 'approved', 'rejected', 'suspended')),
  max_buddies INTEGER NOT NULL DEFAULT 3,
  profile_photo_url TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS max_buddies INTEGER NOT NULL DEFAULT 3;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_buddy_status_check;

ALTER TABLE users
ADD CONSTRAINT users_buddy_status_check
CHECK (buddy_status IN ('not_applied', 'pending', 'approved', 'rejected', 'suspended'));

UPDATE users
SET email_verified = TRUE
WHERE email_verified IS NULL;

ALTER TABLE users
ALTER COLUMN email_verified SET DEFAULT FALSE;

ALTER TABLE users
ALTER COLUMN email_verified SET NOT NULL;

CREATE TABLE IF NOT EXISTS email_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  code VARCHAR(10) NOT NULL,
  purpose VARCHAR(30) NOT NULL
    CHECK (purpose IN ('verify_email', 'reset_password')),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_codes_email_purpose
ON email_codes(email, purpose);

CREATE TABLE IF NOT EXISTS buddy_requests (
  id SERIAL PRIMARY KEY,
  international_student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_language VARCHAR(100),
  support_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  message TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_request_per_pair
ON buddy_requests (international_student_id, buddy_id)
WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_request_per_student
ON buddy_requests (international_student_id)
WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS buddy_applications (
  id SERIAL PRIMARY KEY,
  local_student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  motivation TEXT,
  availability TEXT,
  max_buddies INTEGER DEFAULT 3,
  status VARCHAR(30) NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buddy_matches (
  id SERIAL PRIMARY KEY,
  international_student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE buddy_matches
DROP CONSTRAINT IF EXISTS buddy_matches_international_student_id_buddy_id_status_key;

CREATE UNIQUE INDEX IF NOT EXISTS one_active_match_per_student
ON buddy_matches (international_student_id)
WHERE status = 'active';

CREATE TABLE IF NOT EXISTS buddy_feedback (
  id SERIAL PRIMARY KEY,
  buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (buddy_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_buddy_feedback_buddy_id
ON buddy_feedback(buddy_id, created_at DESC);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  international_student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (international_student_id, buddy_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS encrypted_text TEXT;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS encryption_iv TEXT;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS encryption_auth_tag TEXT;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS encryption_version VARCHAR(40);

CREATE TABLE IF NOT EXISTS message_deletions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deleted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_deletions_user_id
ON message_deletions(user_id, deleted_at DESC);

CREATE TABLE IF NOT EXISTS conversation_clears (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cleared_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_clears_user_id
ON conversation_clears(user_id, cleared_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(200),
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE events
ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS event_reminder_deliveries (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(30) NOT NULL
    CHECK (reminder_type IN ('24_hours', '2_hours')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (event_id, user_id, reminder_type)
);

CREATE TABLE IF NOT EXISTS useful_information (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'hangout',
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  location VARCHAR(160),
  meeting_time TIMESTAMP,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE community_posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE community_posts
ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_community_posts_created_at
ON community_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_status
ON community_posts(status, created_at DESC);

CREATE TABLE IF NOT EXISTS community_post_interests (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE community_comments
ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id
ON community_comments(post_id, created_at);

CREATE TABLE IF NOT EXISTS adaptation_checklist_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  timeframe VARCHAR(80),
  action_label VARCHAR(120),
  action_url TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE adaptation_checklist_tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';

ALTER TABLE adaptation_checklist_tasks
ADD COLUMN IF NOT EXISTS timeframe VARCHAR(80);

ALTER TABLE adaptation_checklist_tasks
ADD COLUMN IF NOT EXISTS action_label VARCHAR(120);

ALTER TABLE adaptation_checklist_tasks
ADD COLUMN IF NOT EXISTS action_url TEXT;

INSERT INTO events (title, description, event_date, location, category)
SELECT
  'Welcome Meeting',
  'Meet other students and learn how KazakhBuddy works.',
  NOW() + INTERVAL '3 days',
  'AITU Main Hall',
  'Orientation'
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE title = 'Welcome Meeting'
);

INSERT INTO events (title, description, event_date, location, category)
SELECT
  'Campus Tour',
  'A local buddy will show the main university places.',
  NOW() + INTERVAL '7 days',
  'Campus Entrance',
  'Adaptation'
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE title = 'Campus Tour'
);

INSERT INTO useful_information (title, content, category)
SELECT
  'Academic Calendar',
  'All important semester dates can be collected here later.',
  'Academic'
WHERE NOT EXISTS (
  SELECT 1 FROM useful_information WHERE title = 'Academic Calendar'
);

INSERT INTO useful_information (title, content, category)
SELECT
  'Migration Reminder',
  'Keep copies of passport, visa and registration documents.',
  'Documents'
WHERE NOT EXISTS (
  SELECT 1 FROM useful_information WHERE title = 'Migration Reminder'
);
