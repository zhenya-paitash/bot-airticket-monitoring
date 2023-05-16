const mongoose = require('mongoose')

const SkyscannerNotificationSchema = mongoose.Schema(
  {
    skyscanner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Skyscanner',
    },

    prevPrice: { type: Number, required: true, default: 0 },
    curPrice: { type: Number, required: true },
    type: { type: String, required: true, default: 'create' },
    read: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true, default: Date.now() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
)

module.exports = mongoose.model('SkyscannerNotification', SkyscannerNotificationSchema)
