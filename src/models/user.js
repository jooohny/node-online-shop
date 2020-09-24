const mongoose = require('mongoose');

const { Schema } = mongoose;

const Product = require('./product');
const Order = require('./order');

const userSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpires: Date,
  cart: {
    items: [
      {
        productInfo: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        qty: { type: Number, required: true },
        _id: false,
      },
    ],
  },
});

userSchema.methods.addToCart = async function (productId) {
  const { items } = this.cart;
  const { _id } = await Product.findById(productId);

  const filter = (item) => item.productInfo.toString() === _id.toString();
  const exisitingProdIndex = items.findIndex(filter);

  if (exisitingProdIndex !== -1) {
    items[exisitingProdIndex].qty += 1;
  } else {
    items.push({ productInfo: _id, qty: 1 });
  }

  return this.save();
};

userSchema.methods.getCart = function () {
  return this.populate('cart.items.productInfo').execPopulate();
};

userSchema.methods.deleteFromCart = function (productId) {
  const { cart } = this;
  const updatedItems = cart.items.filter(
    (item) => item.productInfo._id.toString() !== productId
  );
  cart.items = updatedItems;
  return this.save();
};

userSchema.methods.addOrder = async function () {
  const user = await this.getCart();
  const order = await new Order({ ...user.cart, userInfo: this });
  this.cart.items = [];
  await order.save();
  await this.save();
};

userSchema.methods.getOrders = function () {
  return Order.find({ 'userInfo._id': this._id });
};

module.exports = mongoose.model('User', userSchema);
