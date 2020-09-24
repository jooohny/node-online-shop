const express = require('express');

const shopController = require('../controllers/shop-controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.mainPage);

router.get('/products', shopController.allProducts);

router.get('/product/:productID', shopController.productDetails);

router.get('/orders', isAuth, shopController.orders);

router.get('/order/:orderId', isAuth, shopController.getInvoice);

router.get('/cart', isAuth, shopController.cart);

router.post('/cart', isAuth, shopController.cartPost);

router.get('/checkout', isAuth, shopController.checkout);

router.get('/checkout/success', isAuth, shopController.checkoutSuccess);

router.get('/checkout/cancel', isAuth, shopController.checkout);

module.exports = router;
