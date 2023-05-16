const mongoose = require('mongoose')

const TicketSchema = mongoose.Schema(
  {
    departure: { type: String },
    arrival: { type: String },
    stops: { type: Number },
    duration: { type: Number },
    price: { type: Number },
    link: { type: String },
  },
  {
    _id: false,
    timestamps: false,
    versionKey: false,
  }
)

const SkyscannerSchema = mongoose.Schema(
  {
    date: { type: Date, required: true },
    direction: {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
    minPrice: { type: Number },
    url: { type: String, required: true },
    parsedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
      },
    ],
    tickets: [TicketSchema],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Skyscanner', SkyscannerSchema)
