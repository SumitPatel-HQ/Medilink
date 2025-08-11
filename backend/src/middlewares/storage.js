const multer = require("multer")
const path = require("path")
const { getReportFilePath } = require("../helper")

const uploadFolder = path.join(__dirname, "..", "uploads")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder)
      },
      filename: function (req, file, cb) {
        console.log("=== req: ", req.body)
        req.userFileName = getReportFilePath(req.userId, req.body.appointmentId, file.originalname)
        cb(null, req.userFileName)
      }
})

module.exports = multer({ storage : storage })