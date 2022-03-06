const mongoose = require('mongoose');
//const passportLocalMongoose = require('passport-local-mongoose');
const Schema =mongoose.Schema;
const Verification = new Schema({
    sign_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'SignUp'
    },
    otp:{
        type:Number
    },
    otp_requested:{
        type:Date,
        default:Date.now
    },
    is_deleted:{
        type:Number,
        default:0
    }
});
//SignUp.plugin(passportLocalMongoose);// it add username and password feild
module.exports =mongoose.model('Verification',Verification);