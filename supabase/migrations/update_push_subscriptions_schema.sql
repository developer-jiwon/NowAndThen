-- Update push_subscriptions table to support multiple notification methods
-- Add new columns for web push and notification method tracking

-- Add new columns
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS webpush_subscription JSONB,
ADD COLUMN IF NOT EXISTS notification_method TEXT DEFAULT 'firebase' CHECK (notification_method IN ('firebase', 'webpush', 'none'));

-- Update the table comment
COMMENT ON TABLE push_subscriptions IS 'Stores push notification subscriptions supporting both Firebase FCM and Web Push API';

-- Add comments for new columns
COMMENT ON COLUMN push_subscriptions.webpush_subscription IS 'Web Push API subscription object containing endpoint and keys';
COMMENT ON COLUMN push_subscriptions.notification_method IS 'Current notification method: firebase, webpush, or none';

-- Create index on notification_method for efficient queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_notification_method ON push_subscriptions(notification_method);

-- Update existing records to have firebase as default method if they have fcm_token
UPDATE push_subscriptions 
SET notification_method = 'firebase' 
WHERE fcm_token IS NOT NULL AND notification_method IS NULL;

-- Update existing records to have none as method if they don't have fcm_token
UPDATE push_subscriptions 
SET notification_method = 'none' 
WHERE fcm_token IS NULL AND notification_method IS NULL;