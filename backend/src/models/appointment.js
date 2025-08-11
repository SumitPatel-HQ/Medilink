const mongoose = require("mongoose")
const user = require("./user")

const schema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dateTime: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending",
        required: true
    }
})

module.exports = mongoose.model("appointment", schema)