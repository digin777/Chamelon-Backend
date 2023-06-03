const express = require("express");
const SectionRouter = express.Router();
const {ConstructModel} = require('../../../lib/utlity');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/uploads')
    },
    filename: function (req, file, cb) {
        // You could rename the file name
        // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))

        // You could use the original name
        cb(null, file.originalname)
    }
});

SectionRouter.post('/add', async (req, res) => {
    const {section, data} = req.body;
    const Section = require(`../../../models/section`);
    if (section === 'section') {
        data.section_config = await JSON.parse(data.section_config);
        let section_name = data.section_table_name;
        try {
            let status = await ConstructModel(data.section_config, section_name);
        } catch (error) {
            return res.json({success: false, message: `failed to add record Model creation failed`})
        }
    }
    try {
        let SectionConfig = await Section.findOne({section_alias: section});
        if (!SectionConfig) throw Error('Section not found');
        let table_name = SectionConfig.section_table_name;
        let currentSection = require(`../../../models/${table_name}`);
        let SectionInstance = new currentSection(data);
        await SectionInstance.save()
        res.json({success: true, message: 'Record added sucessfully'})
    } catch (error) {
        res.json({success: false, message: `failed to add record ${error.message}`})
    }
});


SectionRouter.post('/update', (req, res) => {
    const {section, data, recordId} = req.body;
    const Section = require(`../../../models/section`);
    if (section === 'section') {
        data.section_config = JSON.parse(data.section_config);
    }
    Section.findOne({section_alias: section})
        .then(SectionConfig => {
            if (!SectionConfig) throw new Error("Section Not Found");
            let table_name = SectionConfig.section_table_name;
            let currentSection = require(`../../../models/${table_name}`);
            return currentSection.updateOne({_id: recordId}, data)
        }).then(updated => {
        res.json({success: true, message: 'Record updated sucessfully'})
    }).catch(err => {
        res.json({success: false, message: 'Record updation failed'})
    });
});

SectionRouter.post('/sectionDataById', async (req, res) => {
    const {section, id} = req.body;
    const Section = require(`../../../models/section`);
    try {
        let SectionConfig = await Section.findOne({section_alias: section});
        if (!SectionConfig) throw Error('Section not found');
        let table_name = SectionConfig.section_table_name;
        let {columns: column_config} = SectionConfig.section_config;
        let currentSection = require(`../../../models/${table_name}`);
        const section_id = `${section}_id`;
        let projection = {
            "_id": 0,
            "__v": 0,
            "created_at": 0,
            "created_user_id": 0,
            "is_deleted": 0,
        }
        projection[section_id.toString()] = 0;
        let SectionInstance = await currentSection.findOne({_id: id}, projection);
        if (!SectionInstance) throw Error('no data found');
        SectionInstance = SectionInstance.toJSON();
        let responseData = [];
        for (const fields in SectionInstance) {
            let config = column_config.filter(it => it.field === fields).pop();
            let {type} = config;
            responseData.push({
                field: fields,
                value: fields == 'section_config' ? JSON.stringify(SectionInstance[fields], null, "\t") : SectionInstance[fields],
                type
            })
        }
        res.json({success: true, data: responseData});
    } catch (error) {
        res.json({success: false, message: `failed to get sectiondata ${error.message}`});
    }
});

SectionRouter.post('/upload', multer({storage: storage}).any(), async (req, res) => {
    let file = req.files[0];
    const url = `http://localhost:3002/${file.destination}/${file.filename}`
    return res.json({
        url: url
    });
});

