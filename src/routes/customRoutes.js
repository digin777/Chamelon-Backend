const express = require("express");
const customRoute = express.Router();
customRoute.post('/getgenres',(req,res)=>{
    const genre = require('../../models/genres');
    genre.find({},{label:'$title',value:'$_id'})
        .then(result=>{
            res.json({success:true,data:result})
        })
})
module.exports = customRoute;