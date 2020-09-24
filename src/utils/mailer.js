const nodemailer = require('nodemailer');
const { MAIL_SETUP } = require('./config');

const transport = nodemailer.createTransport(MAIL_SETUP);

const resetPassword = (recipient, token) => {
  const mailOptions = {
    from: '"Online Shop" <onlineshop@dev.com>',
    to: recipient,
    subject: 'Password reset',
    text: `
    You got this message because you requested password reset.
    Click this link to set a new password: http://localhost:8080/auth/new-password/${token}.
    `,
    html: `
    <p>You got this message because you requested password reset.</p>
    <p>Click this <a href="http://localhost:8080/auth/new-password/${token}">link</a> to set a new password.</p>
    `,
  };

  return transport.sendMail(mailOptions);
};

module.exports = {
  transport,
  resetPassword,
};
