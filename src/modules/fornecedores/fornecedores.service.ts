import ErroValidacao from '../../core/utils/erro-validacao.js';
import FornecedoresRepository from './fornecedores.repository.js';
import type { FornecedorWriteDto } from './fornecedores.dto.js';
export default class FornecedoresService {
  static listar(t: number) { return FornecedoresRepository.listar(t); }
  static criar(t: number, d: FornecedorWriteDto) { return FornecedoresRepository.criar(t, d); }
  static async atualizar(id: number, t: number, d: FornecedorWriteDto) { const r = await FornecedoresRepository.atualizar(id, t, d); if (!r) throw new ErroValidacao('Fornecedor não encontrado.', 404); return r; }
  static async remover(id: number, t: number) { const r = await FornecedoresRepository.remover(id, t); if (!r) throw new ErroValidacao('Fornecedor não encontrado.', 404); return r; }
}
