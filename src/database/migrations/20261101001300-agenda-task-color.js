/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agenda_tasks', 'color', { type: Sequelize.STRING(7), allowNull: false, defaultValue: '#3B82F6' });
  },
  async down(queryInterface) { await queryInterface.removeColumn('agenda_tasks', 'color'); },
};
