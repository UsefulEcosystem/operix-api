/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      full_name: { type: Sequelize.STRING(180), allowNull: false },
      document: { type: Sequelize.STRING(40), allowNull: true },
      phone: { type: Sequelize.STRING(40), allowNull: false },
      address: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addColumn('services', 'client_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'clients', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('sales', 'client_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'clients', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('clients', ['tenant_id']);
    await queryInterface.addIndex('clients', ['tenant_id', 'full_name']);
    await queryInterface.addIndex('services', ['tenant_id', 'client_id']);
    await queryInterface.addIndex('sales', ['tenant_id', 'client_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'client_id');
    await queryInterface.removeColumn('services', 'client_id');
    await queryInterface.dropTable('clients');
  },
};
