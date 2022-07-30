const router = require('express').Router();

exports.router = router;

const { getDbInstance } = require('../lib/mongo')
const { ObjectId } = require('mongodb');

const { businesses } = require('./businesses');
const { reviews } = require('./reviews');
const { photos } = require('./photos');

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res) {
  const userid = parseInt(req.params.userid);
  const businesses = await getBusinessByUId(userid);
  const userBusinesses = businesses.filter(business => business && business.ownerid === userid);
  if(userBusinesses){
    res.status(200).send({
      business: userBusinesses
    })
  }else{
    res.status(400).send({
      err: "No match userid in business"
    })
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/photos', async function (req, res) {
  const userid = parseInt(req.params.userid);
  const reviews = await getPhotoByUid(userid);
  const userReviews = reviews.filter(review => review && review.userid === userid);
  res.status(200).json({
    reviews: userReviews
  });
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/reviews', async function (req, res) {
  const userid = parseInt(req.params.userid);
  const photos = await getReviewByUid(userid);
  const userPhotos = photos.filter(photo => photo && photo.userid === userid);
  res.status(200).json({
    photos: userPhotos
  });
});

/*
  created functoins
****************************************************************/
async function getBusinessByUId(id){
  const db = getDbInstance()
  const collection = db.collection('businesses')

  const businesses = await collection.find({
    ownerid: id
  }).toArray()
  return businesses
}
async function getPhotoByUid(id){
  const db = getDbInstance()
  const collection = db.collection('photos')

  const photos = await collection.find({
    userid: id
  }).toArray()
  return photos
}
async function getReviewByUid(id){
  const db = getDbInstance()
  const collection = db.collection('reviews')

  const reviews = await collection.find({
    userid: id
  }).toArray()
  return reviews
}