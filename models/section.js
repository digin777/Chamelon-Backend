const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;
const Section = new Schema({
    section_name: {
        type: String,
        required: true,
    },
    section_alias: {
        type: String,
        required: true,
    },
    section_table_name: {
        type: String,
        required: true,
    },
    section_config: {
        type: {},
        required: true
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
    },
    status: {
        type: Boolean,
        enum: [true, false],
        default: true
    },
    section_id: {
        type: Number,
        default: 0,
    }
});
Section.plugin(AutoIncrement, { inc_field: "section_id" });
module.exports = mongoose.model("Section", Section);