const mongoose = require('mongoose')

const FlightSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    direction: {
      from: { type: String, required: true },
      fromCode: { type: String, required: true },
      to: { type: String, required: true },
      toCode: { type: String, required: true },
    },
    date: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    price: { type: Number },
    message_id: { type: Number },
    parsed: { type: Boolean, required: true, default: false },
    available: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Flight', FlightSchema)
