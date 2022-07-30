/*
 * Photo schema and data accessor methods.
 */
const sharp = require('sharp')
const Jimp = require("jimp")
const { ObjectId, GridFSBucket } = require('mongodb')
const fs = require("fs")
const crypto = require('crypto')
const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  businessId: { required: true },
  caption: { required: false }
}
exports.PhotoSchema = PhotoSchema

/*
 * Executes a DB query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
async function insertNewPhoto(photo) {
  photo = extractValidFields(photo, PhotoSchema)
  photo.businessId = ObjectId(photo.businessId)
  const db = getDbReference()
  const collection = db.collection('photos')
  const result = await collection.insertOne(photo)
  return result.insertedId
}
exports.insertNewPhoto = insertNewPhoto

/*
 * Executes a DB query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getPhotoById(id) {
  const db = getDbReference()
  const collection = db.collection('photos')
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray()
    return results[0]
  }
}
exports.getPhotoById = getPhotoById




async function saveImageInfo(image) {
  //console.log("1")
  const db = getDbReference()
  //console.log("2")
  const collection = db.collection('images')
  //console.log("3")
  const result = await collection.insertOne(image)
  //console.log("4")
  return result.insertedId;
}
exports.saveImageInfo = saveImageInfo




async function getImageInfoById(id){
  console.log("== test2: ", id)
  const db = getDbReference()
  //const collection = db.collection('images');
  const bucket = new GridFSBucket(db, { bucketName: 'images' })


  if (!ObjectId.isValid(id)) {
    console.log("== test3: isnotvalid")
    return null;
  } else {
    //const results = await collection.find({_id: new ObjectId(id) }).toArray()
    const results = await bucket.find({ _id: new ObjectId(id) }).toArray()
    //const results = await bucket.find().toArray()
      console.log("== test5: ", results)
    return results[0]
  }
}
exports.getImageInfoById = getImageInfoById

function saveImageFile(image) {
  return new Promise(function (resolve, reject) {
    const db = getDbReference()
    const bucket = new GridFSBucket(db, { bucketName: 'images' })
    const metadata = {
      userId: image.userId,
      mimetype: image.mimetype,
      businessId: image.businessId,
      caption: image.caption
    }
    const uploadStream = bucket.openUploadStream(image.filename, {
      metadata: metadata
    })
    fs.createReadStream(image.path).pipe(uploadStream)
      .on('error', function (err) {
        reject(err)
      })
      .on('finish', function (result) {
        console.log("== stream result:", result)
        resolve(result._id)
      })
  })
}

exports.saveImageFile = saveImageFile

function getImageDownloadStream (filename) {
  const db = getDbReference()
  const bucket = new GridFSBucket(db, { bucketName: 'images' })
  return bucket.openDownloadStreamByName(filename)
}
exports.getImageDownloadStream  = getImageDownloadStream

function getDownloadStreamById (id) {
  const db = getDbReference()
  const bucket = new GridFSBucket(db, { bucketName: 'images' })
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    return bucket.openDownloadStream(new ObjectId(id))
  }
}

exports.getDownloadStreamById  = getDownloadStreamById

async function saveThumbFile(image) {
    // https://blog.capilano-fw.com/?p=5744#resize
    //image = sharp(image)
    //image.resize(100, null)

      const db = getDbReference()
      const bucket = new GridFSBucket(db, { bucketName: 'thumbs' })
      const filename = crypto.pseudoRandomBytes(16).toString('hex')
      const metadata = {
        filename: filename
      }
      //https://www.npmjs.com/package/jimp
      Jimp.read(image).then(async thumb => {
        // Returns Promise
        const newthumb = await thumb.resize(100,100).getBufferAsync(Jimp.MIME_JPEG); //"image/jpeg"
        const uploadStream = bucket.openUploadStream(`${filename}.jpg`, {
          metadata: metadata
        })
          uploadStream.write(newthumb)
          uploadStream.end()
          console.log("== filename",filename)
          return filename
      }).catch(err => {
        console.error(err)
      })
      return filename


}

exports.saveThumbFile = saveThumbFile

async function updateThumbsTagsById (id, thumbId) {
  const db = getDbReference()
  const collection = db.collection('images.files')
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "metadata.thumbId": thumbId }}
    )
    return result.matchedCount > 0
  }
}

exports.updateThumbsTagsById  = updateThumbsTagsById

function getDownloadThumbStreamByName (filename) {
  const db = getDbReference()
  const bucket = new GridFSBucket(db, { bucketName: 'thumbs' })
  return bucket.openDownloadStreamByName(filename)

}

exports.getDownloadThumbStreamByName  = getDownloadThumbStreamByName

