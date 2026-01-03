export default class User {
  constructor({
    id = null,
    tenant_id = null,
    username = "",
    email = "",
    password = null,
    admin = false,
    signature = null,
    remember = false,
  } = {}) {
    this.id = id;
    this.tenant_id = tenant_id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.admin = admin;
    this.signature = signature;
    this.remember = remember;
  }

  static fromRequestLogin(body = {}) {
    return new User({
      username: body.username,
      password: body.password,
      remember: body.remember || false,
    });
  }

  static fromRequest(body = {}) {
    return new User({
      id: body.id || null,
      tenant_id: body.tenant_id || body.tenant || null,
      username: body.username,
      email: body.email,
      password: body.password || body.passwordHash || null,
      admin: typeof body.admin !== "undefined" ? body.admin : false,
      signature: body.signature || null,
    });
  }

  static fromRequestParams(params = {}) {
    return new User({
      id: params.id
    });
  }

  toJSON() {
    return {
      id: this.id,
      tenant_id: this.tenant_id,
      username: this.username,
      email: this.email,
      admin: this.admin,
      signature: this.signature,
    };
  }
}
