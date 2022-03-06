const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const Roles = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    },
    is_deleted: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    roles_id:{
        type:Number
    }
});
Roles.plugin(AutoIncrement, { inc_field: "roles_id" });
module.exports = mongoose.model("Roles", Roles);
