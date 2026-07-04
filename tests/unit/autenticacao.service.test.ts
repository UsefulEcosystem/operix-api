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

  test('cadastrar cria tenant e usuário local proprietário', async () => {
    jest.spyOn(PoliticaLocatarioService, 'comBloqueioProvisionamentoLocatario').mockImplementation(async (callback: any) => callback());
    jest.spyOn(PoliticaLocatarioService, 'assertLocatarioCanBeCreated').mockResolvedValue(undefined as never);
    jest.spyOn(LocatarioRepository, 'findByName').mockResolvedValue(null);
    jest.spyOn(UsuariosRepository, 'findByLogin').mockResolvedValue(null);
    jest.spyOn(LocatarioRepository, 'criar').mockResolvedValue({
      id: 11,
      name: 'Onboarding Ltda',
      cnpj: '123',
      description: 'Teste',
    } as any);
    jest.spyOn(UsuariosRepository, 'criar').mockResolvedValue({
      id: 22,
      name: 'Admin User',
      username: 'admin.user',
      email: 'admin@operix.dev',
      tenant_id: 11,
      admin: true,
      root: true,
    } as any);

    const result = await AutenticacaoService.cadastrar({
      company_name: 'Onboarding Ltda',
      name: 'Admin User',
      username: 'admin.user',
      email: 'admin@operix.dev',
      password: 'secret123',
      cnpj: '123',
      description: 'Teste',
    });

    expect(UsuariosRepository.criar).toHaveBeenCalledWith(expect.objectContaining({
      tenant_id: 11,
      name: 'Admin User',
      username: 'admin.user',
      email: 'admin@operix.dev',
      admin: true,
      root: true,
    }));
    expect(result).toEqual(expect.objectContaining({
      tenant_id: 11,
      admin: true,
      root: true,
    }));
  });
});
