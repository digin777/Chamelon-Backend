const express = require("express");
const AdminRouter = express.Router();
var Section = require(`../../models/section`);
const SectionRoutes = require('./section/SectionRoutes')
AdminRouter.use('/:section',SectionRoutes)
// AdminRouter.post('/addsectionData', async (req, res) => {
//     const { section, data } = req.body;
//     data.section_config = await JSON.parse(data.section_config)
//     try {
//         let SectionInstance = new Section(data);
//         await SectionInstance.save()
//         res.json({ success: true, message: 'Record added sucessfully' })
//     } catch (error) {
//         res.json({ success: false, message: `filed to add record` })
//     }
// });

AdminRouter.post('/getSectionConfig', async (req, res) => {
    const { section } = req.body;
    let projection = {
        "section_config.columns.field": 1,
        "section_config.columns.type": 1,
        "section_config.columns.label": 1,
        "section_config.columns.class": 1,
        "section_config.columns.validators": 1,
        "section_config.columns.validations_msg": 1,
        "section_config.columns.source_type":1,
        "section_config.columns.source":1,
        "section_config.columns.additional":1,
        "section_config.columns.custom_felid":1,
        "section_config.columns.placeholder":1,
        "section_config.columns.custom_felid":1,
         "_id": 0
    }
    try {
        let sectionData = await Section.findOne({ section_alias: section }, projection)
        res.json({ success: true, data:sectionData })
    } catch (error) {
        res.json({ success: false, message: `filed to add record` })
    }
});
module.exports = AdminRouter;

