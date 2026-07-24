import TiposProdutoRepository from './tipos-produto.repository.js';
import type { TypeProductCreateDto } from './tipos-produto.dto.js';

class TiposProdutoService {
  static async obterTodos(tenantId: number) { return TiposProdutoRepository.obterTodos(tenantId); }
  static async criar(tenantId: number, typeProduct: TypeProductCreateDto) { return TiposProdutoRepository.criar(tenantId, typeProduct); }
  static async remover(id: number, tenantId: number) { return TiposProdutoRepository.remover(id, tenantId); }
}

export default TiposProdutoService;
