const mongoose = require("mongoose");
    const AutoIncrement = require("mongoose-sequence")(mongoose);
    const Schema = mongoose.Schema;
    const genres = new Schema({"title":{"type":"String"},"order":{"type":"String"}
            ,"is_deleted": {
                type: 'Number',
                default: 0,
            },
            "created_user_id": {
                type: 'Number',
                default: 1
            },
            "created_at": {
                type: 'Date',
                default: Date.now
            }});
    genres.plugin(AutoIncrement, { inc_field: "genres_id"});
    module.exports = mongoose.model("genres", genres);