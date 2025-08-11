const Router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const OtpModel = require("../models/emailOtpVerification")
const { verifyAccessToken } = require("../middlewares/authentication")
const { sendMail } = require("../helper")


Router.post("/signup", (req, res) => {
    const newUser = req.body

    return User.create(newUser)
    .then(doc => {

        delete doc._doc.password
        return res.status(201).json({
            message: "signup successful",
            error: null,
            data: docr
         })
    })
    .catch(error => {
        return res.status(422).json({
            message: "signup failed",
            error: error,
            data: null
         })
    })
})

Router.post("/login", (req, res) => {
    const { email, password, role } = req.body
    let foundDoc = null

    return User.findOne({ email, role })
    .then(doc => {
        foundDoc = doc

        if (doc == null) {
            throw "user not found"
        }

        return bcrypt.compare(password, doc.password)
    })
    .then((isCompared) => {
        if(!isCompared) {
            throw "invalid password"
        }

        const payload = {
            email: foundDoc.email,
            role: foundDoc.role,
            _id: foundDoc._id
        }

        const token = jwt.sign(payload, process.env.SECRET, {
            expiresIn: '1h'
        })

        delete foundDoc._doc.password

        return res.status(200).json({
            message: "login successful",
            error: null,
            data: {
                ...foundDoc._doc,
                accessToken: token
            }
         })
    })
    .catch(error => {
        console.log(" error: ", error)

        return res.status(403).json({
            message: "login failed",
            error: error,
            data: null
         })
    })
})

Router.post("/logout", verifyAccessToken, (req, res) => {
    try {
        // TODO: write logout logic 

        return res.status(200).json({
            message: "logout successful",
            error: null,
            data: null
         })
      
    } catch (error) {
        return res.status(403).json({
            message: "logout failed",
            error: error,
            data: null
         })
    }
    
})

Router.get("/email-verify/request", verifyAccessToken, (req, res) => {

    return User.findOne({ email: req.userEmail, role: req.userRole })
    .then(doc => {
        if(doc.verifiedEmail) {
            throw "email already verified"
        }

        const newOtp = Math.ceil(Math.random() * 1000000)

        return OtpModel.findOneAndUpdate({ email: req.userEmail }, { otp: newOtp }, { new: true })
    })
    .then(otpDoc => {

        return sendMail(
            req.userEmail, 
            "MediLink: OTP for email verification",
            "Your OTP is " + otpDoc.otp
        )
    })
    .then(() => {
        return res.status(200).json({
            message: "verification request sent successful",
            error: null,
            data: null
         })
    })
    .catch(error => {
        console.log("error: ", error)
        return res.status(403).json({
            message: "verification request failed",
            error: error,
            data: null
         })
    })
})

Router.post("/email-verify/submit", verifyAccessToken, (req, res) => {
    
    return User.findOne({ email: req.userEmail, role: req.userRole })
    .then(doc => {
        if(doc.verifiedEmail) {
            throw "email already verified"
        }

        return OtpModel.findOne({ email: req.userEmail })
    })
    .then(otpDoc => {

        if(otpDoc.otp != req.body.otp) {
            throw "invalid otp"
        }

        return User.findOneAndUpdate({ email: req.userEmail, role: req.userRole }, { verifiedEmail: true }, { new: true })
    })
    .then(userDoc => {
        delete userDoc._doc.password

        return res.status(200).json({
            message: "verification successful",
            error: null,
            data: userDoc
         })
    })
    .catch(error => {
        console.log("error: ", error)
        return res.status(403).json({
            message: "verification failed",
            error: error,
            data: null
         })
    })
})


module.exports = Router
