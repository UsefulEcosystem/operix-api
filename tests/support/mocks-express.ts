export function criarRequestMock({
  body = {},
  params = {},
  headers = {},
  user = undefined,
  ip = '127.0.0.1',
}: {
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  user?: any;
  ip?: string;
} = {}) {
  return {
    body,
    params,
    headers,
    user,
    ip,
    socket: { remoteAddress: ip },
  } as any;
}

export function criarResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}
