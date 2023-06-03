const mongoose = require("mongoose");
    const AutoIncrement = require("mongoose-sequence")(mongoose);
    const Schema = mongoose.Schema;
    const tags = new Schema({
            title:{
                type : String
            },
            genres:{
                type : mongoose.Types.ObjectId,
                ref:"genres"
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
    tags.plugin(AutoIncrement, { inc_field: "tags_id"});
    module.exports = mongoose.model("tags", tags);