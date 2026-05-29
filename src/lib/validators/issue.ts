import { z } from 'zod';

import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/lib/constants';

export const issueCategorySchema = z.enum(ISSUE_CATEGORIES as [string, ...string[]]);
export const issuePrioritySchema = z.enum(ISSUE_PRIORITIES as [string, ...string[]]);
export const issueStatusSchema = z.enum(ISSUE_STATUSES as [string, ...string[]]);

export const createIssueSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(160),
  description: z.string().max(4000).optional().default(''),
  category: issueCategorySchema.default('otros'),
  priority: issuePrioritySchema.default('media'),
  location: z.string().max(160).optional().default(''),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

export const commentIssueSchema = z.object({
  issueId: z.string().uuid(),
  body: z.string().min(1, 'El mensaje no puede estar vacío').max(4000),
});

export type CommentIssueInput = z.infer<typeof commentIssueSchema>;

export const changeStatusSchema = z.object({
  issueId: z.string().uuid(),
  newStatus: issueStatusSchema,
  note: z.string().max(500).optional(),
});

export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
