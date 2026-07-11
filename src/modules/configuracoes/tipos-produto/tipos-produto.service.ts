// @ts-nocheck
import TiposProdutoRepository from './tipos-produto.repository.ts';

class TiposProdutoService {
  static async obterTodos(tenant_id) { return TiposProdutoRepository.obterTodos(tenant_id); }
  static async criar(typeProduct) { return TiposProdutoRepository.criar(typeProduct); }
  static async remover(id, tenant_id) { return TiposProdutoRepository.remover(id, tenant_id); }
}

export default TiposProdutoService;
