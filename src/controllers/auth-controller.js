const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const mail = require('../utils/mailer');

const User = require('../models/user');

// Создаём новый объект, затем через прототип делаем его наследником конструктора Error.
function UserError(message) {
  this.name = 'UserError';
  this.message = message || 'Сообщение по умолчанию';
  this.stack = new Error().stack;
}
UserError.prototype = Object.create(Error.prototype);
UserError.prototype.constructor = UserError;

exports.signUp = (req, res) => {
  const errors = req.flash('error');
  res.render('auth/signup', {
    pageTitle: 'Sign up',
    toggle: 'signup',
    errors,
  });
};

exports.signUpPost = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Sign up',
      toggle: 'signup',
      errors: errors.array(),
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: {
        items: [],
      },
    });
    await user.save();
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.redirect('/auth/login');
};

exports.login = (req, res) => {
  const errors = req.flash('error') || [];
  res.render('auth/login', {
    pageTitle: 'Login',
    toggle: 'login',
    errors,
    noteStyle: 'danger',
  });
};

exports.loginPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array());
    return res.status(422).redirect('/auth/login');
  }

  try {
    const { user } = req.body;
    req.session.user = user;
    req.session.isLoggedIn = true;
    return req.session.save((err) => {
      if (err) throw err;
      res.redirect('/');
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

exports.resetPassword = (req, res) => {
  res.render('auth/reset', {
    pageTitle: 'Reset password',
    toggle: '',
    errors: [],
  });
};

exports.resetPasswordPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/reset', {
      pageTitle: 'Login',
      toggle: 'login',
      errors: errors.array(),
    });
  }
  const response = () =>
    res.status(422).render('auth/login', {
      pageTitle: 'Login',
      toggle: 'login',
      errors: [{ msg: 'The link is sent to specified e-mail' }],
      noteStyle: 'info',
    });
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new UserError('Пользователь не найден');
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();
    response();
    await mail.resetPassword(email, token);
  } catch (error) {
    console.dir(error);
    if (error instanceof UserError) return response();
    next(error);
  }
};

exports.setNewPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  let user;
  try {
    user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: Date.now() },
    });
    if (!user)
      throw new UserError('The link is no longer valid. Ask for another reset');
  } catch (error) {
    console.log(error);
    if (error instanceof UserError) {
      req.flash('error', error.message);
      return res.redirect('/auth/login');
    }
    return next(error);
  }
  res.render('auth/new-password', {
    pageTitle: 'Set new password',
    toggle: null,
    userId: user._id.toString(),
    resetToken,
    errors: [],
  });
};

exports.setNewPasswordPost = async (req, res, next) => {
  const { userId, resetToken, password } = req.body;
  const errors = validationResult(req);
  let user;

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/new-password', {
      pageTitle: 'Set new password',
      toggle: null,
      userId,
      resetToken,
      errors: errors.array(),
      noteStyle: 'danger',
    });
  }

  try {
    user = await User.findOne({
      _id: userId,
      resetToken,
      resetTokenExpires: { $gt: Date.now() },
    });
    if (!user) throw new UserError('Something went wrong');
    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
  } catch (error) {
    console.log(error);
    if (error instanceof UserError) {
      req.flash('error', error.message);
      res.status(422);
    } else
      return next(error);
  }
  res.redirect('/auth/login');
};

exports.logoutPost = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) throw err;
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.redirect('/auth/login');
};
