const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/chamelon', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
module.exports = db;
