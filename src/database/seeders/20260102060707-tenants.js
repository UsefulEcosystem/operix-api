'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.bulkInsert(
        "tenants", 
        [
          {
            name: "Operix",
          }
        ], 
        {}
      );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tenants", null, {});
  }
};
