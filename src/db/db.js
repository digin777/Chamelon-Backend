const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const uri="mongodb+srv://dani247:webber247@cluster0.p6kr0ua.mongodb.net/chamelon";
//const uri='mongodb://localhost:27017/chamelon';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
module.exports = db;
