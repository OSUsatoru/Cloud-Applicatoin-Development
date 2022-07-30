const { Router } = require('express')
const { ValidationError } = require('sequelize')

const {UserClientFields, User} = require('../models/user')
const {generateAuthToken, requireAuthentication, requireAuthentication_CreateUser} = require('../lib/auth')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const bcrypt = require('bcryptjs')

const router = Router()

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication, async function (req, res) {
  console.log("== user id: ",req.params.userId)
  console.log("== auth id: ",req.user.sub)

  if(req.user.sub != req.params.userId&& req.user.admin == false){
    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{
    const userId = req.params.userId
    const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
    res.status(200).json({
      businesses: userBusinesses
    })
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews',requireAuthentication, async function (req, res) {
  console.log("== user id: ",req.params.userId)
  console.log("== auth id: ",req.user.sub)
  if(req.user.sub != req.params.userId&& req.user.admin == false){
    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{
    const userId = req.params.userId
    const userReviews = await Review.findAll({ where: { userId: userId }})
    res.status(200).json({
      reviews: userReviews
    })
  }

})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, async function (req, res) {
  console.log("== user id: ",req.params.userId)
  console.log("== auth id: ",req.user.sub)
  if(req.user.sub != req.params.userId&& req.user.admin == false){
    res.status(403).send({
         err: "Unauthorized to access the specified resource"
    })
    //next()
  }else{
    const userId = req.params.userId
    const userPhotos = await Photo.findAll({ where: { userId: userId }})
    res.status(200).json({
      photos: userPhotos
    })
  }

})



/* Insert new user*/
/* Only admin user can create admin user */

router.post('/', requireAuthentication_CreateUser, async function (req, res){

  createTest = false
  if(req.body.admin == null || req.body.admin == false){
    console.log("no admin")
    createTest = true
  }else{
    // create admin user
    console.log("admin")
    if(req.user == null || req.user.admin == false){
      createTest = false
    }else{
      createTest = true
    }
  }

  /* if createTest, create. Otherwise error */
  if(createTest){
    try {
      const result_id = await insertNewUser(req.body)
      res.status(201).send({ id: result_id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
  }else{
    res.status(403).send({
      error: "Only a user with admin permissions may create other admin users"
    });
  }


})



/* Get specific user info */
router.get('/:userId', requireAuthentication, async function (req, res, next) {
  // req.user is user id authorized
  console.log("== req:", req.user.sub)
  console.log("== admin:", req.user.admin)
  if(req.user.sub != req.params.userId){
      res.status(403).send({
           err: "Unauthorized to access the specified resource"
      })
      //next()
  }else{
    const userId = req.params.userId
    const user = await getUserById(userId, false)
    if (user) {
      res.status(200).send(user)
    } else {
      next()
    }
  }

})

router.post('/login', async function(req, res){
  if(req.body && req.body.email && req.body.password){
    const user = await getUserByEmail(req.body.email, true)
    //const authenticated = user && await bcrypt.compareSync(
    const authenticated = user && await bcrypt.compare(
      req.body.password,
      user.password
    )
    if (authenticated) {
      console.log("==userID: ",user.id)
      const token = generateAuthToken(user.id, user.admin)
      res.status(200).send({ token: token })

    } else {
      res.status(401).send({
          error: "Invalid credentials"
      })
    }
  }else{
    res.status(400).send({
      error: "Request needs user Email and password."
    })
  }

})

/*
  Add functions
 */
async function insertNewUser(user) {
  // beucase user password will be encripted when it is stored into database
  // I should not encrypt password here.

  //const hashed = await bcrypt.hash(userToInsert.password, 8)
  //userToInsert.password = hashed
  //console.log("== Hashed, salted password1:", hashed)
  //userToInsert.password = await bcrypt.hash(userToInsert.password, 8)
  //userToInsert.password = await bcrypt.hashSync(userToInsert.password, 8)
  //console.log("== Hashed, salted password2:", userToInsert.password)



  const result = await User.create(user, UserClientFields)
  return result.id

  }

async function getUserById(id, includePassword){
  if(includePassword){
    const user = await User.findByPk(id)
    return user
  }else{
    // add createdAt and updateAt data if you need
    const user = await User.findByPk(id, {attributes: {exclude: ['password'] }})
    return user
  }

}

async function getUserByEmail(userEmail, includePassword){
  if(includePassword){
    const user = await User.findOne({where: {email: userEmail}})
    return user
  }else{
    // add createdAt and updateAt data if you need
    const user = await User.findOne(id,{where: {email: userEmail}}, {attributes: {exclude: ['password'] }})
    return user
  }

}


/* debug */
/* Get specific user info (display all data) */
router.get('/test/:userId', async function (req, res, next) {
  const userId = req.params.userId
  const user = await User.findByPk(userId)
  if (user) {
    res.status(200).send(user)
  } else {
    next()
  }
})

/* Get specific user info (display all data) */
router.get('/test/email/:userEmail', async function (req, res, next) {
  const userEmail = req.params.userEmail
  const user = await User.findOne({where: {email: userEmail}})
  if (user) {
    res.status(200).send(user)
  } else {
    next()
  }
})


module.exports = router
