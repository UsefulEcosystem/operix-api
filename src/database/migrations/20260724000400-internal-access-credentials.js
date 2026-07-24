import crypto from 'node:crypto';

const ACCESS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateAccessCode() {
  const bytes = crypto.randomBytes(8);
  const value = Array.from(bytes, (byte) => ACCESS_CODE_ALPHABET[byte % ACCESS_CODE_ALPHABET.length]).join('');
  return `OPE-${value.slice(0, 4)}-${value.slice(4)}`;
}

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'access_code', {
      type: Sequelize.STRING(13),
      allowNull: true,
    });

    const [tenants] = await queryInterface.sequelize.query('SELECT id FROM tenants ORDER BY id');
    const usedCodes = new Set();
    for (const tenant of tenants) {
      let accessCode;
      do {
        accessCode = generateAccessCode();
      } while (usedCodes.has(accessCode));
      usedCodes.add(accessCode);
      await queryInterface.bulkUpdate('tenants', { access_code: accessCode }, { id: tenant.id });
    }

    await queryInterface.changeColumn('tenants', 'access_code', {
      type: Sequelize.STRING(13),
      allowNull: false,
    });
    await queryInterface.addIndex('tenants', ['access_code'], {
      name: 'tenants_access_code_unique',
      unique: true,
    });

    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX users_tenant_username_unique ON users (tenant_id, LOWER(username))',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email)) WHERE email IS NOT NULL',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_email_unique');
    await queryInterface.removeIndex('users', 'users_tenant_username_unique');
    await queryInterface.sequelize.query(
      `UPDATE users
       SET email = LOWER(username) || '.' || id || '@internal.invalid'
       WHERE email IS NULL`,
    );
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeIndex('tenants', 'tenants_access_code_unique');
    await queryInterface.removeColumn('tenants', 'access_code');
  },
};
