/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "external_access_tokens_tenant_id_user_id"');
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS external_access_tokens_active_user_unique ON external_access_tokens (tenant_id, user_id) WHERE active = true');
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS external_access_tokens_active_user_unique');
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS external_access_tokens_tenant_id_user_id ON external_access_tokens (tenant_id, user_id)');
  },
};
