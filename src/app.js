const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const bodyParser = require('body-parser');
const csrf = require('csurf')();
const flash = require('connect-flash');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const https = require('https');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const multer = require('./middleware/multer');
const mail = require('./utils/mailer').transport;
const sessions = require('./middleware/sessions');
const database = require('./utils/database');
const User = require('./models/user');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorsRoutes = require('./routes/errors');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '..', 'access.log'),
  {
    flags: 'a',
  }
);

// const key = fs.readFileSync('key.pem');
// const cert = fs.readFileSync('cert.pem');

// Подключение шаблонизатора EJS
app.engine('ejs', consolidate.ejs); // Расширение .ejs
app.set('view engine', 'ejs'); // Установка шаблонизатораy
app.set('views', path.join(__dirname, 'views')); // Папка с шаблонами

app.use(morgan('combined', { stream: accessLogStream }));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer.single('image'));

app.use(sessions);

app.use(csrf);

app.use((req, res, next) => {
  res.locals.isAdmin = req.session.isLoggedIn;
  res.locals.csrf = req.csrfToken();
  next();
});

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    req.user = await User.findById(req.session.user._id);
  } catch (error) {
    console.log(error);
  }
  return next();
});

app.use(flash());

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use(shopRoutes);
app.use(require('./routes/about'));

app.use(errorsRoutes);
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('errors/500', {
    pageTitle: 'Server problems',
    error: error.stack,
    toggle: '',
  });
});

(async function init() {
  const port = process.env.PORT || 8080;
  try {
    await mail.verify();
    await database();
    // https
    //   .createServer({ cert, key }, app)
    //   .listen(port, () => console.log(`Listening ${port}`));
    app.listen(port, () => console.log(`Listening ${port}`));
  } catch (error) {
    console.log(error);
  }
})();
