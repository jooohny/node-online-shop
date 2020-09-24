const mongoose = require('mongoose');

const { MONGODB_URI } = require('../utils/config');

module.exports = () => {
  return mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
