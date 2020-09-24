const express = require('express');

const authController = require('../controllers/auth-controller');
const validate = require('../middleware/validation');

const router = express.Router();

router.get('/signup', authController.signUp);

router.get('/login', authController.login);

router.get('/reset', authController.resetPassword);

router.get('/new-password/:resetToken', authController.setNewPassword);

router.post('/signup', validate.signUp, authController.signUpPost);

router.post('/login', validate.login, authController.loginPost);

router.post('/logout', authController.logoutPost);

router.post('/reset', validate.reset, authController.resetPasswordPost);

router.post(
  '/new-password',
  validate.newPassword,
  authController.setNewPasswordPost
);

module.exports = router;
