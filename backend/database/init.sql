CREATE TABLE users (
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
  buddy_status VARCHAR(30) NOT NULL DEFAULT 'not_applied' CHECK (
    buddy_status IN ('not_applied', 'pending', 'approved', 'rejected')
  ),
  responded_at TIMESTAMP
);

CREATE UNIQUE INDEX unique_pending_request_per_pair
ON buddy_requests (international_student_id, buddy_id)
WHERE status = 'pending';

CREATE TABLE buddy_applications (
  id SERIAL PRIMARY KEY,
  local_student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  motivation TEXT,
  availability TEXT,
  max_buddies INTEGER DEFAULT 3,
  status VARCHAR(30) NOT NULL DEFAULT 'approved' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE buddy_matches (
  id SERIAL PRIMARY KEY,
  international_student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'completed', 'cancelled')
  ),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (international_student_id, buddy_id, status)
);

CREATE UNIQUE INDEX one_active_match_per_student
ON buddy_matches (international_student_id)
WHERE status = 'active';

CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  international_student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buddy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (international_student_id, buddy_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(200),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE useful_information (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
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

CREATE TABLE adaptation_checklist_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO events (title, description, event_date, location, category) VALUES
('Welcome Meeting', 'Meet other students and learn how KazakhBuddy works.', NOW() + INTERVAL '3 days', 'AITU Main Hall', 'Orientation'),
('Campus Tour', 'A local buddy will show the main university places.', NOW() + INTERVAL '7 days', 'Campus Entrance', 'Adaptation');

INSERT INTO useful_information (title, content, category) VALUES
('Academic Calendar', 'All important semester dates can be collected here later.', 'Academic'),
('Migration Reminder', 'Keep copies of passport, visa and registration documents.', 'Documents');