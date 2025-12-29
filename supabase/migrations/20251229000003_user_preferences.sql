-- User Preferences & Sync
-- Migration: 20251229000003
-- Purpose: Store user preferences and offline sync status

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Appearance
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),

  -- Notifications
  notifications_enabled BOOLEAN DEFAULT true,
  notification_sound BOOLEAN DEFAULT true,
  critical_alerts_only BOOLEAN DEFAULT false,

  -- Voice settings
  voice_input_enabled BOOLEAN DEFAULT true,
  push_to_talk BOOLEAN DEFAULT true,

  -- Offline settings
  offline_protocols_enabled BOOLEAN DEFAULT true,
  auto_cache_favorites BOOLEAN DEFAULT true,

  -- Display preferences
  compact_mode BOOLEAN DEFAULT false,
  large_text BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Offline Sync Log table
CREATE TABLE IF NOT EXISTS offline_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'protocol', 'bookmark', 'view', 'preference'
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  payload JSONB,
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_offline_sync_user ON offline_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_pending ON offline_sync_log(user_id, synced) WHERE synced = false;

-- User Devices table (for multi-device sync)
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'ipad', 'iphone', 'android', 'web'
  push_token TEXT,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync log"
  ON offline_sync_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync log"
  ON offline_sync_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync log"
  ON offline_sync_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own devices"
  ON user_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own devices"
  ON user_devices FOR ALL
  USING (auth.uid() = user_id);

-- Function to get or create user preferences
CREATE OR REPLACE FUNCTION get_user_preferences()
RETURNS user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_prefs user_preferences;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Try to get existing preferences
  SELECT * INTO v_prefs
  FROM user_preferences
  WHERE user_id = v_user_id;

  -- If not found, create default preferences
  IF v_prefs IS NULL THEN
    INSERT INTO user_preferences (user_id)
    VALUES (v_user_id)
    RETURNING * INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(p_updates JSONB)
RETURNS user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_prefs user_preferences;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Upsert preferences
  INSERT INTO user_preferences (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO UPDATE SET
    theme = COALESCE((p_updates->>'theme'), user_preferences.theme),
    notifications_enabled = COALESCE((p_updates->>'notifications_enabled')::boolean, user_preferences.notifications_enabled),
    notification_sound = COALESCE((p_updates->>'notification_sound')::boolean, user_preferences.notification_sound),
    critical_alerts_only = COALESCE((p_updates->>'critical_alerts_only')::boolean, user_preferences.critical_alerts_only),
    voice_input_enabled = COALESCE((p_updates->>'voice_input_enabled')::boolean, user_preferences.voice_input_enabled),
    push_to_talk = COALESCE((p_updates->>'push_to_talk')::boolean, user_preferences.push_to_talk),
    offline_protocols_enabled = COALESCE((p_updates->>'offline_protocols_enabled')::boolean, user_preferences.offline_protocols_enabled),
    auto_cache_favorites = COALESCE((p_updates->>'auto_cache_favorites')::boolean, user_preferences.auto_cache_favorites),
    compact_mode = COALESCE((p_updates->>'compact_mode')::boolean, user_preferences.compact_mode),
    large_text = COALESCE((p_updates->>'large_text')::boolean, user_preferences.large_text),
    updated_at = NOW()
  RETURNING * INTO v_prefs;

  RETURN v_prefs;
END;
$$;

-- Function to register device for push notifications
CREATE OR REPLACE FUNCTION register_device(
  p_device_id TEXT,
  p_device_name TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT 'ipad',
  p_push_token TEXT DEFAULT NULL
)
RETURNS user_devices
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_device user_devices;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO user_devices (user_id, device_id, device_name, device_type, push_token)
  VALUES (v_user_id, p_device_id, p_device_name, p_device_type, p_push_token)
  ON CONFLICT (user_id, device_id) DO UPDATE SET
    device_name = COALESCE(EXCLUDED.device_name, user_devices.device_name),
    device_type = COALESCE(EXCLUDED.device_type, user_devices.device_type),
    push_token = COALESCE(EXCLUDED.push_token, user_devices.push_token),
    last_active = NOW()
  RETURNING * INTO v_device;

  RETURN v_device;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION register_device TO authenticated;
