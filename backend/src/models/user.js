const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const OtpModel = require("./emailOtpVerification")

const profileSchema = new mongoose.Schema({
    age: {
        type: Number,
    },
    gender: {
        type: String, 
        enum: ["Male", "Female", "Other"]
    },
    specialization: {
        type: String,
    },
    address: {
        type: String
    }
}, {_id: false})

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true, 
        unique: true
    },
    verifiedEmail: {
        type: Boolean,
        default: false
    },
    password: {
        type: String, 
        required: true,
    },
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        default: "patient"
    },
    profile: {
        type: profileSchema
    }
})

userSchema.index({ email: 1, role: 1 })


userSchema.pre("save", function () {
    return Promise.resolve()
    .then(() => {
        return bcrypt.genSalt()
    })
    .then((salt) => {
        return bcrypt.hash(this.password, salt)
    })
    .then((hashedPassword) => {
        this.password = hashedPassword
    })
    .catch(error => {
        console.log("password hashing error: ", error)
    })
})

userSchema.post("save", function() {
    return OtpModel.create({
        email: this.email,
        otp: null
    })
})

userSchema.post("findOneAndDelete", function() {
    // TODO: revisit the logic here
    console.log("HERE : ", this)
    return OtpModel.deleteOne({ email: this.email })
})

module.exports = mongoose.model("User", userSchema)