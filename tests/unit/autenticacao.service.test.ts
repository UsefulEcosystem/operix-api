import AutenticacaoService from '../../src/core/autenticacao/autenticacao.service.js';
import LocatarioRepository from '../../src/core/perfil/locatarios/locatarios.repository.js';
import UsuariosRepository from '../../src/core/perfil/usuarios/usuarios.repository.js';
import PoliticaLocatarioService from '../../src/core/perfil/locatarios/politica-locatario.service.js';
import { sanitizarUsuario } from '../../src/core/utils/sanitizar.js';

describe('AutenticacaoService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('sanitizarUsuario usa id local como fallback para sub', () => {
    const result = sanitizarUsuario({
      id: 22,
      username: 'google.user',
    });

    expect(result).toEqual(expect.objectContaining({
      id: 22,
      sub: '22',
      username: 'google.user',
    }));
  });

  test('registrar cria tenant e usuário local proprietário', async () => {
    jest.spyOn(PoliticaLocatarioService, 'comBloqueioProvisionamentoLocatario').mockImplementation(async (callback: any) => callback());
    jest.spyOn(PoliticaLocatarioService, 'assertLocatarioCanBeCreated').mockResolvedValue(undefined as never);
    jest.spyOn(UsuariosRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(LocatarioRepository, 'criar').mockResolvedValue({
      id: 11,
      name: 'admin',
    } as any);
    jest.spyOn(UsuariosRepository, 'criar').mockResolvedValue({
      id: 22,
      name: 'admin',
      username: 'user_123',
      email: 'admin@operix.dev',
      tenant_id: 11,
      admin: true,
      root: true,
      active: true,
    } as any);
    jest.spyOn(AutenticacaoService as any, 'criarSessao').mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
      user: { id: 22, email: 'admin@operix.dev' },
    } as any);

    const result = await AutenticacaoService.registrar({
      email: 'admin@operix.dev',
      password: 'secret123',
      confirm_password: 'secret123',
    });

    expect(UsuariosRepository.criar).toHaveBeenCalledWith(expect.objectContaining({
      tenant_id: 11,
      email: 'admin@operix.dev',
      admin: true,
      root: true,
    }));
    expect(result).toEqual(expect.objectContaining({
      token: 'access-token',
      is_new_user: true,
    }));
  });
});
