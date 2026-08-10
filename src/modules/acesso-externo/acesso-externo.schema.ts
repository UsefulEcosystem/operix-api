import { z } from '../../core/schemas/zod-openapi.js';
export const externalTokenSchema = z.object({ token: z.string().min(32) });
