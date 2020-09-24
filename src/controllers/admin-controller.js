const { validationResult } = require('express-validator');
const Product = require('../models/product');
const fileHelper = require('../utils/file-helper');

exports.addProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    toggle: 'admin',
    edit: false,
    errors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      toggle: 'admin',
      edit: false,
      errors: errors.array(),
    });
  }
  const { body, file, user } = req;
  const product = new Product({
    ...body,
    userId: user,
    picURL: file.path,
  });
  try {
    await product.save();
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.redirect('/admin/list-products');
};

exports.editProduct = async (req, res, next) => {
  const { productID } = req.params;
  let product;

  try {
    product = await Product.findById(productID);
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.render('admin/edit-product', {
    pageTitle: 'Edit Product',
    toggle: 'admin',
    edit: true,
    product,
    errors: [],
  });
};

exports.postEditProduct = async (req, res, next) => {
  const { title, description, price, _id } = req.body;
  const { file } = req;

  try {
    const product = await Product.findById(_id);
    if (product.userId.toString() !== req.user._id.toString()) {
      throw new Error('Forbidden. Authorization problem.');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        toggle: 'admin',
        edit: true,
        product,
        errors: errors.array(),
      });
    }

    product.title = title;
    product.description = description;
    product.price = price;
    if (file) {
      fileHelper.deleteFile(product.picURL);
      product.picURL = file.path;
    }
    await product.save();
  } catch (error) {
    console.log(error);
    return next(error);
  }
  return res.redirect('/admin/list-products');
};

exports.deleteProduct = async (req, res, next) => {
  const _id = req.params.productID;

  try {
    const product = await Product.findById(_id);
    if (!product) {
      throw new Error('Product not found!');
    }
    if (product.userId.toString() !== req.user._id.toString()) {
      throw new Error('Forbidden. Authorization problem.');
    }
    await product.remove();
    fileHelper.deleteFile(product.picURL);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
  res.status(200).json({ message: 'Ok' });
};

exports.listProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find({ userId: req.user._id });
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.render('admin/list-products', {
    products,
    pageTitle: 'All Products',
    toggle: 'admin',
  });
};
