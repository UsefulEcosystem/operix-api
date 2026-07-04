/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'tenant_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('users', 'email_verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.createTable('auth_action_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      purpose: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      token_hash: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('auth_action_tokens', ['user_id', 'purpose']);
    await queryInterface.addIndex('auth_action_tokens', ['token_hash']);
    await queryInterface.addIndex('auth_action_tokens', ['expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auth_action_tokens');
    await queryInterface.removeColumn('users', 'email_verified_at');
    await queryInterface.changeColumn('users', 'tenant_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
