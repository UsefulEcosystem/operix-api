/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'onboarding_completed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      'UPDATE users SET onboarding_completed_at = NOW() WHERE onboarding_completed_at IS NULL',
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'onboarding_completed_at');
  },
};
