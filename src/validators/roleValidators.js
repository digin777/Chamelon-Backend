const Joi = require('joi');
const RoleValidator  = Joi.object({
    name: Joi.string()
    .required()
    .messages({'string.required':'Name is Required'})
});
module.exports = {
    createrole:RoleValidator
    
};