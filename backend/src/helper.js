const nodemailer = require("nodemailer")
const appwriteSdk = require("node-appwrite")
const path = require("path")

function sendMail(recieverEmailId, subject, body) {
    const transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        // port: 587,
        // secure: false, // true for 465, false for other ports
        service: "gmail",
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD
        },
      });


      return transporter.sendMail({
        from: "10xtarun@gmail.com",
        to: recieverEmailId, 
        subject: subject,
        text: body
      })
      .then(sentInfo => {
        console.log("email sent: ", sentInfo)
      })
      .catch(error => {
        console.log("email not sent: ", error)
        throw "otp sent failed, retry after sometime"
      })
}

function getEpochMilliSeconds(dateTimeString) {
  let milliseconds = Date.parse(dateTimeString)

  if(milliseconds == NaN) {
    throw "invalid date time format"
  }

  return milliseconds
}

function checkIsDateTimeFuture(milliseconds) {
  let currentMilliSeconds = Date.now()

  if(milliseconds <= currentMilliSeconds) {
    throw "date time cannot be of past"
  }

  return milliseconds
}

function setupAppWrite() {
  const client = new appwriteSdk.Client()


  client.setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT)
  .setKey(process.env.APPWRITE_KEY)

  return client
}

function getReportFilePath(patientId, appointmentId, fileName) {
  return patientId + "-" + Math.ceil(Math.random() *  1000) + "-" +  path.extname(fileName)
}


module.exports = {
    sendMail,
    getEpochMilliSeconds,
    checkIsDateTimeFuture,
    setupAppWrite,
    getReportFilePath
}