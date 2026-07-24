// @ts-nocheck
import EstoqueRepository from './estoque.repository.js';
import type { StockWriteDto } from './estoque.dto.js';

class EstoqueService {
  static async obterTodos(tenantId: number) { return EstoqueRepository.obterTodos(tenantId); }
  static async criar(tenantId: number, stock: StockWriteDto) { return EstoqueRepository.criar(tenantId, stock); }
  static async atualizar(id: number, tenantId: number, data: StockWriteDto) { return EstoqueRepository.atualizar(id, tenantId, data); }
  static async remover(id: number, tenantId: number) { return EstoqueRepository.remover(id, tenantId); }
}

export default EstoqueService;
