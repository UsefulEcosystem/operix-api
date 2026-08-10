import AuditRepository, { type AuditLogInput } from './audit.repository.js';

export default class AuditService {
  static registrar(data: AuditLogInput) {
    void AuditRepository.inserir(data);
  }
}
