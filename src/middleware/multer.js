const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images');
  },
  filename(req, file, cb) {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  const [, type] = file.mimetype.split('/');
  req.body.imageCheck = true;

  if (type === 'jpg' || type === 'jpeg' || type === 'png') {
    req.body.imageType = true;
    cb(null, true);
  } else {
    req.body.imageType = false;
    cb(null, false);
  }
}

module.exports = multer({ storage, fileFilter });
