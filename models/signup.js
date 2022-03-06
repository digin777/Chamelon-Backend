const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
var bcrypt = require("bcrypt-nodejs");
const usersConnection = require("../src/db/db").collection("signup");
const Schema = mongoose.Schema;
const SignUp = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1
  },
  is_logged_in: {
    type: Boolean,
    enum: [true, false],
    default: false
  },
  is_deleted: {
    type: Number,
    default: 0,
  },
  signup_id: {
    type: Number,
  },
});
SignUp.pre("save", function (next) {
  var user = this;
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

SignUp.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

SignUp.plugin(AutoIncrement, { inc_field: "signup_id" });
module.exports = mongoose.model("SignUp", SignUp);
