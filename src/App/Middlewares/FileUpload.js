const multer = require('multer')
const uploads = multer({
    //dest: 'images', // NO LONGER REQUIRED AS WE ARE SAVING IMAGE IN DB
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|JPG)$/)) {
            return cb(new Error('Please upload JPG|PNG file extension image.'))
        }
        cb(undefined, true)
    }
})
const result = uploads.single('profile_image')
module.exports = result
