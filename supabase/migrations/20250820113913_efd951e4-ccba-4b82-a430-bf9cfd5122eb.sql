-- Create missing database objects that weren't created due to existing columns
-- Create trigger to automatically create client payout entries on order completion
CREATE TRIGGER create_client_payout_on_completion
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_client_payout_entry();