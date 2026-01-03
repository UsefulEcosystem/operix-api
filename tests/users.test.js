import request from 'supertest';
import appModule from '../src/app.js';
import connection from '../src/database/connection.js';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(() => Promise.resolve('salt')),
  hash: jest.fn(() => Promise.resolve('hashed')),
  compare: jest.fn(() => Promise.resolve(true))
}));

const { app } = appModule;

beforeAll(() => {
  process.env.SECRET = 'testsecret';
});

afterEach(() => {
  jest.resetAllMocks();
});

function mockConnectWithResponses(responder) {
  const query = jest.fn((sql, params) => {
    return Promise.resolve(responder(sql, params));
  });
  const release = jest.fn();
  connection.connect = jest.fn().mockResolvedValue({ query, release });
  return { query, release };
}

describe('Users routes (integration-ish, DB mocked)', () => {
  test('POST /users - missing username returns 400', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'a@b.com', password: '123', confirmPassword: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: 'Campo "Nome de Usuário" é obrigatório.' });
  });

  test('POST /users - success (controller->service->repo)', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('WHERE email')) return { rowCount: 0, rows: [] };
      if (sql.includes('WHERE username')) return { rowCount: 0, rows: [] };
      if (sql.startsWith('INSERT INTO users')) return { rows: [{ id: 1, username: 'u' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await request(app)
      .post('/users')
      .send({ username: 'u', email: 'a@b.com', password: '123', confirmPassword: '123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, username: 'u' }]);
  });

  test('POST /users/login - missing password returns 400', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ username: 'u' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: 'Campo "Senha" é obrigatório.' });
  });

  test('POST /users/login - success returns token and user', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('WHERE username')) return { rows: [{ id: 1, username: 'u', password: 'hashed', admin: false }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await request(app)
      .post('/users/login')
      .send({ username: 'u', password: '123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual(expect.objectContaining({ id: 1, username: 'u', admin: false }));
  });

  test('GET /users - requires auth', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ msg: 'Acesso Negado!' });
  });

  test('GET /users - authorized returns list', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT id, username, email, admin, signature FROM users')) return { rows: [{ id: 1, username: 'u' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const token = jwt.sign({ id: 1, username: 'u', admin: false }, process.env.SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, username: 'u' }]);
  });

  test('GET /users/signature/:id - authorized returns signature', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT signature FROM users')) return { rows: [{ signature: 'base64sig' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const token = jwt.sign({ id: 1, username: 'u', admin: false }, process.env.SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .get('/users/signature/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBe('base64sig');
  });

  test('DELETE /users/:id - user not found', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('WHERE id =')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const token = jwt.sign({ id: 1, username: 'u', admin: false }, process.env.SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .delete('/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: 'Usuário não encontrado.' });
  });

  test('DELETE /users/:id - admin cannot be removed', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('WHERE id =')) return { rows: [{ admin: true }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const token = jwt.sign({ id: 1, username: 'u', admin: true }, process.env.SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .delete('/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);
    expect(res.body).toEqual({ msg: 'Usuário administrador não pode ser removido.' });
  });

  test('DELETE /users/:id - success returns 204', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('WHERE id =')) return { rows: [{ admin: false }], rowCount: 1 };
      if (sql.startsWith('DELETE FROM users')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const token = jwt.sign({ id: 1, username: 'u', admin: false }, process.env.SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .delete('/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
