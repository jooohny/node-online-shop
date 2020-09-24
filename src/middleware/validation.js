const { checkSchema } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.signUp = checkSchema({
  email: {
    in: 'body',
    normalizeEmail: true,
    isEmail: {
      errorMessage: 'The email is invalid',
    },
    custom: {
      options: async (value) => {
        const user = await User.findOne({ email: value });
        if (user) throw new Error('Email is already in use');
      },
    },
  },
  password: {
    in: 'body',
    isLength: {
      errorMessage: 'Password should be at least 6 chars long',
      // Multiple options would be expressed as an array
      options: { min: 6 },
    },
  },
  rePassword: {
    in: 'body',
    custom: {
      options: (value, { req }) => value === req.body.password,
    },
    errorMessage: "Passwords don't match",
  },
});

exports.login = checkSchema({
  email: {
    in: 'body',
    isEmail: {
      errorMessage: 'Please, enter valid e-mail',
    },
    custom: {
      options: async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (!userDoc) throw new Error();
        const correct = await bcrypt.compare(
          req.body.password,
          userDoc.password
        );
        if (!correct) throw new Error();
        req.body.user = userDoc;
      },
      errorMessage: 'Something is wrong',
    },
  },
});

exports.reset = checkSchema({
  email: {
    in: 'body',
    isEmail: {
      errorMessage: 'Please, enter valid e-mail',
    },
  },
});

exports.newPassword = checkSchema({
  password: {
    in: 'body',
    isLength: {
      errorMessage: 'Password should be at least 6 chars long',
      // Multiple options would be expressed as an array
      options: { min: 6 },
    },
  },
  rePassword: {
    in: 'body',
    custom: {
      options: (value, { req }) => value === req.body.password,
    },
    errorMessage: "Passwords don't match",
  },
});

exports.addProduct = checkSchema({
  imageCheck: {
    in: 'body',
    custom: {
      options: (value, { req }) => {
        if (value !== true) throw new Error('Image required!');
        if (req.body.imageType !== true)
          throw new Error('Image must be a type of JPG/JPEG/PNG!');
        return true;
      },
    },
  },
});

exports.editProduct = checkSchema({
  imageCheck: {
    in: 'body',
    custom: {
      options: (value, { req }) => {
        if (value === true) {
          if (req.body.imageType !== true)
            throw new Error('Image must be a type of JPG/JPEG/PNG!');
        }
        return true;
      },
    },
  },
});
const example = checkSchema({
  id: {
    // The location of the field, can be one or more of body, cookies, headers, params or query.
    // If omitted, all request locations will be checked
    in: ['params', 'query'],
    errorMessage: 'ID is wrong',
    isInt: true,
    // Sanitizers can go here as well
    toInt: true,
  },
  myCustomField: {
    // Custom validators
    custom: {
      options: (value, { req, location, path }) => {
        return value + req.body.foo + location + path;
      },
    },
    // and sanitizers
    customSanitizer: {
      options: (value, { req, location, path }) => {
        let sanitizedValue;

        if (req.body.foo && location && path) {
          sanitizedValue = parseInt(value, 10);
        } else {
          sanitizedValue = 0;
        }

        return sanitizedValue;
      },
    },
  },
  password: {
    isLength: {
      errorMessage: 'Password should be at least 7 chars long',
      // Multiple options would be expressed as an array
      options: { min: 7 },
    },
  },
  firstName: {
    isUppercase: {
      // To negate a validator
      negated: true,
    },
    rtrim: {
      // Options as an array
      options: [[' ', '-']],
    },
  },
  // Wildcards/dots for nested fields work as well
  'addresses.*.postalCode': {
    // Make this field optional when undefined or null
    optional: { options: { nullable: true } },
    isPostalCode: true,
  },
});
