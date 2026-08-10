/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'external_access_version', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await queryInterface.createTable('external_access_tokens', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tenants', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token_hash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      token_prefix: { type: Sequelize.STRING(12), allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      last_used_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      revoked_at: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('external_access_tokens', ['tenant_id', 'user_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('external_access_tokens');
    await queryInterface.removeColumn('users', 'external_access_version');
  },
};
