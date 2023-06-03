const express = require("express");
const AdminRouter = express.Router();
var Section = require(`../../models/section`);
const SectionRoutes = require('./section/SectionRoutes')
const customRoutes =require('./customRoutes')


AdminRouter.post('/getColumnConfig',(req,res)=>{
    const {section}=req.body;
    const Section = require(`../../models/section`);
    const aggregate_query=[
        {$match:{section_alias:`${section}`}},
        {
                $project: {
                 _id:false, 
                  columns: {
                    $filter:{
                        input:"$section_config.columns",
                        as:"columns",
                        cond:{
                            "$eq":[
                                "$$columns.list",true
                             ]
                           }
                        }
                    },
                    pagination:"$section_config.pagination",
                    per_pagecount:"$section_config.per_pagecount",
                    status:true,
                    
               }
          }
     ];
     Section.aggregate(aggregate_query)
     .then(result=>{
        result=result[0];
         if(!result) 
            throw new Error("No Result");
        //  var {columns} = result;
        //  columns=columns.map(element => {
        //     return {
        //         title: element.label,
        //         width: 100,
        //         dataIndex: element.field,
        //         key: element.field,
        //     };
        // });
        // result.columns=columns;
        res.json({success:true,data:result});
     }).catch(err=>{
         res.json({success:false,message:"No result found"});
     });

});

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
        "section_config.columns.source_from":1,
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
AdminRouter.use('/customRoutes',customRoutes)
AdminRouter.use('/:section',SectionRoutes);
module.exports = AdminRouter;

