const express = require("express");
const SectionRouter = express.Router();
const { ConstructModel } = require('../../../lib/utlity');
const multer  = require('multer');
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
// const uploadMiddleware=upload.fields([{ name: 'uploads' }])
// SectionRouter.use(multer().any())  multer({storage: storage}).any(),
SectionRouter.post('/add', async (req, res) => {
    const { section, data } = req.body;
    const Section = require(`../../../models/section`);
    if (section === 'section') {
        data.section_config = await JSON.parse(data.section_config);
        let section_name = data.section_table_name;
        try {
            let status=await ConstructModel(data.section_config, section_name);
        } catch (error) {
            return res.json({ success: false, message: `failed to add record Model creation failed` })
        }
    }
    try {
        let SectionConfig = await Section.findOne({ section_alias: section });
        if (!SectionConfig) throw Error('Section not found');
        let table_name = SectionConfig.section_table_name;
        let currentSection = require(`../../../models/${table_name}`);
        let SectionInstance = new currentSection(data);
        await SectionInstance.save()
        res.json({ success: true, message: 'Record added sucessfully' })
    } catch (error) {
        res.json({ success: false, message: `failed to add record ${error.message}` })
    }
})

SectionRouter.post('/sectionDataById', async (req, res) => {
    const { section, id } = req.body;
    const Section = require(`../../../models/section`);
    try {
        let SectionConfig = await Section.findOne({ section_alias: section });
        if (!SectionConfig) throw Error('Section not found');
        let table_name = SectionConfig.section_table_name;
        let {columns:column_config} = SectionConfig.section_config;
        let currentSection = require(`../../../models/${table_name}`);
        const section_id = `${section}_id`;
        let projection = {
            "_id": 0,
            "__v": 0,
            "created_at": 0,
            "created_user_id": 0,
            "is_deleted": 0,
        }
        projection[section_id.toString()]=0;
        let SectionInstance = await currentSection.findOne({ _id: id }, projection);
        if (!SectionInstance) throw Error('no data found');
        SectionInstance=SectionInstance.toJSON();
        responseData=[];
        for (fields in SectionInstance){
            let config = column_config.filter(it=>it.field===fields).pop();
            let {type} =config;
            responseData.push({
                field:fields,
                value:SectionInstance[fields],
                type
            })
        }
        res.json({ success: true, data: responseData });
    } catch (error) {
        res.json({ success: false, message: `failed to get sectiondata ${error.message}` });
    }
});

SectionRouter.post('/upload',multer({storage: storage}).any(), async (req, res) => {
    console.dir(req.files,{depth:null});
    let file = req.files[0];
    const url = `http://localhost:3002/${file.destination}/${file.filename}`
    return res.json({
        url: url
    });
});
module.exports = SectionRouter;
