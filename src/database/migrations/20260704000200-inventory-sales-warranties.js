/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_name: { type: Sequelize.STRING(180), allowNull: false },
      customer_document: { type: Sequelize.STRING(40), allowNull: true },
      customer_phone: { type: Sequelize.STRING(40), allowNull: true },
      total_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'completed' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      sold_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('sale_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sales', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'stocks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      item_name: { type: Sequelize.STRING(180), allowNull: false },
      item_code: { type: Sequelize.STRING(80), allowNull: false },
      serial_number: { type: Sequelize.STRING(120), allowNull: true },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      total_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      warranty_months: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('service_parts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'services', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'stocks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      item_name: { type: Sequelize.STRING(180), allowNull: false },
      item_code: { type: Sequelize.STRING(80), allowNull: false },
      serial_number: { type: Sequelize.STRING(120), allowNull: true },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      total_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      warranty_months: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      used_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('warranties', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      source_type: { type: Sequelize.STRING(30), allowNull: false },
      sale_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sales', key: 'id' }, onDelete: 'CASCADE' },
      sale_item_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sale_items', key: 'id' }, onDelete: 'CASCADE' },
      service_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'services', key: 'id' }, onDelete: 'CASCADE' },
      service_part_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'service_parts', key: 'id' }, onDelete: 'CASCADE' },
      stock_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'stocks', key: 'id' }, onDelete: 'RESTRICT' },
      customer_name: { type: Sequelize.STRING(180), allowNull: false },
      customer_document: { type: Sequelize.STRING(40), allowNull: true },
      customer_phone: { type: Sequelize.STRING(40), allowNull: true },
      item_name: { type: Sequelize.STRING(180), allowNull: false },
      item_code: { type: Sequelize.STRING(80), allowNull: false },
      serial_number: { type: Sequelize.STRING(120), allowNull: true },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      warranty_start_at: { type: Sequelize.DATE, allowNull: false },
      warranty_end_at: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'active' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('sales', ['tenant_id']);
    await queryInterface.addIndex('sale_items', ['tenant_id', 'sale_id']);
    await queryInterface.addIndex('service_parts', ['tenant_id', 'service_id']);
    await queryInterface.addIndex('warranties', ['tenant_id', 'source_type']);
    await queryInterface.addIndex('warranties', ['tenant_id', 'warranty_end_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('warranties');
    await queryInterface.dropTable('service_parts');
    await queryInterface.dropTable('sale_items');
    await queryInterface.dropTable('sales');
  },
};
