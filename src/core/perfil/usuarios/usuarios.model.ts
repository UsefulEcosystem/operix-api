export default class UsuarioModel {
  id: number | null;
  username: string;
  email: string;
  name: string;
  tenant?: string | null;
  tenant_id: number | null;
  password?: string | null;
  admin?: boolean | null;
  root?: boolean | null;
  avatar_url?: string | null;
  role_title?: string | null;
  active?: boolean | null;
  preferences?: Record<string, unknown> | null;

  constructor({
    id = null,
    username = '',
    email = '',
    tenant_id = null,
    password = null,
    admin = false,
    root = false,
    avatar_url = null,
    role_title = null,
    active = true,
    preferences = {},
    tenant = null,
    name = ''
  }: any = {}) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.tenant_id = tenant_id;
    this.password = password;
    this.admin = admin;
    this.root = root;
    this.avatar_url = avatar_url;
    this.role_title = role_title;
    this.active = active;
    this.preferences = preferences;
    this.tenant = tenant;
    this.name = name;
  }

  static deRequisicao(body: any = {}): UsuarioModel {
    return new UsuarioModel(
      {
        tenant_id: body.tenant_id || null,
        id: body.id || null,
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
        tenant: body.tenant,
        admin: body.admin || false,
        root: body.root || false,
        avatar_url: body.avatar_url || null,
        role_title: body.role_title || null,
        active: body.active ?? true,
        preferences: body.preferences || {},
      }
    );
  }

  static deParametrosRequisicao(params: any = {}): UsuarioModel {
    return new UsuarioModel({ id: params.id });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      username: this.username,
      email: this.email,
      tenant: this.tenant,
      tenant_id: this.tenant_id,
      admin: this.admin,
      root: this.root,
      avatar_url: this.avatar_url,
      role_title: this.role_title,
      active: this.active,
      preferences: this.preferences,
    };
  }
}
