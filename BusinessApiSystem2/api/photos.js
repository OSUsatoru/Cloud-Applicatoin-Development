const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

const { getDbInstance } = require('../lib/mongo')
const { ObjectId } = require('mongodb');

const photos = require('../data/photos');

exports.router = router;
exports.photos = photos;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};

router.get("/", async function (req, res) {
  const photos = await getAllphotos()
  res.status(200).send({
    photos: photos
  })
})

/*
 * Route to create a new photo. (done)
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    const photo = extractValidFields(req.body, photoSchema);
    //photo.id = photos.length;
    //photos.push(photo);
    const id = await insertNewPhoto(req.body)


    res.status(201).send({
      id: id,
      links: {
        photo: `/photos/${id}`,
        business: `/businesses/${photo.businessid}`
      }
    });
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo. (done)
 */
router.get('/:photoID', async function (req, res, next) {
  const photoID = req.params.photoID;
  const photo = await getPhotoById(photoID)
  if(photo){
    res.status(200).send({
      photo: photo
    })
  }else{
    res.status(400).send({
      err: "No match photoID"
    })
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {
  const photoID = req.params.photoID;
  if (validateAgainstSchema(req.body, photoSchema)){
    const updateSuccessful = await updatePhotoById(photoID, req.body);
    if (updateSuccessful) {
      res.status(204).send();
    } else {
      next();
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid photo."
    })
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', async function (req, res, next) {
  const photoID = req.params.photoID;
  const deleteSuccessful = await deletePhotoById(photoID);
  if (deleteSuccessful) {
    res.status(204).end();
  } else {
    next();
  }
});

/*
  created functoins
****************************************************************/
async function getAllphotos(){
  const db = getDbInstance()
  const collection = db.collection('photos')

  const results = await collection.find({}).toArray()
  return results
}

async function insertNewPhoto(photo){
  const db = getDbInstance()
  const collection = db.collection('photos')

  photo = extractValidFields(photo, photoSchema)
  //console.log("test: ", business)
  const result = await collection.insertOne(photo)
  return result.insertedId
}

async function getPhotoById(id){
  const db = getDbInstance()
  const collection = db.collection('photos')

  const photos = await collection.find({
    _id: new ObjectId(id)
  }).toArray()
  return photos[0]
}

async function updatePhotoById(id, photo) {
  const db = getDbInstance()
  const collection = db.collection('photos')

  photo = extractValidFields(photo,photoSchema)
  const photoValues = {
    userid: photo.userid,
    businessid:photo.businessid,
    caption: photo.caption
  };


  const result = await collection.replaceOne(
    { _id: new ObjectId(id) },
    photoValues
  );
  return result.matchedCount > 0;

}


async function deletePhotoById(id) {
  const db = getDbInstance()
  const collection = db.collection('photos')

  const result = await collection.deleteOne(
    {_id: new ObjectId(id) }
  )
  return result.deletedCount > 0
}