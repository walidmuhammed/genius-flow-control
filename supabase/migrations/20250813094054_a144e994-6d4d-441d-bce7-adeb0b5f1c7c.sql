-- Recreate the client pricing data that was lost
INSERT INTO pricing_client_defaults (client_id, default_fee_usd, default_fee_lbp, created_by) 
VALUES ('26bad2b5-2a9a-47de-8969-c2ee0eaf8f4a', 8888888, 0, '8f46815a-9a71-4321-a229-1f78bbe57afd')
ON CONFLICT (client_id) DO UPDATE SET 
  default_fee_usd = EXCLUDED.default_fee_usd,
  default_fee_lbp = EXCLUDED.default_fee_lbp,
  updated_at = now();

INSERT INTO pricing_client_package_extras (client_id, package_type, extra_fee_usd, extra_fee_lbp, created_by)
VALUES ('26bad2b5-2a9a-47de-8969-c2ee0eaf8f4a', 'Bulky', 67, 0, '8f46815a-9a71-4321-a229-1f78bbe57afd')
ON CONFLICT (client_id, package_type) DO UPDATE SET
  extra_fee_usd = EXCLUDED.extra_fee_usd,
  extra_fee_lbp = EXCLUDED.extra_fee_lbp,
  updated_at = now();