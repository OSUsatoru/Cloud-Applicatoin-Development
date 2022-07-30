/*
 * API sub-router for businesses collection endpoints.
 */

const {Router}  = require('express')
const multer = require('multer')
const crypto = require('crypto')

const { validateAgainstSchema } = require('../lib/validation')
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  saveImageFile,
  saveImageInfo,
  getImageInfoById,
  getImageDownloadStream,
  getDownloadThumbStreamByName
} = require('../models/photo')

const { connectToRabbitMQ, getChannel } = require('../lib/rabbitmq')

const queue = 'images'

const router = Router()

const fileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
  //'image/gif': 'gif'
}

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: function (req, file, callback) {
      const ext = fileTypes[file.mimetype]
      const filename = crypto.pseudoRandomBytes(16).toString('hex')
      callback(null, `${filename}.${ext}`)
    }
  }),
  fileFilter: function (req, file, callback) {
    callback(null, !!fileTypes[file.mimetype])
  }
})
/*
 * POST /photos - Route to create a new photo.
 */
router.post('/', upload.single('image'), async (req, res,next) => {
  console.log("== dirname: ", __dirname)
  console.log("== req.file:", req.file)
  console.log("== req.body:", req.body)

  if (req.file && req.body && req.body.userId) {
    try{
      const image = {
        userId: req.body.userId,
        path: req.file.path,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        businessId: req.body.businessId,
        caption: req.body.caption
      }
      console.log("== test:", image)

      //const id = await saveImageInfo(image)
      const id = await saveImageFile(image)

      const channel = getChannel()
      channel.sendToQueue(queue, Buffer.from(id.toString()))
      res.status(200).send({ id: id })
    }catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
      })
    }

  } else {
    res.status(400).send({
      err: 'Request body needs an "image" (jpg or png) and a "userId"'
    })
  }

  /*
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    try {
      const id = await insertNewPhoto(req.body)
      res.status(201).send({
        id: id,
        links: {
          photo: `/photos/${id}`,
          business: `/businesses/${req.body.businessId}`
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    })
  }*/
})

/*
 * GET /photos/{id} - Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  console.log("== test: ", req.params.id)
  try {
    const image = await getImageInfoById(req.params.id);
    if (image) {
      const resBody = {
        _id: image._id,
        url: `/media/images/${image.filename}`,
        mimetype: image.metadata.mimetype,
        userId: image.metadata.userId,
        businessId: image.metadata.businessId,
        caption: image.metadata.caption,
        thumbId: image.metadata.thumbId

      }
      res.status(200).send(resBody);
    } else {
      next();
    }
  } catch (err) {
    //next(err);
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch image.  Please try again later."
    })
  }
})

//router.use('/media/images/', Router.static(`${__dirname}/uploads`))

router.get('/media/images/:filename', function (req, res, next) {
  console.log("== filename ", req.params.filename)
  getImageDownloadStream(req.params.filename)
    .on('file', function (file) {
      res.status(200).type(file.metadata.mimetype)
    })
    .on('error', function (err) {
      if (err.code === 'ENOENT') {
        console.log("== testing")
        next()
      } else {
        next(err)
      }
    })
    .pipe(res)
})

router.get('/media/thumbs/:filename', async function (req, res, next) {
  console.log("== filename ", req.params.filename)
  getDownloadThumbStreamByName(req.params.filename)
    .on('file', function (file) {
      res.status(200).type("image/jpg")
    })
    .on('error', function (err) {
      if (err.code === 'ENOENT') {
        console.log("== testing")
        next()
      } else {
        next(err)
      }
    })
    .pipe(res)
})
/*
router.get('/media/thumbs/:filename', async function (req, res, next) {
  console.log("== filename ", req.params.filename)
  try {
    const image = await getImageInfoById(req.params.id);
    if (image) {
      trhumbId = image.metadata.thumbId
      getDownloadThumbStreamByName(trhumbId)
      .on('file', function (file) {
        res.status(200).type(file.metadata.mimetype)
      })
      .on('error', function (err) {
        if (err.code === 'ENOENT') {
          console.log("== testing")
          next()
        } else {
          next(err)
        }
      })
      .pipe(res)

    } else {
      next();
    }
  } catch (err) {
    //next(err);
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch image.  Please try again later."
    })
  }
})*/

module.exports = router





