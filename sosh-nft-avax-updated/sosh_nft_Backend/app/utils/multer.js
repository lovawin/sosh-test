const multer = require('multer');

// const path = require('path');
// const storagePath = path.resolve('./public/assets/images');
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, storagePath);
//   },

//   // By default, multer removes file extensions so let's add them back
//   filename: function (req, file, cb) {
//     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;
