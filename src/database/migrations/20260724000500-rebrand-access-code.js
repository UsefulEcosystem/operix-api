/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE tenants
       SET access_code = 'OPE-' || SUBSTRING(access_code FROM 5)
       WHERE access_code LIKE 'OPX-%'`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE tenants
       SET access_code = 'OPX-' || SUBSTRING(access_code FROM 5)
       WHERE access_code LIKE 'OPE-%'`,
    );
  },
};
