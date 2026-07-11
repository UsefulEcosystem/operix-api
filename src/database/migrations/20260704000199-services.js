/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("services", {
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tenants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      product: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      client: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      telephone: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      adress: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      payment_status_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      order_of_service: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      observation: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      updated_at_service: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      updated_at_payment: {
        allowNull: true,
        type: Sequelize.STRING,
      },
    });

    await queryInterface.addIndex("services", ["tenant_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("services");
  },
};
