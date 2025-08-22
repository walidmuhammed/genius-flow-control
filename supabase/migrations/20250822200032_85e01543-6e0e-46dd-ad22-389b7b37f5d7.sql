-- Create database functions for invoice operations

-- Function to create invoice with items atomically
CREATE OR REPLACE FUNCTION public.create_invoice_with_items(
  p_order_ids uuid[],
  p_merchant_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_client_id uuid;
  v_merchant_name text;
  v_invoice_id uuid;
  v_invoice_record jsonb;
  v_order_record record;
  v_total_collected_usd numeric := 0;
  v_total_collected_lbp numeric := 0;
  v_total_delivery_usd numeric := 0;
  v_total_delivery_lbp numeric := 0;
  v_net_payout_usd numeric := 0;
  v_net_payout_lbp numeric := 0;
BEGIN
  -- Validate input
  IF p_order_ids IS NULL OR array_length(p_order_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No orders selected';
  END IF;

  -- Check that all orders exist and belong to the same client
  SELECT DISTINCT client_id INTO v_client_id
  FROM orders 
  WHERE id = ANY(p_order_ids)
    AND status = 'Successful'
    AND payment_status = 'pending'
    AND invoice_id IS NULL;
  
  -- Check if we found exactly one client
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'No eligible orders found. Orders must be Successful, pending payment, and not already invoiced.';
  END IF;
  
  -- Verify all orders belong to the same client
  IF EXISTS (
    SELECT 1 FROM orders 
    WHERE id = ANY(p_order_ids) 
    AND client_id != v_client_id
  ) THEN
    RAISE EXCEPTION 'multiple clients: Selected orders belong to multiple clients';
  END IF;
  
  -- Check for already invoiced orders
  IF EXISTS (
    SELECT 1 FROM orders 
    WHERE id = ANY(p_order_ids) 
    AND invoice_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'already invoiced: One or more orders are already in an invoice';
  END IF;
  
  -- Check for already paid orders
  IF EXISTS (
    SELECT 1 FROM orders 
    WHERE id = ANY(p_order_ids) 
    AND payment_status = 'paid'
  ) THEN
    RAISE EXCEPTION 'already paid: One or more orders are already paid';
  END IF;

  -- Get merchant name from client profile if not provided
  IF p_merchant_name IS NULL THEN
    SELECT COALESCE(business_name, full_name, 'Unknown Merchant')
    INTO v_merchant_name
    FROM profiles
    WHERE id = v_client_id;
  ELSE
    v_merchant_name := p_merchant_name;
  END IF;

  -- Calculate totals
  FOR v_order_record IN 
    SELECT 
      id,
      COALESCE(collected_amount_usd, 0) as collected_usd,
      COALESCE(collected_amount_lbp, 0) as collected_lbp,
      COALESCE(delivery_fees_usd, 0) as delivery_usd,
      COALESCE(delivery_fees_lbp, 0) as delivery_lbp
    FROM orders 
    WHERE id = ANY(p_order_ids)
  LOOP
    v_total_collected_usd := v_total_collected_usd + v_order_record.collected_usd;
    v_total_collected_lbp := v_total_collected_lbp + v_order_record.collected_lbp;
    v_total_delivery_usd := v_total_delivery_usd + v_order_record.delivery_usd;
    v_total_delivery_lbp := v_total_delivery_lbp + v_order_record.delivery_lbp;
  END LOOP;

  v_net_payout_usd := v_total_collected_usd - v_total_delivery_usd;
  v_net_payout_lbp := v_total_collected_lbp - v_total_delivery_lbp;

  -- Create the invoice (trigger will set invoice_id)
  INSERT INTO invoices (
    merchant_name,
    total_amount_usd,
    total_amount_lbp,
    total_delivery_usd,
    total_delivery_lbp,
    net_payout_usd,
    net_payout_lbp,
    status,
    created_by
  ) VALUES (
    v_merchant_name,
    v_total_collected_usd,
    v_total_collected_lbp,
    v_total_delivery_usd,
    v_total_delivery_lbp,
    v_net_payout_usd,
    v_net_payout_lbp,
    'Pending',
    auth.uid()
  ) RETURNING id INTO v_invoice_id;

  -- Create invoice items and update orders
  FOR v_order_record IN 
    SELECT 
      id,
      COALESCE(collected_amount_usd, 0) as collected_usd,
      COALESCE(collected_amount_lbp, 0) as collected_lbp,
      COALESCE(delivery_fees_usd, 0) as delivery_usd,
      COALESCE(delivery_fees_lbp, 0) as delivery_lbp
    FROM orders 
    WHERE id = ANY(p_order_ids)
  LOOP
    -- Insert invoice item
    INSERT INTO invoice_items (
      invoice_id,
      order_id,
      amount_collected_usd,
      amount_collected_lbp,
      delivery_fee_usd,
      delivery_fee_lbp,
      net_payout_usd,
      net_payout_lbp
    ) VALUES (
      v_invoice_id,
      v_order_record.id,
      v_order_record.collected_usd,
      v_order_record.collected_lbp,
      v_order_record.delivery_usd,
      v_order_record.delivery_lbp,
      v_order_record.collected_usd - v_order_record.delivery_usd,
      v_order_record.collected_lbp - v_order_record.delivery_lbp
    );
    
    -- Update order status
    UPDATE orders 
    SET 
      invoice_id = v_invoice_id,
      payment_status = 'in_progress',
      updated_at = now()
    WHERE id = v_order_record.id;
  END LOOP;

  -- Return the created invoice
  SELECT to_jsonb(i.*) INTO v_invoice_record
  FROM invoices i
  WHERE i.id = v_invoice_id;

  RETURN v_invoice_record;
END;
$$;

-- Function to mark invoice as paid
CREATE OR REPLACE FUNCTION public.mark_invoice_as_paid(p_invoice_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invoice_record jsonb;
  v_order_ids uuid[];
BEGIN
  -- Check if invoice exists and is not already paid
  IF NOT EXISTS (SELECT 1 FROM invoices WHERE id = p_invoice_id) THEN
    RAISE EXCEPTION 'not found: Invoice not found';
  END IF;
  
  -- Check if already paid
  IF EXISTS (SELECT 1 FROM invoices WHERE id = p_invoice_id AND status = 'Paid') THEN
    RAISE EXCEPTION 'already paid: Invoice is already marked as paid';
  END IF;

  -- Update invoice status
  UPDATE invoices 
  SET 
    status = 'Paid',
    updated_at = now()
  WHERE id = p_invoice_id;

  -- Get all order IDs from invoice items
  SELECT array_agg(order_id) INTO v_order_ids
  FROM invoice_items
  WHERE invoice_id = p_invoice_id;

  -- Update all orders to paid status
  IF v_order_ids IS NOT NULL THEN
    UPDATE orders 
    SET 
      payment_status = 'paid',
      updated_at = now()
    WHERE id = ANY(v_order_ids);
  END IF;

  -- Return updated invoice
  SELECT to_jsonb(i.*) INTO v_invoice_record
  FROM invoices i
  WHERE i.id = p_invoice_id;

  RETURN v_invoice_record;
END;
$$;