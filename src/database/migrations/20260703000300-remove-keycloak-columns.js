/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tenants = await queryInterface.describeTable('tenants');
    if (tenants.keycloak_group_id) {
      await queryInterface.removeColumn('tenants', 'keycloak_group_id');
    }

    const users = await queryInterface.describeTable('users');
    if (users.keycloak_id) {
      await queryInterface.removeColumn('users', 'keycloak_id');
    }
  },

  async down(queryInterface, Sequelize) {
    const tenants = await queryInterface.describeTable('tenants');
    if (!tenants.keycloak_group_id) {
      await queryInterface.addColumn('tenants', 'keycloak_group_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }

    const users = await queryInterface.describeTable('users');
    if (!users.keycloak_id) {
      await queryInterface.addColumn('users', 'keycloak_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      });
    }
  },
};
