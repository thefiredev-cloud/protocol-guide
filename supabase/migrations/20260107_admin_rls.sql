-- Admin RLS Policies
-- Allow specific admin emails to read all user data

-- Allow admins to read all chat_sessions
CREATE POLICY "admin_read_all_sessions" ON chat_sessions
FOR SELECT TO authenticated
USING (auth.jwt()->>'email' IN ('tanner@thefiredev.com', 'christiansafina@gmail.com'));

-- Allow admins to read all chat_messages
CREATE POLICY "admin_read_all_messages" ON chat_messages
FOR SELECT TO authenticated
USING (auth.jwt()->>'email' IN ('tanner@thefiredev.com', 'christiansafina@gmail.com'));

-- Allow admins to read all user_feedback
CREATE POLICY "admin_read_all_feedback" ON user_feedback
FOR SELECT TO authenticated
USING (auth.jwt()->>'email' IN ('tanner@thefiredev.com', 'christiansafina@gmail.com'));

-- Allow admins to read all audit_logs
CREATE POLICY "admin_read_all_audit" ON audit_logs
FOR SELECT TO authenticated
USING (auth.jwt()->>'email' IN ('tanner@thefiredev.com', 'christiansafina@gmail.com'));
