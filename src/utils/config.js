const path = require('path');

module.exports = {
  ROOT: path.dirname(process.mainModule.filename),
  MONGODB_URI: process.env.MONGODB_URI,
  MAIL_SETUP: {
    host: process.env.MAIL_SETUP_HOST,
    port: process.env.MAIL_SETUP_PORT,
    auth: {
      user: process.env.MAIL_SETUP_USER,
      pass: process.env.MAIL_SETUP_PASS,
    },
  },
};
