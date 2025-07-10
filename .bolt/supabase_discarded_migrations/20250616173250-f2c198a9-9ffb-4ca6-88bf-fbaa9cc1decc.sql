
-- Update the activity_logs entity_type check constraint to include ticket and ticket_message
ALTER TABLE public.activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_entity_type_check;

ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_entity_type_check 
CHECK (entity_type IN ('order', 'customer', 'pickup', 'ticket', 'ticket_message'));

-- Also update the action check constraint to ensure it allows the actions used by tickets
ALTER TABLE public.activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_action_check;

ALTER TABLE public.activity_logs 
ADD CONSTRAINT activity_logs_action_check 
CHECK (action IN ('created', 'updated', 'deleted', 'status_changed'));
