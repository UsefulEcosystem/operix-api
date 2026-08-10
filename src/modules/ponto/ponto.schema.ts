import { z } from '../../core/schemas/zod-openapi.js';
export const timeEntryCloseSchema = z.object({ notes: z.string().max(1000).optional().nullable() });
export const adjustmentSchema = z.object({ started_at: z.string().datetime(), ended_at: z.string().datetime().optional().nullable(), reason: z.string().trim().min(5).max(1000) });
export const reviewSchema = z.object({ status: z.enum(['approved','rejected']) });
