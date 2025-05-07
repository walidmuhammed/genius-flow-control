
-- Create a function to get the top courier for today
CREATE OR REPLACE FUNCTION public.get_top_courier_today(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (courier_name TEXT, orders_count BIGINT) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    orders.courier_name,
    COUNT(*) as orders_count
  FROM 
    orders
  WHERE 
    orders.status = 'Successful'
    AND orders.created_at >= start_date
    AND orders.created_at <= end_date
    AND orders.courier_name IS NOT NULL
  GROUP BY 
    orders.courier_name
  ORDER BY 
    orders_count DESC
  LIMIT 1;
END;
$$;
