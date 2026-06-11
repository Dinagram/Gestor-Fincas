-- Migration 0009: cuota mensual y estado de pago por vecino
ALTER TABLE community_members
  ADD COLUMN IF NOT EXISTS monthly_fee    numeric(8,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text         NOT NULL DEFAULT 'al_dia'
    CONSTRAINT chk_payment_status
    CHECK (payment_status IN ('al_dia', 'moroso', 'pendiente'));

COMMENT ON COLUMN community_members.monthly_fee    IS 'Cuota mensual (€) asignada a este miembro.';
COMMENT ON COLUMN community_members.payment_status IS 'Estado de pago: al_dia | moroso | pendiente.';