SectionRouter.post('/', (req, res) => {
    const {section, limit, order = {field: '_id', order: 'descend'}, page} = req.body;
    const Section = require(`../../../models/section`);
    var currentSection;
    Section.findOne({section_alias: section})
        .then(SectionConfig => {
            if (!SectionConfig) throw new Error("Section Not Found");
            const {section_config} = SectionConfig;
            const columns = section_config.columns.filter(feild => feild.list == true);
            let table_name = SectionConfig.section_table_name;
            currentSection = require(`../../../models/${table_name}`);
            let where = {is_deleted: {$ne: 1}};
            const projection = {};
            let relation_query = [];
            let unwind = [];
            for (const column of columns) {
                projection[column.field] = true;
                if (column.relation) {
                    const {from, foreignField, displayField} = column.relation;
                    relation_query.push(
                        {
                            $lookup: {
                                from: from,
                                localField: column.field,
                                foreignField: foreignField,
                                pipeline: [{$project: {[`${displayField}`]: true, _id: false}}],
                                as: column.field
                            }
                        },
                    )
                    unwind.push({$unwind: {path: `$${column.field}`}});
                }
            }
            let feild = order['field'];

            const Order = {feild: order['order'] == 'descend' ? -1 : 1};
            aggregate_query = [
                {$match: {is_deleted: {$ne: 1}}},
                ...relation_query,
                ...unwind,
                {$limit: limit},
                {$sort: Order}
            ]
            return currentSection.aggregate(aggregate_query)
        }).then(data => {
        let where = {is_deleted: {$ne: 1}};
        currentSection.count(where)
            .then(count => {
                res.json({success: true, data: data, count});
            })
    }).catch(err => {
        res.json({success: false, message: 'An error occured while getting records'});
    });
});
SectionRouter.post('/search', (req, res) => {
    const {section, search, pagination,sort} = req.body;
    getSection(section)
        .then(Section => {
            const {section_table_name,section_config} = Section;
            var {page, limit} = pagination;
            var {text} =search;
            const currentSection = require(`../../../models/${section_table_name}`);
            const Order = {};
            Order[sort.field] = sort['order'] == 'descend' ? -1 : 1
            const searchableColumns = section_config.columns.filter(feild => feild.searchable == true);
            let relation_query = [];
            let unwind = [];
            const projection = {};
            const match_query=[];
            for (const column of searchableColumns) {
                if (column.list === true) {
                    projection[column.field] = true;
                }
                if(column.relation) {
                    const {from, foreignField, displayField} = column.relation;
                    relation_query.push(
                        {
                            $lookup: {
                                from: from,
                                localField: column.field,
                                foreignField: foreignField,
                                pipeline: [{$project: {[`${displayField}`]: true, _id: false}}],
                                as: column.field
                            }
                        }
                    );
                    unwind.push({$unwind: {path: `$${column.field}`}});
                }
                if (column.dbtype&&(column.dbtype == 'number' || column.dbtype == 'Number')) {
                    match_query.push({[`${column.field}`]: text});
                } else if (column.dbtype&&(column.dbtype == 'Array' || column.dbtype == 'array')) {
                    match_query.push({[`${column.field}`]: {$in: [text]}});
                } else {
                    if(column.relation) {
                        const {displayField} = column.relation
                        match_query.push({[`${column.field}.${displayField}`]: {$regex: text, $options: 'i'}});
                    }else {
                        match_query.push({[`${column.field}`]: {$regex: text, $options: 'i'}});
                    }
                }
            }
            const aggregate_query = [
                {$match: {is_deleted: {$ne: 1}}},
                ...relation_query,
                ...unwind,
                {$match:{$or:match_query}},
                {$skip:limit*page},
                {$limit: limit},
                {$sort: Order}
            ];
            console.dir(aggregate_query,{depth:null})
            return currentSection.aggregate(aggregate_query);
        }).then(data=>{
        res.json({success: true, data: data});
    });
})

SectionRouter.post('/sectionSort', (req, res) => {
    const {section, sort, pagination} = req.body;
    getSection(section)
        .then(section => {
            const {section_table_name} = section;
            var {page, limit} = pagination;
            const currentSection = require(`../../../models/${section_table_name}`);
            const Order = {};
            Order[sort.field] = sort['order'] == 'descend' ? -1 : 1
            currentSection.find({is_deleted: {$ne: 1}})
                .skip(page * limit)
                .limit(limit)
                .sort(Order)
                .then(data => {
                    // let where ={is_deleted:{$ne:1}};
                    // currentSection.count(where)
                    // .then(count=>{
                    //     res.json({success:true,data:data,count});
                    // })
                    res.json({success: true, data: data});
                }).catch(err => {
                    console.log(err)
                res.json({success: false, message: 'An error occured while getting records'});
            });
        })

});

function getSection(section, projection = {}) {
    const Section = require(`../../../models/section`);
    return new Promise((resolve, reject) => {
        return Section.findOne({section_alias: section}, projection)
            .then(result => {
                if (!result) reject("Section Not Found");
                resolve(result);
            }).catch(err => {
                reject("Section Not Found");
            });
    });
}

module.exports = SectionRouter;
