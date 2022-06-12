const mongoose = require("mongoose");
    const AutoIncrement = require("mongoose-sequence")(mongoose);
    const Schema = mongoose.Schema;
    const test = new Schema({
            title:{
                type : String
            },
            status:{
                type : String
            },
            state:{
                type : String
            },
            Dob:{
                type : Date
            },
            currenttime:{
                type : Date
            },
            Slide:{
                type : String
            },
            switch_status:{
                type : String
            },
            age:{
                type : Number
            },
            description:{
                type : String
            },
            password:{
                type : String
            },
            uploads:{
                type : Schema.Types.Mixed
            },
            sugestme:{
                type : String
            },
            checkoff:{
                type : [Schema.Types.Mixed]
            },
            is_deleted: {
                type: Number,
                default: 0,
            },
            created_user_id: {
                type: Number,
                default: 1
            },
            created_at: {
                type: Date,
                default: Date.now
            }
        });
    test.plugin(AutoIncrement, { inc_field: "test_id"});
    module.exports = mongoose.model("test", test);