/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agenda_tasks', 'recurrence_rule', { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'none' });
    await queryInterface.addColumn('agenda_tasks', 'recurrence_until', { type: Sequelize.DATEONLY, allowNull: true });
    await queryInterface.addIndex('agenda_tasks', ['recurrence_rule', 'recurrence_until']);
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('agenda_tasks', 'recurrence_until');
    await queryInterface.removeColumn('agenda_tasks', 'recurrence_rule');
  },
};
