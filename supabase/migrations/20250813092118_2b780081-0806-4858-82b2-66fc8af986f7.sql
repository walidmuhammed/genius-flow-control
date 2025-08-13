-- Create phone normalization function
CREATE OR REPLACE FUNCTION util_normalize_phone_e164(in_raw text) 
RETURNS text 
LANGUAGE plpgsql AS $$
DECLARE 
  n text;
BEGIN
  n := regexp_replace(in_raw, '[^0-9+]', '', 'g');
  
  IF n LIKE '+961%' THEN
    RETURN '+961' || regexp_replace(substring(n from 5), '^0+', '');
  END IF;
  
  IF n LIKE '961%' THEN
    RETURN '+' || n;
  END IF;
  
  IF n LIKE '0%' THEN
    RETURN '+961' || regexp_replace(n, '^0+', '');
  END IF;
  
  RETURN n;
END;
$$;

-- Ensure clients table has phone_e164 column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone_e164 text;

-- Update phone_e164 for existing clients
UPDATE clients 
SET phone_e164 = util_normalize_phone_e164(COALESCE(phone, phone_e164)) 
WHERE phone_e164 IS DISTINCT FROM util_normalize_phone_e164(COALESCE(phone, phone_e164));

-- Create unique index on phone_e164
CREATE UNIQUE INDEX IF NOT EXISTS ux_clients_phone_e164 ON clients (phone_e164) WHERE phone_e164 IS NOT NULL;

-- Ensure DimoXi client exists
INSERT INTO clients (id, name, phone, phone_e164) 
VALUES (gen_random_uuid(), 'DimoXi', '+96171387897', '+96171387897') 
ON CONFLICT (phone_e164) DO UPDATE SET name = EXCLUDED.name;

-- Create client pricing tables if they don't exist
CREATE TABLE IF NOT EXISTS client_pricing_defaults (
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  currency text NOT NULL,
  base_fee numeric NOT NULL,
  PRIMARY KEY (client_id, currency)
);

CREATE TABLE IF NOT EXISTS client_pricing_zone_rules (
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  zone_id uuid NOT NULL,
  currency text NOT NULL,
  base_fee numeric NOT NULL,
  PRIMARY KEY (client_id, zone_id, currency)
);

