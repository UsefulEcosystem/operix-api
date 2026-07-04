/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_token_blacklist', {
      jti: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('access_token_blacklist', ['expires_at']);
    await queryInterface.addIndex('access_token_blacklist', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('access_token_blacklist');
  },
};
