-- Community generic invite links (one active at a time per community)
CREATE TABLE community_invite_links (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id   uuid        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  token          text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  role           member_role NOT NULL DEFAULT 'propietario',
  expires_at     timestamptz NOT NULL DEFAULT now() + interval '48 hours',
  created_by     uuid        NOT NULL REFERENCES profiles(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  invalidated_at timestamptz
);

ALTER TABLE community_invite_links ENABLE ROW LEVEL SECURITY;

-- Admins and junta can manage links for their own community
CREATE POLICY "community_invite_links_manage" ON community_invite_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_invite_links.community_id
        AND profile_id = auth.uid()
        AND role IN ('admin_finca', 'junta', 'superadmin')
        AND status = 'active'
    )
  );

CREATE INDEX idx_community_invite_links_community
  ON community_invite_links (community_id)
  WHERE invalidated_at IS NULL;
