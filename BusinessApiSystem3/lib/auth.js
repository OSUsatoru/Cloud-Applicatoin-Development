const jwt = require('jsonwebtoken')

const secret = "SuperSecret"

function generateAuthToken(userId, admin) {
    console.log("==GEN ID: ", userId)
    console.log("==GEN ADMIN: ", admin)
    const payload = { sub: userId, admin: admin}
    return jwt.sign(payload, secret, { expiresIn: '24h' })
}
exports.generateAuthToken = generateAuthToken


function requireAuthentication(req, res, next) {
    const authHeader = req.get('authorization') || ''
    const authParts = authHeader.split(' ')
    const token = authParts[0] === 'Bearer' ? authParts[1] : null

    try {
        const payload = jwt.verify(token, secret)
        console.log("== payload:", payload)
        req.user = payload
        next()
    } catch (err) {
        res.status(401).send({
            err: "Invalid authentication token"
        })
    }
}
exports.requireAuthentication = requireAuthentication

function requireAuthentication_CreateUser(req, res, next) {
    const authHeader = req.get('authorization') || ''
    const authParts = authHeader.split(' ')
    const token = authParts[0] === 'Bearer' ? authParts[1] : null
    console.log("==token:", token);
    // if no token, it's also fine to create user
    if(token == null){
        req.user=null
        next()
    }else{
        try {
            const payload = jwt.verify(token, secret)
            console.log("== payload:", payload)
            req.user = payload
            next()
        } catch (err) {
            res.status(401).send({
                err: "Invalid authentication token"
            })
        }
    }

}
exports.requireAuthentication_CreateUser = requireAuthentication_CreateUser