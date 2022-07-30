const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

const { getDbInstance } = require('../lib/mongo')
const { ObjectId } = require('mongodb');

const reviews = require('../data/reviews');

exports.router = router;
exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};

router.get("/", async function (req, res) {
  const reviews = await getAllReview()
  res.status(200).send({
    reviews: reviews
  })
})

/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {

    const review = extractValidFields(req.body, reviewSchema);
    const id = await insertNewReview(req.body)
    /*
     * Make sure the user is not trying to review the same business twice.
     */

      res.status(201).send({
        id: id,
        links: {
          review: `/reviews/${id}`,
          business: `/businesses/${review.businessid}`
        }
      });
    }else {
    res.status(400).send({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
  const reviewID = req.params.reviewID;
  const review = await getReviewById(reviewID);
  if (reviews) {
    res.status(200).send(review);
  } else {
    res.status(400).send({
      err: "No match reviewID"
    })
  }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  const reviewID = req.params.reviewID;
  if (validateAgainstSchema(req.body, reviewSchema)){
    const updateSuccessful = await updateReviewById(reviewID, req.body);
    if (updateSuccessful) {
      res.status(204).send();
    } else {
      next();
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid review."
    })
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
  const reviewID = req.params.reviewID;
  const deleteSuccessful = await deleteReviewById(reviewID);
  if (deleteSuccessful) {
    res.status(204).end();
  } else {
    next();
  }
});

/*
  created functoins
****************************************************************/

async function insertNewReview(review){
  const db = getDbInstance()
  const collection = db.collection('reviews')

  review = extractValidFields(review,reviewSchema)

  const result = await collection.insertOne(review)
  return result.insertedId
}

async function getAllReview(){
  const db = getDbInstance()
  const collection = db.collection('reviews')

  const results = await collection.find({}).toArray()
  return results
}

async function getReviewById(id){
  const db = getDbInstance()
  const collection = db.collection('reviews')

  const reviews = await collection.find({
    _id: new ObjectId(id)
  }).toArray()
  return reviews[0]
}

async function updateReviewById(id, review) {
  const db = getDbInstance()
  const collection = db.collection('reviews')

  review = extractValidFields(review,reviewSchema)
  const reviewValues = {
    userid: review.userid,
    businessid: review.businessid,
    dollars: review.dollars ,
    stars: review.stars,
    review: review.review
  };


  const result = await collection.replaceOne(
    { _id: new ObjectId(id) },
    reviewValues
  );
  return result.matchedCount > 0;
}

async function deleteReviewById(id) {
  const db = getDbInstance()
  const collection = db.collection('reviews')

  const result = await collection.deleteOne(
    {_id: new ObjectId(id) }
  )
  return result.deletedCount > 0
}