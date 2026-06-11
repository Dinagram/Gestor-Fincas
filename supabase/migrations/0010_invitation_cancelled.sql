-- =====================================================================
-- 0010 — Invitation soft-cancel support
-- =====================================================================
-- Adds cancelled_at to invitations so admins can revoke pending invites
-- without losing audit history. A cancelled invite shows "Cancelada" in
-- the UI and its token is rejected by acceptInvitation.
-- =====================================================================

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

COMMENT ON COLUMN public.invitations.cancelled_at
  IS 'Set when an admin cancels the invitation. NULL = not cancelled.';

-- Replace the old partial index (only filtered on used_at IS NULL)
-- with one that also excludes cancelled invitations.
DROP INDEX IF EXISTS idx_invitations_pending;

CREATE INDEX idx_invitations_pending
  ON public.invitations (email)
  WHERE used_at IS NULL AND cancelled_at IS NULL;

-- Useful for listing active invitations per community.
CREATE INDEX idx_invitations_community_active
  ON public.invitations (community_id)
  WHERE used_at IS NULL AND cancelled_at IS NULL;
