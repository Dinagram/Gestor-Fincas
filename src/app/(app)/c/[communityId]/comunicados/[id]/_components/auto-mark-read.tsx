'use client';

import { useEffect } from 'react';

import { markAnnouncementRead } from '@/actions/announcements';

interface Props {
  communityId: string;
  announcementId: string;
}

export function AutoMarkRead({ communityId, announcementId }: Props) {
  useEffect(() => {
    markAnnouncementRead(communityId, announcementId).catch(() => {});
  }, [communityId, announcementId]);

  return null;
}
