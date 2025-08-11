const { default: mongoose } = require("mongoose")
const { getEpochMilliSeconds, checkIsDateTimeFuture } = require("../helper")
const { verifyAccessToken, checkIsPatient, checkIsDoctor } = require("../middlewares/authentication")
const Appointment = require("../models/appointment")
const User = require("../models/user")
const lodash = require("lodash")

const Router = require("express").Router()

Router.post("/", 
    verifyAccessToken,
    checkIsPatient,
    (req, res) => {
    const newAppointment = req.body

    return Promise.resolve()
    .then(() => {
        if(!newAppointment.dateTime) {
            throw "invalid date time"
        }
    })
    .then(() => getEpochMilliSeconds(newAppointment.dateTime))
    .then((milliseconds) => checkIsDateTimeFuture(milliseconds))
    .then((milliseconds) => { 
        newAppointment.dateTime = milliseconds
        return  Appointment.create(newAppointment)
    })
    .then(doc => {
        return res.status(201).json({
            message: "appointment create successful",
            error: null,
            data: { ...doc._doc }
         })
    })
    .catch(error => {
        console.log("===error : ", error)
        return res.status(422).json({
            message: "appointment create failed",
            error: error,
            data: null
         })
    })

})

Router.get("/:role", verifyAccessToken, (req, res) => {
    // input --> role --> patient / doctor

    if(req.params.role == "doctor") {
        return User.findOne({ email: req.userEmail, role: "doctor" })
        .then(doctor => {
            if(!doctor) {
                throw "not found"
            }
            return Appointment.find({ doctorId: new mongoose.Types.ObjectId(doctor._id) })
        })
        .then(appts => {
            return res.status(200).json({
                message: "appointments fetch successful",
                error: null,
                data: appts
            })
        })
        .catch(error => {
            console.log("=== error", error)
            return res.status(422).json({
                message: "appointment fetch failed",
                error: error,
                data: null
            })
        })
    }

    if(req.params.role == "patient") {
        return User.findOne({ email: req.userEmail, role: "patient" })
        .then(patient => {
            if(!patient) {
                throw "not found"
            }
            return Appointment.find({ patientId: new mongoose.Types.ObjectId(patient._id) })
            .populate("doctorId")
            .exec()
        })
        .then(appts => {
            return res.status(200).json({
                message: "appointments fetch successful",
                error: null,
                data: appts
            })
        })
        .catch(error => {
            console.log("=== error", error)
            return res.status(422).json({
                message: "appointment fetch failed",
                error: error,
                data: null
            })
        })
    }

    return res.status(404).json({
        message: "appointment fetch failed",
        error: "not found",
        data: null
    })
})

Router.put("/:appointmentId", verifyAccessToken, checkIsDoctor, (req, res) => {
    
    return Promise.resolve()
    .then(() => {
        if(lodash.isEmpty(req.body)) {
            throw "invalid request body"
        }
        return Appointment.findByIdAndUpdate(req.params.appointmentId, { ...req.body }, {new: true })
    })
    .then(updatedAppt => {
        return res.status(200).json({
            message: "appointment updated successful",
            error: null,
            data: updatedAppt
        })
    })
    .catch(error => {
        console.log("=== error", error)
        return res.status(422).json({
            message: "appointment updated failed",
            error: error,
            data: null
        })
    })
})

module.exports = Router