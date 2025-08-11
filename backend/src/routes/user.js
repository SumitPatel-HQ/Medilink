const Router = require("express").Router()
const { verifyAccessToken, checkIsPatient } = require("../middlewares/authentication")
const User = require("../models/user")
const lodash = require("lodash")

// GET /user
// UPDATE /user
// DELETE /user

Router.get("/", verifyAccessToken, (req, res) => {
    return User.findOne({ email: req.userEmail, role: req.userRole })
        .then(doc => {
            delete doc._doc.password

            return res.status(200).json({
                message: "user fetch successful",
                error: null,
                data: {
                    ...doc._doc,
                }
            })
        })
        .catch(error => {
            console.log(" error: ", error)

            return res.status(422).json({
                message: "user fetch failed",
                error: error,
                data: null
            })
        })
})

Router.put("/", verifyAccessToken, (req, res) => {
    return Promise.resolve()
        .then(() => {
            console.log("user body:", req.body)
            if (lodash.isEmpty(req.body)) {
                throw "send user information"
            }

            return User.findOneAndUpdate({ email: req.userEmail, role: req.userRole }, { ...req.body }, { new: true })
        })
        .then(userDoc => {
            delete userDoc._doc.password

            return res.status(200).json({
                message: "user update successful",
                error: null,
                data: {
                    ...userDoc._doc,
                }
            })
        })
        .catch(error => {
            console.log(" error: ", error)

            return res.status(422).json({
                message: "user update failed",
                error: error,
                data: null
            })
        })
})

Router.delete("/", verifyAccessToken, (req, res) => {
    return User.findOneAndDelete({ email: req.userEmail, role: req.userRole })
        .then(userDoc => {
            delete userDoc._doc.password

            return res.status(200).json({
                message: "user delete successful",
                error: null,
                data: {
                    ...userDoc._doc,
                }
            })
        })
        .catch(error => {
            console.log(" error: ", error)

            return res.status(422).json({
                message: "user delete failed",
                error: error,
                data: null
            })
        })
})

Router.get("/doctors",
    verifyAccessToken,
    checkIsPatient,
    (req, res) => {


        return User.find({ role: "doctor" })
            .then(documents => {

                return res.status(200).json({
                    message: "user fetch successful",
                    error: null,
                    data: documents.map((doctor) => {
                        let doctorInfo = {
                            _id: doctor._id,
                            name: doctor.name,
                        }

                        if (doctor.profile) {
                            doctorInfo.specialization = doctor.profile.specialization
                            doctorInfo.address = doctor.profile.address
                        }

                        return doctorInfo
                    })
                })
            })
            .catch(error => {
                console.log(" error: ", error)

                return res.status(422).json({
                    message: "user fetch failed",
                    error: error,
                    data: null
                })
            })
    })


module.exports = Router