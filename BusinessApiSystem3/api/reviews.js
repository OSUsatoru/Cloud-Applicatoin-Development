const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Review, ReviewClientFields } = require('../models/review')

const {requireAuthentication} = require('../lib/auth')

const router = Router()

/*
 * Route to create a new review.
 */
router.post('/',requireAuthentication, async function (req, res, next) {
  console.log("== user id: ",req.body.userId)
  console.log("== auth id: ",req.user.sub)
  if(req.user.sub != req.body.userId&& req.user.admin == false){


    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{
    try {
      const review = await Review.create(req.body, ReviewClientFields)
      res.status(201).send({ id: review.id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
  }

})

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId
  const review = await Review.findByPk(reviewId)
  if (review) {
    res.status(200).send(review)
  } else {
    next()
  }
})

/*
 * Route to update a review.
 */
router.patch('/:reviewId',requireAuthentication, async function (req, res, next) {
  const reviewId = req.params.reviewId
  const review = await Review.findByPk(reviewId)
  console.log("== user id: ",review.userId)
  console.log("== auth id: ",req.user.sub )

  if(req.user.sub != review.userId&& req.user.admin == false){

    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{
    /*
     * Update review without allowing client to update businessId or userId.
     */
    const result = await Review.update(req.body, {
      where: { id: reviewId },
      fields: ReviewClientFields.filter(
        field => field !== 'businessId' && field !== 'userId'
      )
    })
    if (result[0] > 0) {
      res.status(204).send()
    } else {
      next()
    }
  }


})

/*
 * Route to delete a review.
 */
router.delete('/:reviewId',requireAuthentication, async function (req, res, next) {
  const reviewId = req.params.reviewId
  const review = await Review.findByPk(reviewId)
  console.log("== user id: ",review.userId)
  console.log("== auth id: ",req.user.sub)

  if(req.user.sub != review.userId&& req.user.admin == false){
    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{
    const result = await Review.destroy({ where: { id: reviewId }})
    if (result > 0) {
      res.status(204).send()
    } else {
      next()
    }
  }


})

module.exports = router
