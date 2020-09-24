const express = require('express');

const router = express.Router();

router.use((req, res) => {
  res.render('errors/404', {
    pageTitle: 'Page Not Found',
    toggle: '',
  });
});

// router.use((error, req, res, next) => {
//   res.status(500).render('errors/500', {
//     pageTitle: 'Server problems',
//     error,
//     toggle: '',
//   });
// });

module.exports = router;
