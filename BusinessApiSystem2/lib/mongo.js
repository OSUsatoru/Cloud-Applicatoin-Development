const { MongoClient } = require('mongodb')

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;

/*
const mongoHost="localhost"
const mongoUser="root"
const mongoPassword="yamamsat"
const mongoDBName="yamamsat"
*/
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`

let db = null
exports.connectToDb = function (callback) {
    MongoClient.connect(mongoURL, function (err, client) {
        if (err) {
            throw err
        }
        db = client.db(mongoDBName)
        callback()
    })
}

exports.getDbInstance = function () {
    return db
}