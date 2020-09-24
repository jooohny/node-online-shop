const express = require('express');
const adminController = require('../controllers/admin-controller');

const isAuth = require('../middleware/is-auth');
const validate = require('../middleware/validation');

const router = express.Router();

router.get('/add-product', isAuth, adminController.addProduct);
router.get('/edit-product/:productID', isAuth, adminController.editProduct);
router.get('/list-products', isAuth, adminController.listProducts);

router.post(
  '/add-product',
  isAuth,
  validate.addProduct,
  adminController.postAddProduct
);
router.post(
  '/edit-product',
  isAuth,
  validate.editProduct,
  adminController.postEditProduct
);
router.delete('/delete/:productID', isAuth, adminController.deleteProduct);

module.exports = router;
