'use client';

import * as React from 'react';

import type { Role } from '@/lib/permissions';

export interface CommunityContextValue {
  communityId: string;
  communityName: string;
  role: Role;
}

const CommunityContext = React.createContext<CommunityContextValue | null>(null);

export function CommunityProvider({
  value,
  children,
}: {
  value: CommunityContextValue;
  children: React.ReactNode;
}) {
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = React.useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used inside CommunityProvider');
  return ctx;
}

export function useRole() {
  return useCommunity().role;
}
