//status code list
//https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

// I realized that id 0 should not be used in database. It makes extra condition for if statement

const express = require('express')
const req = require('express/lib/request')

const business = require('./business.json');
const review = require('./review.json');
const photo = require('./photo.json');

const app = express()
const port = process.env.PORT || 8000


app.use(express.json())

app.listen(port, function(){
    console.log("== Server is listening on port: ", port)
})
/*
//app.use(function (req,res,next){
app.use((req, res, next) => {
        console.log("== Request received")
        console.log("== - METHOD:", req.method)
        console.log("== URL:", req.url)
        console.log("== HEADERS: ", req.headers)
        next()
})*/
// app.get()
// app.post()
// app.put()
// app.delete()
// app.patch()

app.get('/',function(req,res,next){
    res.status(200).send("cs493 assignment 1 ")
})



/* Business
    Business name
    Business street address
    Business city
    Business state
    Business ZIP code
    Business phone number
    Business category and subcategories (e.g. category "Restaurant" and subcategory "Pizza")

    optional for a new business
    Business website
    Business email
***************************************/
//get a list of businesses
app.get('/business', (req, res, next) => {
    res.status(200).send(business);
});
// to get information by id
//app.get('/business/:b_id', functoin (req, res, next) {
app.get('/business/:b_id', (req, res, next) =>{
    const id = req.params.b_id
    var check = false
    for(let i = 0; i < business.length; i++ ){
        if (business[i]!=null && business[i].b_id == id && check == false) {
            res.status(200).send(business[i])
            check = true
        }
    }
    if(check==false) {
        res.status(400).send({
            error: "No information for that id"
          })
        next()
    }
})
// to add information from json file
app.post('/business', (req, res, next) => {
    console.log("  - req.body:", req.body)
    if (req.body && req.body.b_id && req.body.name && req.body.street_address && req.body.city &&
        req.body.state && req.body.zip_code && req.body.phone && req.body.category&& req.body.subcategory) {

        /* Store data in database */
        res.status(201).send({
            b_id: req.body.b_id
        })
    } else {
        res.status(400).send({
        error: "No match to request JSON body"
      })
    }
  })

// edit info
app.patch('/business/:b_id', (req, res, next) =>{
    const id = req.params.b_id
    if (req.body && req.body.b_id && req.body.name && req.body.street_address && req.body.city &&
        req.body.state && req.body.zip_code && req.body.phone && req.body.category&& req.body.subcategory) {
            var check = false
            for(let i = 0; i < business.length; i++ ){
                if (business[i]!=null&&business[i].b_id == id && check == false) {
                    index = i
                    check = true
                }
            }
            if(check==true) {
                // update info
                if(req.body.b_id != null){
                    business[index].b_id = req.body.b_id
                }
                if(req.body.name != null){
                    business[index].name = req.body.name
                }
                if(req.body.street_address != null){
                    business[index].street_address = req.body.street_address
                }
                if(req.body.city != null){
                    business[index].city = req.body.city
                }
                if(req.body.state != null){
                    business[index].state = req.body.state
                }
                if(req.body.zip_code != null){
                    business[index].zip_code = req.body.zip_code
                }
                if(req.body.phone != null){
                    business[index].phone = req.body.phone
                }
                if(req.body.category != null){
                    business[index].category = req.body.category
                }
                if(req.body.subcategory != null){
                    business[index].subcategory = req.body.subcategory
                }
                if(req.body.website != null){
                    business[index].website = req.body.website
                }else{
                    business[index].website = null
                }
                if(req.body.email != null){
                    business[index].email = req.body.email
                }else{
                    business[index].email = null
                }
                res.status(201).send({
                    message: "editted"
                })
            }
        }else{
        res.status(400).send({
            error: "No match to request JSON body"
          })
        }
})

app.put('/business/update', (req, res, next) =>{
    //const id = req.params.b_id
    if (req.body && req.body.b_id && req.body.name && req.body.street_address && req.body.city &&
        req.body.state && req.body.zip_code && req.body.phone && req.body.category&& req.body.subcategory) {
            var check = false
            const id = req.body.b_id
            for(let i = 0; i < business.length; i++ ){
                if (business[i]!=null && business[i].b_id == id && check == false) {
                    business[i] = req.body
                    res.status(201).send({
                        message: "editted"
                    })
                    check = true
                }
            }

        }
    if(check == false){
        res.status(400).send({
        error: "No match to request JSON body"
        })
    }
})
// remove info
app.delete('/business/:b_id', (req, res, next) =>{
    const id = req.params.b_id
    var check = false
    for(let i = 0; i < business.length; i++ ){
        if (business[i]!=null && business[i].b_id == id && check == false) {
            business[i] = null;
            res.status(204).end();
            check = true
        }
    }
    if(check==false){
        res.status(400).send({
            error: "No match id"
        })
    }
})
/* Reviews
    A "star" rating between 0 and 5 (e.g. 4 stars)
    An "dollar sign" rating between 1 and 4, indicating how expensive the business is (e.g. 2 dollar signs)
    An optional written review (at most one)

***************************************/
//get a list of review
app.get('/review', (req, res, next) => {
    res.status(200).send(review);
});

// get information
app.get('/review/:b_id', (req, res, next) =>{
    const id = req.params.b_id
    var check = false
    for(let i = 0; i < review.length; i++ ){
        if (review[i]!=null && review[i].b_id == id && check == false) {
            res.status(200).send(review[i])
            check = true
        }
    }
    if(check==false) {
        res.status(400).send({
            error: "No review for that id"
        })
        next()
    }
})

