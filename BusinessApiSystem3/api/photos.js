const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Photo, PhotoClientFields } = require('../models/photo')
const {requireAuthentication} = require('../lib/auth')

const router = Router()

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication,async function (req, res, next) {
  console.log("== user id: ",req.body.userId)
  console.log("== auth id: ",req.user.sub)
  if(req.user.sub != req.body.userId && req.user.admin == false){
    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{
    try {
      const photo = await Photo.create(req.body, PhotoClientFields)
      res.status(201).send({ id: photo.id })
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
 * Route to fetch info about a specific photo.
 */
router.get('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId
  const photo = await Photo.findByPk(photoId)
  if (photo) {
    res.status(200).send(photo)
  } else {
    next()
  }
})

/*
 * Route to update a photo.
 */
router.patch('/:photoId', requireAuthentication, async function (req, res, next) {
  const photoId = req.params.photoId
  const photo = await Photo.findByPk(photoId)

  console.log("== user id: ",photo.userId)
  console.log("== auth id: ",req.user.sub)
  if(req.user.sub != photo.userId&& req.user.admin == false){

    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{


    /*
    * Update photo without allowing client to update businessId or userId.
    */
    const result = await Photo.update(req.body, {
      where: { id: photoId },
      fields: PhotoClientFields.filter(
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
 * Route to delete a photo.
 */
router.delete('/:photoId',requireAuthentication, async function (req, res, next) {
  const photoId = req.params.photoId
  const photo = await Photo.findByPk(photoId)
  console.log("== user id: ",photo.userId)
  console.log("== auth id: ",req.user.sub)
  if(req.user.sub != photo.userId&& req.user.admin == false){

    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{

    const result = await Photo.destroy({ where: { id: photoId }})
    if (result > 0) {
      res.status(204).send()
    } else {
      next()
  }
  }

})

module.exports = router
