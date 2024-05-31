const { Schema, model, Types } = require('mongoose')

const doctor = new Schema(
    {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        counter_agent: { type: Schema.Types.ObjectId, ref: 'User' },
        clinica: { type: Schema.Types.ObjectId, ref: 'Clinica' },
        clinica_name: { type: String, required: true },
        phone: { type: String, required: true },
        statsionar_profit: { type: Number, default: 0 },
        isArchive: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
)

module.exports.CounterDoctor = model('CounterDoctor', doctor)