// add information
app.post('/review', (req, res, next) => {
    const id = req.body.b_id
    // check 1 shoudl be false
    check1 = false
    for(let i = 0; i < review.length; i++ ){
        if (review[i]!=null && review[i].b_id == id && check1 == false) {
            check1 = true
        }
    }
    // check 1 shoudl be true
    check2 = false
    for(let i = 0; i < business.length; i++ ){
        if (business[i]!=null && business[i].b_id == id && check2 == false) {
            check2 = true
        }
    }
    if(check1 == false && check2 == true){
        if (req.body && req.body.b_id && req.body.rating && req.body.dollar_sign) {
            intRating = parseInt(req.body.rating)
            intDoll = req.body.dollar_sign.length
            if(0 <= intRating && intRating <=5 && 1 <= intDoll && intDoll <= 4){
                /* Store data in database */
                res.status(201).send({
                    mes: "created"
                })
            }else{
                res.status(400).send({
                    error: "star rating between 0 and 5. dollar sign rating between 1 and 4"
                })
            }

        } else {
            res.status(400).send({
            error: "No match to request JSON body"
          })
        }
    }else{
        res.status(400).send({
            error: "Review is already exist, or there is no business"
        })
    }

  })
// edit information
app.put('/review/update', (req, res, next) =>{
    //const id = req.params.b_id
    if (req.body && req.body.b_id && req.body.rating && req.body.dollar_sign) {
            var check = false
            const id = req.body.b_id
            for(let i = 0; i < review.length; i++ ){
                if (review[i]!=null && review[i].b_id == id && check == false) {

                    intRating = parseInt(req.body.rating)
                    intDoll = req.body.dollar_sign.length
                    if(0 <= intRating && intRating <=5 && 1 <= intDoll && intDoll <= 4){
                        review[i] = req.body
                        res.status(201).send({
                            message: "editted"
                        })
                    }else{
                        res.status(400).send({
                            error: "star rating between 0 and 5. dollar sign rating between 1 and 4"
                          })
                    }



                    check = true
                }
            }

        }
    if(check == false){
        res.status(400).send({
        error: "No match to request JSON body"
        })
    }
})
// remove information
app.delete('/review/:b_id', (req, res, next) =>{
    const id = req.params.b_id
    var check = false
    for(let i = 0; i < review.length; i++ ){
        if (review[i]!=null &&review[i].b_id == id && check == false) {
            review[i] = null;
            res.status(204).end();
            check = true
        }
    }
    if(check==false){
        res.status(400).send({
            error: "No review for that id"
        })
    }
})
/* Photos
    Users may upload image files containing photos of an existing business. Each photo may have an associated caption.
    Users may remove any photo they've uploaded, and they may modify the caption of any photo they've uploaded.
    Users may list all of the businesses they own.
    Users may list all of the reviews they've written.
    Users may list all of the photos they've uploaded.
***************************************/
//get a list of review
app.get('/photo', (req, res, next) => {
    res.status(200).send(review);
});

// get information

app.get('/photo/:b_id', (req, res, next) =>{
    const id = req.params.b_id
    var check = false
    for(let i = 0; i < photo.length; i++ ){
        if (photo[i]!=null&&photo[i].b_id == id && check == false) {
            res.status(200).send(photo[i])
            check = true
        }
    }
    if(check==false) {
        res.status(400).send({
            error: "No photo for that id"
        })
        next()
    }
})

// add information
app.post('/photo', (req, res, next) => {
    const id = req.body.b_id
    // check 1 shoudl be false
    check1 = false
    for(let i = 0; i < photo.length; i++ ){
        if (photo[i]!=null&&photo[i].b_id == id && check1 == false) {
            check1 = true
        }
    }
    // check 1 shoudl be true
    check2 = false
    for(let i = 0; i < business.length; i++ ){
        if (business[i]!=null&&business[i].b_id == id && check2 == false) {
            check2 = true
        }
    }
    if(check1 == false && check2 == true){
        if (req.body && req.body.b_id && req.body.image) {
                /* Store data in database */
                res.status(201).send({
                    mes: "created"
                })
            }
    }else{
        res.status(400).send({
            error: "There is no business"
        })
    }

  })
// edit information
app.put('/photo/update', (req, res, next) =>{
    //const id = req.params.b_id
    if (req.body && req.body.b_id && req.body.image) {
            var check = false
            const id = req.body.b_id
            for(let i = 0; i < photo.length; i++ ){
                if (photo[i]!=null&&photo[i].b_id == id && check == false) {
                    photo[i] = req.body
                    res.status(201).send({
                        message: "editted"
                    })
                    check = true
                }
            }

        }
    if(check == false){
        res.status(400).send({
        error: "No match to request JSON body"
        })
    }
})

//remove informatoin
app.delete('/photo/:b_id', (req, res, next) =>{
    const id = req.params.b_id
    var check = false
    for(let i = 0; i < photo.length; i++ ){
        if (photo[i]!=null&&photo[i].b_id == id && check == false) {
            photo[i] = null;
            res.status(204).end();
            check = true
        }
    }
    if(check==false){
        res.status(400).send({
            error: "No review for that id"
        })
    }
})
// for error case
//app.use('*', functoin(req,res,next)  {
app.use('*', (req,res,next) => {
    res.status(404).send({
        err: "This URL was not recognized: " + req.originalUrl
    })
})