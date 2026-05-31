ALTER TABLE announcement_reads
  ADD COLUMN IF NOT EXISTS acknowledged_from_ip inet;

COMMENT ON COLUMN announcement_reads.acknowledged_from_ip IS
  'IP del cliente en el momento del acuse. Trazabilidad legal.';
