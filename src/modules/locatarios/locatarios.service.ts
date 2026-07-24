import ErroValidacao from '../../core/utils/erro-validacao.js';
import LocatarioModel from './locatarios.model.js';
import LocatariosRepository from './locatarios.repository.js';
import PoliticaLocatarioService from './politica-locatario.service.js';

class LocatariosService {
  static async obterTodos() {
    return LocatariosRepository.obterTodos();
  }

  static async criar(tenant: LocatarioModel) {
    return PoliticaLocatarioService.comBloqueioProvisionamentoLocatario(async () => {
      await PoliticaLocatarioService.assertLocatarioCanBeCreated();

      const tenantName = tenant.name.trim();
      const existingTenant = await LocatariosRepository.findByName(tenantName);
      if (existingTenant) {
        throw new ErroValidacao('Unidade já cadastrada.', 409);
      }

      return LocatariosRepository.criar(LocatarioModel.deRequisicao({
        name: tenantName,
        cnpj: tenant.cnpj,
        description: tenant.description,
      }));
    });
  }

  static async remover(id: number) {
    const isRemoved = await LocatariosRepository.remover(id);
    if (!isRemoved) {
      throw new ErroValidacao('Unidade não encontrada.', 404);
    }
    return true;
  }

  static async atualizar(id: number | null | undefined, tenant: LocatarioModel) {
    if (!id) {
      throw new ErroValidacao('Tenant do usuário autenticado não encontrado.', 422);
    }

    const existingTenant = await LocatariosRepository.findById(id);
    if (!existingTenant) {
      throw new ErroValidacao('Unidade não encontrada.', 404);
    }

    const tenantName = tenant.name?.trim();
    if (tenantName && tenantName.toLowerCase() !== existingTenant.name.toLowerCase()) {
      const tenantByName = await LocatariosRepository.findByName(tenantName);
      if (tenantByName && tenantByName.id !== id) {
        throw new ErroValidacao('Unidade já cadastrada.', 409);
      }
    }

    return LocatariosRepository.atualizar(id, {
      name: tenantName || existingTenant.name,
      cnpj: tenant.cnpj ?? existingTenant.cnpj,
      description: tenant.description ?? existingTenant.description,
      logo_url: tenant.logo_url ?? existingTenant.logo_url,
      enabled_modules: tenant.enabled_modules ?? existingTenant.enabled_modules,
    });
  }
}

export default LocatariosService;
