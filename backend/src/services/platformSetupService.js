import { query } from "../config/db.js";

let setupPromise = null;

export function ensurePlatformEnhancements() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    await query(
      `ALTER TABLE users
       ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP`
    );

    await query(
      `ALTER TABLE users
       ALTER COLUMN last_active_at DROP DEFAULT`
    );

    await query(
      `CREATE TABLE IF NOT EXISTS platform_runtime_flags (
        flag_key VARCHAR(100) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    );

    await query(
      `WITH missing_flag AS (
         INSERT INTO platform_runtime_flags (flag_key)
         SELECT 'last_active_reset_v1'
         WHERE NOT EXISTS (
           SELECT 1
           FROM platform_runtime_flags
           WHERE flag_key = 'last_active_reset_v1'
         )
         RETURNING flag_key
       )
       UPDATE users
       SET last_active_at = NULL
       WHERE EXISTS (SELECT 1 FROM missing_flag)`
    );

    await query(
      `ALTER TABLE adaptation_checklist_tasks
       ADD COLUMN IF NOT EXISTS deadline TIMESTAMP`
    );

    await query(
      `ALTER TABLE adaptation_checklist_tasks
       ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system'`
    );

    await query(
      `ALTER TABLE adaptation_checklist_tasks
       ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT FALSE`
    );

    await query(
      `ALTER TABLE adaptation_checklist_tasks
       ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`
    );

    await query(
      `UPDATE adaptation_checklist_tasks
       SET created_by = COALESCE(created_by, 'system')`
    );

    await query(
      `UPDATE adaptation_checklist_tasks
       SET is_custom = COALESCE(is_custom, FALSE)`
    );

    await query(
      `CREATE TABLE IF NOT EXISTS task_reminder_deliveries (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES adaptation_checklist_tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reminder_type VARCHAR(30) NOT NULL
          CHECK (reminder_type IN ('24_hours', '6_hours', 'overdue')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (task_id, user_id, reminder_type)
      )`
    );

    await query(
      `CREATE TABLE IF NOT EXISTS event_attendance (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'going'
          CHECK (status IN ('going', 'attended')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (event_id, user_id)
      )`
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_checklist_deadline
       ON adaptation_checklist_tasks(user_id, deadline)`
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_users_last_active_at
       ON users(last_active_at DESC)`
    );

    await query(
      `ALTER TABLE community_posts
       ADD COLUMN IF NOT EXISTS image_url TEXT`
    );

    await query(
      `ALTER TABLE community_posts
       ADD COLUMN IF NOT EXISTS status VARCHAR(30)`
    );

    await query(
      `UPDATE community_posts
       SET status = 'active'
       WHERE status IS NULL`
    );

    await query(
      `ALTER TABLE community_posts
       ALTER COLUMN status SET DEFAULT 'active'`
    );

    await query(
      `ALTER TABLE community_comments
       ADD COLUMN IF NOT EXISTS image_url TEXT`
    );

    await query(
      `CREATE INDEX IF NOT EXISTS idx_community_posts_status
       ON community_posts(status, created_at DESC)`
    );
  })();

  return setupPromise;
}
