const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const User = new Schema({
  signup_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "signup",
    unique:true
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "roles",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_deleted: {
    type: Number,
    default: 0,
  },
  user_id: {
    type: Number,
  },
  is_logged_in: {
    type: Boolean,
    enum: [true, false],
    default: false
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1
  }
});
User.plugin(AutoIncrement, { inc_field: "user_id" });
module.exports = mongoose.model("User", User);