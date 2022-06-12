const fs = require('fs');
const _ = require('lodash');
var path = require('path');

async function ConstructModel(config, section) {
    let typeBuilder =(dbtype)=>{
        if(_.isObject(dbtype)){
            return dbtype;
        }else if(dbtype==='Array'){
            return '[Schema.Types.Mixed]';
        }else if(dbtype==='Date'){
            return 'Date';
        }else if(dbtype==='ObjectId'){
            return 'Schema.Types.ObjectId';
        }else if(dbtype==='Decimal128'){
            return 'Schema.Types.Decimal128';
        }else{
            return dbtype?dbtype:'String';
        }

    }
    return new Promise((resolve, reject) => {
        let columns = config.columns;
        if(!columns) return
        let model = `{`;
        for (const element of columns) {
            // model[element.field] = {
            //     type:typeBuilder(element.dbtype)
            // }
            model+=`
            ${element.field}:{
                type : ${typeBuilder(element.dbtype)}
            },`
        }
        let additionalProps = `
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
        }`;
        model = model.trim();
        let lastclosing = model.lastIndexOf(',');
        model+=additionalProps;
        console.log(model)
        let content = `const mongoose = require("mongoose");
    const AutoIncrement = require("mongoose-sequence")(mongoose);
    const Schema = mongoose.Schema;
    const ${section} = new Schema(${model});
    ${section}.plugin(AutoIncrement, { inc_field: "${section}_id"});
    module.exports = mongoose.model("${section}", ${section});`;
        try {
            var jsonPath = path.join(__dirname, '..', 'models', `${section}.js`);
            fs.writeFileSync(jsonPath, content);
            resolve(true);
        } catch (error) {
            reject(false);
        }
    });

}
module.exports = { ConstructModel }