import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerEstoqueDocs } from '../../modules/estoque/estoque.docs.js';
import { registerVendasDocs } from '../../modules/vendas/vendas.docs.js';
import { registerServicosDocs } from '../../modules/servicos/servicos.docs.js';
import { registerOrdensServicoDocs } from '../../modules/ordens-servico/ordens-servico.docs.js';
import { registerStatusServicoDocs } from '../../modules/status-servico/status-servico.docs.js';
import { registerStatusPagamentoDocs } from '../../modules/status-pagamento/status-pagamento.docs.js';
import { registerTiposProdutoDocs } from '../../modules/tipos-produto/tipos-produto.docs.js';
import { registerNotificacoesDocs } from '../../modules/notificacoes/notificacoes.docs.js';
import { registerPecasServicoDocs } from '../../modules/pecas-servico/pecas-servico.docs.js';
import { registerAuthDocs } from '../autenticacao/docs/autenticacao.docs.js';
import { registerProfileDocs } from '../../modules/perfil/perfil.docs.js';
import { registerLogsDocs } from '../logs/logs.docs.js';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registerServicosDocs(registry);
registerOrdensServicoDocs(registry);
registerStatusServicoDocs(registry);
registerStatusPagamentoDocs(registry);
registerTiposProdutoDocs(registry);
registerEstoqueDocs(registry);
registerVendasDocs(registry);
registerPecasServicoDocs(registry);
registerProfileDocs(registry);
registerNotificacoesDocs(registry);
registerAuthDocs(registry);
registerLogsDocs(registry);

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.1.0',
      title: 'Opeflow API',
      description: 'API RESTful do sistema de gestão Opeflow com autenticação JWT, documentação OpenAPI e isolamento por locatário.',
      contact: {
        name: 'João Pedro P. Lima',
        email: 'devx.contato@gmail.com',
      },
    },
    tags: [
      { name: 'Autenticação', description: '[Core:Auth] Endpoints de login, cadastro de usuário e renovação de token via integração com Keycloak.' },
      { name: 'Usuários', description: '[Módulo:Usuários] Endpoints de usuários vinculados ao tenant autenticado.' },
      { name: 'Unidades', description: '[Módulo:Locatários] Endpoints de gerenciamento das unidades da aplicação.' },
      { name: 'Permissões', description: '[Core:Permissões] Resolução de permissões efetivas, catálogo e overrides por usuário.' },
      { name: 'Logs', description: '[Core:Logs] Endpoints para consulta paginada de logs e rastreamento de eventos da aplicação.' },
      { name: 'Estoque', description: 'Cadastro, listagem, atualização e remoção de itens de estoque.' },
      { name: 'Vendas', description: 'Registro e consulta de vendas.' },
      { name: 'Notificações', description: 'Alertas internos derivados do estado dos serviços.' },
      { name: 'Serviços', description: 'Gerenciamento dos serviços prestados.' },
      { name: 'Peças de Serviço', description: 'Registro de peças aplicadas aos serviços.' },
      { name: 'Ordens de Serviço', description: 'Consulta e manutenção de ordens de serviço e orçamentos.' },
      { name: 'Status de Serviço', description: 'Status utilizados no ciclo dos serviços.' },
      { name: 'Status de Pagamento', description: 'Status de pagamento aplicados aos serviços.' },
      { name: 'Tipos de Produto', description: 'Tipos de produto atendidos pelos serviços.' },
    ],
    servers: [
      { url: 'http://localhost:3333/api', description: 'Ambiente local' },
    ],
  });
}
