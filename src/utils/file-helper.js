const fs = require('fs');

exports.deleteFile = (filePath) => {
  return fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
};
