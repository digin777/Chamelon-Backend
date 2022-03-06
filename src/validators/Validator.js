const UserValidator = require('./userValidators')
const RoleValidators = require('./roleValidators')
module.exports = {
    ...UserValidator,
    ...RoleValidators
}