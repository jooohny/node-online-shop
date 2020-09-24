const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderSchema = new Schema({
  items: [
    {
      productInfo: {
        type: Object,
        required: true,
        ref: 'Products',
      },
      qty: { type: Number, required: true },
      _id: false,
    },
  ],
  userInfo: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    // name: {
    //   type: String,
    //   required: true,
    // },
    email: {
      type: String,
      required: true,
    },
  },
}, { timestampe: true, });

module.exports = mongoose.model('Order', orderSchema);
