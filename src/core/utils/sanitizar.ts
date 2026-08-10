type UserLike = {
  id?: number | string | null;
  sub?: string | null;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  tenant?: string | null;
  tenant_id?: number | null;
  admin?: boolean | null;
  root?: boolean | null;
  onboarding_completed_at?: string | Date | null;
  roles?: string[] | null;
  avatar_url?: string | null;
  role_title?: string | null;
  role_id?: number | null;
  role_name?: string | null;
  active?: boolean | null;
  preferences?: Record<string, unknown> | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export function sanitizarUsuario(user: UserLike | null | undefined) {
  if (!user) {
    return null;
  }

  return {
    id: user.id ?? null,
    sub: user.sub ?? (user.id != null ? String(user.id) : null),
    name: user.name ?? null,
    username: user.username ?? null,
    email: user.email ?? null,
    tenant: user.tenant ?? null,
    tenant_id: user.tenant_id ?? null,
    admin: Boolean(user.admin),
    root: Boolean(user.root),
    onboarding_required: !user.onboarding_completed_at,
    roles: user.roles || [],
    avatar_url: user.avatar_url ?? null,
    role_title: user.role_title ?? null,
    role_id: user.role_id ?? null,
    role_name: user.role_name ?? user.role_title ?? null,
    active: user.active ?? true,
    preferences: user.preferences || {},
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
}
