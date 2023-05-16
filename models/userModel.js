const mongoose = require('mongoose')

const UserSchema = mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    status: { type: String, required: true, default: 'MENU' },
    notification: { type: Boolean, required: true, default: true },

    username: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    language_code: { type: String },
    is_bot: { type: Boolean },
    is_premium: { type: Boolean },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', UserSchema)
