/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('external_access_tokens', 'token_ciphertext', { type: Sequelize.TEXT, allowNull: true });
  },
  async down(queryInterface) { await queryInterface.removeColumn('external_access_tokens', 'token_ciphertext'); },
};
