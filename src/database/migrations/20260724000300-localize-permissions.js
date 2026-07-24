/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM user_permission_overrides
      WHERE permission_key = 'inventory.warranties.access'
    `);

    await queryInterface.sequelize.query(`
      UPDATE user_permission_overrides
      SET permission_key = CASE permission_key
        WHEN 'dashboard.access' THEN 'painel.acesso'
        WHEN 'operational.services.access' THEN 'servicos.acesso'
        WHEN 'operational.status.access' THEN 'status-servico.acesso'
        WHEN 'operational.types-products.access' THEN 'tipos-produto.acesso'
        WHEN 'inventory.stock.access' THEN 'estoque.acesso'
        WHEN 'inventory.sales.access' THEN 'vendas.acesso'
        WHEN 'organization.users.access' THEN 'usuarios.acesso'
        WHEN 'organization.settings.access' THEN 'configuracoes.acesso'
        WHEN 'organization.tenants.access' THEN 'locatarios.acesso'
        WHEN 'notifications.system-info.access' THEN 'notificacoes.acesso'
        ELSE permission_key
      END
    `);

    await queryInterface.sequelize.query(`
      UPDATE tenants
      SET enabled_modules = (
        SELECT COALESCE(jsonb_agg(DISTINCT module_key), '[]'::jsonb)
        FROM (
          SELECT value AS module_key
          FROM jsonb_array_elements_text(tenants.enabled_modules)
          WHERE value NOT IN ('operational', 'inventory', 'organization', 'notifications')
          UNION ALL
          SELECT unnest(ARRAY['servicos', 'status-servico', 'status-pagamento', 'tipos-produto'])
          WHERE tenants.enabled_modules ? 'operational'
          UNION ALL
          SELECT unnest(ARRAY['estoque', 'vendas'])
          WHERE tenants.enabled_modules ? 'inventory'
          UNION ALL
          SELECT 'organizacao'
          WHERE tenants.enabled_modules ? 'organization'
          UNION ALL
          SELECT 'notificacoes'
          WHERE tenants.enabled_modules ? 'notifications'
        ) localized_modules
      )
    `);
  },

  async down() {
    // Chaves antigas e a funcionalidade removida não são recriadas.
  },
};
