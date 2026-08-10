/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(120), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
      is_system: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('roles', ['tenant_id']);
    await queryInterface.addIndex('roles', ['tenant_id', 'name'], { unique: true, name: 'roles_tenant_name_unique' });

    await queryInterface.bulkInsert('roles', [
      { name: 'Proprietário', description: 'Dono da empresa e administrador máximo.', is_system: true, tenant_id: null, created_at: new Date(), updated_at: new Date() },
      { name: 'Administrador', description: 'Acesso administrativo completo.', is_system: true, tenant_id: null, created_at: new Date(), updated_at: new Date() },
      { name: 'Gerente', description: 'Coordena a operação da empresa.', is_system: true, tenant_id: null, created_at: new Date(), updated_at: new Date() },
      { name: 'Técnico', description: 'Executa e acompanha serviços técnicos.', is_system: true, tenant_id: null, created_at: new Date(), updated_at: new Date() },
      { name: 'Atendente', description: 'Realiza atendimentos e vendas.', is_system: true, tenant_id: null, created_at: new Date(), updated_at: new Date() },
      { name: 'Estoquista', description: 'Administra itens e movimentações do estoque.', is_system: true, tenant_id: null, created_at: new Date(), updated_at: new Date() },
    ]);

    await queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('users', ['role_id']);
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role_id = (SELECT id FROM roles WHERE name = 'Proprietário' AND is_system = true LIMIT 1)
      WHERE root = true OR admin = true
    `);

    await queryInterface.createTable('suppliers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(180), allowNull: false },
      cnpj: { type: Sequelize.STRING(18), allowNull: true },
      phone: { type: Sequelize.STRING(40), allowNull: true },
      address: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('suppliers', ['tenant_id']);

    await queryInterface.addColumn('stocks', 'supplier_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'suppliers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('stocks', ['supplier_id']);

    await queryInterface.addColumn('services', 'responsible_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('services', ['responsible_user_id']);

    await queryInterface.addColumn('sales', 'attendant_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('sales', ['attendant_user_id']);

    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      module: { type: Sequelize.STRING(80), allowNull: false },
      operation: { type: Sequelize.STRING(80), allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      tenant_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'tenants', key: 'id' }, onDelete: 'SET NULL' },
      dth_inclusao: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      json_dados: { type: Sequelize.JSONB, allowNull: true },
    });
    await queryInterface.addIndex('audit_logs', ['tenant_id', 'dth_inclusao']);
    await queryInterface.addIndex('audit_logs', ['module', 'operation']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.removeColumn('sales', 'attendant_user_id');
    await queryInterface.removeColumn('services', 'responsible_user_id');
    await queryInterface.removeColumn('stocks', 'supplier_id');
    await queryInterface.dropTable('suppliers');
    await queryInterface.removeColumn('users', 'role_id');
    await queryInterface.dropTable('roles');
  },
};
