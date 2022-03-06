const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const Permissons = new Schema({
    role: {
        type: Schema.Types.ObjectId,
        ref: 'roles',
    },
    actions:{
        type:[Schema.Types.Mixed],
        default:[]
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'signup',
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
    permisson_id:{
        type:Number
    }
});
Roles.plugin(AutoIncrement, { inc_field: "permisson_id" });
module.exports = mongoose.model("Permissons", Permissons);