CREATE TABLE IF NOT EXISTS client_pricing_package_extras (
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  package_type text NOT NULL,
  currency text NOT NULL,
  extra_fee numeric NOT NULL,
  PRIMARY KEY (client_id, package_type, currency)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cpz_client_zone_currency ON client_pricing_zone_rules (client_id, zone_id, currency);
CREATE INDEX IF NOT EXISTS idx_cppx_client_pkg_currency ON client_pricing_package_extras (client_id, package_type, currency);

-- Create zones if they don't exist
INSERT INTO governorates (id, name) 
SELECT gen_random_uuid(), 'WEWE' 
WHERE NOT EXISTS (SELECT 1 FROM governorates WHERE name = 'WEWE');

INSERT INTO governorates (id, name) 
SELECT gen_random_uuid(), 'WDWDW' 
WHERE NOT EXISTS (SELECT 1 FROM governorates WHERE name = 'WDWDW');

-- Insert DimoXi pricing configuration
WITH dimoxi_client AS (
  SELECT id FROM clients WHERE phone_e164 = '+96171387897' LIMIT 1
)
INSERT INTO client_pricing_defaults (client_id, currency, base_fee)
SELECT id, 'USD', 8888888 FROM dimoxi_client
ON CONFLICT (client_id, currency) DO UPDATE SET base_fee = EXCLUDED.base_fee;

WITH dimoxi_client AS (
  SELECT id FROM clients WHERE phone_e164 = '+96171387897' LIMIT 1
)
INSERT INTO client_pricing_defaults (client_id, currency, base_fee)
SELECT id, 'LBP', 0 FROM dimoxi_client
ON CONFLICT (client_id, currency) DO UPDATE SET base_fee = EXCLUDED.base_fee;

-- Insert zone rules for DimoXi
WITH dimoxi_client AS (
  SELECT id FROM clients WHERE phone_e164 = '+96171387897' LIMIT 1
),
wewe_zone AS (
  SELECT id FROM governorates WHERE name = 'WEWE' LIMIT 1
)
INSERT INTO client_pricing_zone_rules (client_id, zone_id, currency, base_fee)
SELECT c.id, z.id, 'USD', 56565 FROM dimoxi_client c, wewe_zone z
ON CONFLICT (client_id, zone_id, currency) DO UPDATE SET base_fee = EXCLUDED.base_fee;

WITH dimoxi_client AS (
  SELECT id FROM clients WHERE phone_e164 = '+96171387897' LIMIT 1
),
wdwdw_zone AS (
  SELECT id FROM governorates WHERE name = 'WDWDW' LIMIT 1
)
INSERT INTO client_pricing_zone_rules (client_id, zone_id, currency, base_fee)
SELECT c.id, z.id, 'USD', 909090909090 FROM dimoxi_client c, wdwdw_zone z
ON CONFLICT (client_id, zone_id, currency) DO UPDATE SET base_fee = EXCLUDED.base_fee;

-- Insert package extras for DimoXi
WITH dimoxi_client AS (
  SELECT id FROM clients WHERE phone_e164 = '+96171387897' LIMIT 1
)
INSERT INTO client_pricing_package_extras (client_id, package_type, currency, extra_fee)
SELECT id, 'Bulky', 'USD', 67 FROM dimoxi_client
ON CONFLICT (client_id, package_type, currency) DO UPDATE SET extra_fee = EXCLUDED.extra_fee;

-- Create RPC function for effective pricing
CREATE OR REPLACE FUNCTION rpc_get_effective_pricing(
  p_client_id uuid,
  p_client_phone text,
  p_zone_id uuid,
  p_package_type text,
  p_currency text
) 
RETURNS TABLE(
  base numeric,
  extras numeric,
  source_base text,
  source_extras text,
  resolved_client_id uuid
) 
LANGUAGE plpgsql AS $$
DECLARE
  v_client uuid;
  v_base numeric := NULL;
  v_extras numeric := 0;
  v_source_base text := 'Global Default';
  v_source_extras text := 'None';
BEGIN
  -- Resolve client ID
  IF p_client_id IS NOT NULL THEN
    v_client := p_client_id;
  ELSIF p_client_phone IS NOT NULL THEN
    SELECT id INTO v_client 
    FROM clients 
    WHERE phone_e164 = util_normalize_phone_e164(p_client_phone) 
    LIMIT 1;
  END IF;

  -- Get global base as fallback
  SELECT default_fee_usd INTO v_base 
  FROM pricing_global 
  WHERE (p_currency = 'USD')
  ORDER BY updated_at DESC 
  LIMIT 1;
  
  IF p_currency = 'LBP' THEN
    SELECT default_fee_lbp INTO v_base 
    FROM pricing_global 
    ORDER BY updated_at DESC 
    LIMIT 1;
  END IF;

  -- Override with client default if exists
  IF v_client IS NOT NULL THEN
    SELECT base_fee INTO v_base 
    FROM client_pricing_defaults 
    WHERE client_id = v_client AND currency = p_currency 
    LIMIT 1;
    
    IF FOUND THEN
      v_source_base := 'Client Default';
    END IF;
  END IF;

  -- Override with client zone rule if exists
  IF v_client IS NOT NULL AND p_zone_id IS NOT NULL THEN
    SELECT base_fee INTO v_base 
    FROM client_pricing_zone_rules 
    WHERE client_id = v_client AND zone_id = p_zone_id AND currency = p_currency 
    LIMIT 1;
    
    IF FOUND THEN
      v_source_base := 'Client Zone';
    END IF;
  END IF;

  -- Get package extras
  IF p_package_type IS NOT NULL THEN
    -- Try client-specific extras first
    IF v_client IS NOT NULL THEN
      SELECT extra_fee INTO v_extras 
      FROM client_pricing_package_extras 
      WHERE client_id = v_client AND package_type = p_package_type AND currency = p_currency 
      LIMIT 1;
      
      IF FOUND THEN
        v_source_extras := 'Client Extras';
      END IF;
    END IF;
    
    -- Fallback to global extras if no client-specific found
    IF v_extras = 0 THEN
      SELECT CASE 
        WHEN p_currency = 'USD' THEN extra_usd 
        ELSE extra_lbp 
      END INTO v_extras
      FROM pricing_package_extras_global 
      WHERE package_type = p_package_type 
      LIMIT 1;
      
      IF FOUND AND v_extras > 0 THEN
        v_source_extras := 'Global Extras';
      END IF;
    END IF;
  END IF;

  RETURN QUERY SELECT 
    COALESCE(v_base, 0) AS base,
    COALESCE(v_extras, 0) AS extras,
    v_source_base AS source_base,
    v_source_extras AS source_extras,
    v_client AS resolved_client_id;
END;
$$;

-- Enable RLS on client pricing tables
ALTER TABLE client_pricing_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_pricing_zone_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_pricing_package_extras ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY IF NOT EXISTS service_read_cp_default ON client_pricing_defaults 
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS service_read_cp_zone ON client_pricing_zone_rules 
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS service_read_cp_extra ON client_pricing_package_extras 
FOR SELECT USING (true);