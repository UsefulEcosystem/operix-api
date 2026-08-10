/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('time_entries', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tenants', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      started_at: { type: Sequelize.DATE, allowNull: false }, ended_at: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'open' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.createTable('time_entry_adjustment_requests', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tenants', key: 'id' }, onDelete: 'CASCADE' },
      time_entry_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'time_entries', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      requested_started_at: { type: Sequelize.DATE, allowNull: false }, requested_ended_at: { type: Sequelize.DATE, allowNull: true },
      reason: { type: Sequelize.TEXT, allowNull: false }, status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pending' },
      reviewed_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' }, reviewed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('time_entries', ['tenant_id', 'user_id', 'started_at']);
    await queryInterface.addIndex('time_entry_adjustment_requests', ['tenant_id', 'status']);
  },
  async down(queryInterface) { await queryInterface.dropTable('time_entry_adjustment_requests'); await queryInterface.dropTable('time_entries'); },
};
