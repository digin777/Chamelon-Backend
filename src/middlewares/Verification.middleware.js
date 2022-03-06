const jose = require('jose');
const { symetric } = require('../../lib/keys')
async function isLogged(req, res, next) {
    const jwt = req.token;
    const symetricKey = await jose.importPKCS8(symetric, 'EdDSA');
    try {
        const { payload, protectedHeader } = await jose.jwtVerify(jwt, symetricKey, {
            issuer: 'urn:monco:issuer',
            audience: 'urn:monco:audience'
        });
        req.tokenInfo = payload;
        const { jti } = req.tokenInfo;
        //let value = moncocache.get(jti);
        await memcached.get(jti, function (err, data) {
            try {
                if (err)
                    throw new Error("Unauthorized")
                if (data != undefined) {
                    throw new Error("Unauthorized")
                }
            } catch (errors) {
                return res.status(400).json({ sucess: false, message: "Unauthorized" });
            }
            next();
        });
    } catch (error) {
        if (error instanceof jose.errors.JWTInvalid || error instanceof jose.errors.JWSInvalid) {
            return res.status(400).json({ sucess: false, message: "Unauthorized" });
        } else if (error instanceof jose.errors.JWTExpired) {
            return res.status(400).json({ sucess: false, message: "Unauthorized" });
        } else if (error instanceof jose.errors.JWTClaimValidationFailed) {
            return res.status(400).json({ sucess: false, message: "Not Valid Provider" })
        } else {
            return res.status(400).json({ sucess: false, message: "Unauthorized" });
        }
    }
}
function hasToken(req, res, next) {
    const authHeader = req.headers['x-access-token'];

    if (authHeader) {
        const token = authHeader;
        req.token = token;
        next();
    } else {
        res.status(400).json({ sucess: false, message: "No authorization token found" })
    }
}
var protectedRoute = [hasToken, isLogged]
module.exports = { isLogged, hasToken, protectedRoute }