/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const existingTables = await queryInterface.showAllTables();
    if (existingTables.includes('warranties')) {
      await queryInterface.dropTable('warranties');
    }

    for (const tableName of ['sale_items', 'service_parts']) {
      const columns = await queryInterface.describeTable(tableName);
      if (columns.warranty_months) {
        await queryInterface.removeColumn(tableName, 'warranty_months');
      }
    }
  },

  async down() {
    // A funcionalidade removida não é recriada em rollback.
  },
};
