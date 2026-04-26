const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ensureAdminUser = async () => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gadkille.local';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const ADMIN_NAME = process.env.ADMIN_NAME || 'GadKille Admin';

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    }
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Default admin created');
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Admin Password: ${ADMIN_PASSWORD}`);
};

module.exports = ensureAdminUser;
