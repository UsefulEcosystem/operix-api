/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stocks', 'supplier_name', {
      type: Sequelize.STRING(180),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('stocks', 'supplier_name');
  },
};
