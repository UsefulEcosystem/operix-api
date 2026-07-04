import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: string;
      email: string;
      name?: string | null;
      username?: string | null;
      preferred_username: string;
      tenant_id: number | null;
      roles: string[];
      permissions?: string[];
      admin?: boolean;
      root?: boolean;
      onboarding_required?: boolean;
      id?: number;
    };
  }
}
