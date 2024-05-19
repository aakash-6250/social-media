const multer = require('multer')
const path = require('path')
const {v4 : uuidv4 } = require('uuid')

  const profile = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,"..","public","images","profile"))
    },
    filename: function (req, file, cb) {
      const imageName = uuidv4() + path.extname(file.originalname);
      cb(null, imageName)
    }
  })

  const post = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,"..","public","images","post"))
    },
    filename: function (req, file, cb) {
      const imageName = uuidv4() + path.extname(file.originalname);
      cb(null, imageName)
    }
  })

const uploadProfile = multer({ storage: profile }).single('profile');
const uploadPost = multer({ storage: post }).single('post');

module.exports= {uploadProfile, uploadPost};