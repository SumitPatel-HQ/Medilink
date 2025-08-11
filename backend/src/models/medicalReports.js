const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Appointments",
        required: true
    },
    fileUrl: {
        type: String, 
        required: true, 
    },
    genrativeDiagnosis: {
        type: String
    }
})

module.exports = mongoose.model("MedicalReports", schema)