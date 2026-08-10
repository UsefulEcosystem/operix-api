/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agenda_tasks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tenants', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      title: { type: Sequelize.STRING(180), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      starts_at: { type: Sequelize.DATE, allowNull: false },
      ends_at: { type: Sequelize.DATE, allowNull: true },
      completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      service_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'services', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      sale_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sales', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      notified_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('agenda_tasks', ['tenant_id', 'starts_at']);
    await queryInterface.addIndex('agenda_tasks', ['tenant_id', 'completed']);
  },
  async down(queryInterface) { await queryInterface.dropTable('agenda_tasks'); },
};
