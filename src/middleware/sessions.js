const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const { MONGODB_URI } = require('../utils/config');

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

module.exports = session({
  secret: 'on the top of my tongue and the back of my lungs',
  resave: false,
  saveUninitialized: false,
  store,
});
