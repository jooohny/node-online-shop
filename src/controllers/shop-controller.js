const fs = require('fs');
const path = require('path');
const PDFdocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const Product = require('../models/product');
const Order = require('../models/order');

const PRODUCTS_PER_PAGE = 4;

exports.mainPage = async (req, res, next) => {
  let { page } = req.query;
  page -= 1;
  let products;
  try {
    products = await Product.find()
      .skip(page * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE);
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.render('shop/index', {
    products,
    pageTitle: 'Shop',
    toggle: 'shop',
  });
};

exports.allProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find();
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.render('shop/products', {
    products,
    pageTitle: 'Products',
    toggle: 'products',
  });
};

exports.productDetails = async (req, res, next) => {
  const { productID } = req.params;
  let product;
  try {
    product = await Product.findById(productID);
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.render('shop/product-details', {
    product,
    pageTitle: product.title,
    toggle: 'products',
  });
};

exports.cart = async (req, res, next) => {
  let products = [];
  try {
    const { cart } = await req.user.getCart();
    products = cart.items;
  } catch (error) {
    console.log(error);
    return next(error);
  }

  res.render('shop/cart', {
    pageTitle: 'Your Cart',
    toggle: 'cart',
    products,
  });
};

exports.checkout = async (req, res, next) => {
  let products = [];
  let session;
  try {
    const { cart } = await req.user.getCart();
    products = cart.items;
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map((item) => {
        return {
          name: item.productInfo.title,
          description: item.productInfo.description,
          amount: item.productInfo.price * 100,
          currency: 'usd',
          quantity: item.qty,
        };
      }),
      success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
  const totalPrice = products.reduce(
    (accum, item) => accum + item.qty * item.productInfo.price,
    0
  );

  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    toggle: 'cart',
    products,
    totalPrice,
    session,
  });
};

exports.orders = async (req, res, next) => {
  let orders = [];
  try {
    orders = await req.user.getOrders();
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    toggle: 'orders',
    orders,
  });
};

exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('No order found');
    if (order.userInfo._id.toString() !== req.user._id.toString()) {
      throw new Error('Forbidden. Authorization problem.');
    }
    const fileName = `invoice-${orderId}.pdf`;
    const filePath = path.join('src', 'data', 'invoices', fileName);
    const pdfDoc = new PDFdocument();
    let totalPrice = 0;
    pdfDoc.pipe(fs.createWriteStream(filePath));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
    pdfDoc.pipe(res);
    pdfDoc.fontSize(20).text(`Invoice #${orderId}`, { underline: true });
    pdfDoc.text(`\n`);
    order.items.forEach((item) => {
      const { title, price } = item.productInfo;
      const { qty } = item;
      pdfDoc.fontSize(14).text(`${title} - ${qty} x ${price}$`);
      totalPrice += price * qty;
    });
    pdfDoc.text(`\n`);
    pdfDoc.text(`_____________________________`);
    pdfDoc.fontSize(16).text(`Total Price: ${totalPrice}$`);
    pdfDoc.end();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

exports.cartPost = async (req, res, next) => {
  const { productID } = req.body;
  const { deleteItem } = req.query;
  const { user } = req;
  try {
    if (deleteItem) {
      await user.deleteFromCart(productID);
    } else {
      await user.addToCart(productID);
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.redirect('/cart');
};

exports.checkoutSuccess = async (req, res, next) => {
  const { user } = req;
  try {
    await user.addOrder();
  } catch (error) {
    console.log(error);
    return next(error);
  }
  res.redirect('/orders');
};
