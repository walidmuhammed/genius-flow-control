-- Fix customer association for imported orders
-- Step 1: Create a function to reassign orphaned customers to their correct business owners

CREATE OR REPLACE FUNCTION public.fix_customer_ownership()
RETURNS TABLE(fixed_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    fix_count integer := 0;  
    fix_details jsonb := '[]'::jsonb;
    customer_record record;
    target_client_id uuid;
BEGIN
    -- For each customer that has orders but is associated with an admin
    FOR customer_record IN 
        SELECT DISTINCT c.id, c.name, c.phone, c.created_by as current_owner,
               o.client_id as should_be_owner,
               p.user_type as current_owner_type
        FROM customers c
        JOIN orders o ON c.id = o.customer_id  
        JOIN profiles p ON c.created_by = p.id
        WHERE p.user_type = 'admin' 
        AND c.created_by != o.client_id
        AND o.client_id IS NOT NULL
    LOOP
        -- Update the customer to be owned by the business client
        UPDATE customers 
        SET created_by = customer_record.should_be_owner,
            updated_at = now()
        WHERE id = customer_record.id;
        
        -- Log the change
        INSERT INTO public.customer_history (
            customer_id,
            field_name,
            old_value,
            new_value,
            changed_by,
            change_reason
        ) VALUES (
            customer_record.id,
            'ownership_fix',
            customer_record.current_owner::text,
            customer_record.should_be_owner::text,
            auth.uid(),
            'automated_fix_imported_customers'
        );
        
        fix_count := fix_count + 1;
        fix_details := fix_details || jsonb_build_object(
            'customer_id', customer_record.id,
            'customer_name', customer_record.name,
            'customer_phone', customer_record.phone,
            'old_owner', customer_record.current_owner,
            'new_owner', customer_record.should_be_owner
        );
    END LOOP;
    
    RETURN QUERY SELECT fix_count, fix_details;
END;
$$;

-- Run the fix function immediately
SELECT * FROM public.fix_customer_ownership();