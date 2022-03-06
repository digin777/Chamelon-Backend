const Joi = require('joi');
const UserRegisterSchema  = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({'string.required':'Email is Required.'}),
    password: Joi.alternatives()
    .try(Joi.string(), Joi.number())
    .required()
});
const UserLoginSchema  = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({'string.required':'Email is Required'}),
    password: Joi.alternatives()
            .try(Joi.string(), Joi.number())
            .required()
});

module.exports = {
    register:UserRegisterSchema ,
    login:UserLoginSchema
};