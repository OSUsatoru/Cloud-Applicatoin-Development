const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

const { getDbInstance } = require('../lib/mongo')

const businesses = require('../data/businesses');
const { reviews } = require('./reviews');
const { photos } = require('./photos');
const { ObjectId } = require('mongodb');

exports.router = router;
exports.businesses = businesses;

// no need to export schema
/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};

/*
 * Route to return a list of businesses. (done)
 */
/*
router.get("/", async function (req, res) {
  const business = await getAllBusiness()
  res.status(200).send({
    business: business
  })
})*/

router.get('/', async function (req, res) {

   //*
   //* Compute page number based on optional query string parameter `page`.
   //* Make sure page is within allowed bounds.
   //*
  const businesses = await getAllBusiness()
  let page = parseInt(req.query.page) || 1;
  const numPerPage = 10;
  const lastPage = Math.ceil(businesses.length / numPerPage);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;

 //*
 //* Calculate starting and ending indices of businesses on requested page and
 //* slice out the corresponsing sub-array of busibesses.
 //*
  const start = (page - 1) * numPerPage;
  const end = start + numPerPage;
  const pageBusinesses = businesses.slice(start, end);

  //*
  //* Generate HATEOAS links for surrounding pages.
  //*
  const links = {};
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`;
    links.lastPage = `/businesses?page=${lastPage}`;
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`;
    links.firstPage = '/businesses?page=1';
  }

  ///*
  // * Construct and send response.
  // *
  res.status(200).send({
    businesses: pageBusinesses,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: businesses.length,
    links: links
  });

})


/*
 * Route to create a new business. (done)
 */

router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, businessSchema)) {
    // dont need cuz insertNewBusiness check it
    // const business = extractValidFields(req.body, businessSchema);
    //console.log(req.body)
    const id = await insertNewBusiness(req.body)
    res.status(200).send({id: id})

  } else {
    res.status(400).send({
      err: "Request body is not a valid business object"
    })
  }
});

/*
 * Route to fetch info about a specific business. (done)
 */

router.get("/:businessid", async function (req, res) {
    const business = await getBusinessById(req.params.businessid);
    if(business){
      res.status(200).send({
        business: business
      })
    }else{
      res.status(400).send({
        err: "No match businessid"
      })
    }
})

/*
 * Route to replace data for a business.
 */

router.put('/:businessid', async function (req, res, next) {
  if (validateAgainstSchema(req.body, businessSchema)) {
  const updateSuccessful = await updateBusinessById(req.params.businessid, req.body);
  if (updateSuccessful) {
    res.status(204).send();
  } else {
    next();
  }
} else {
  res.status(400).send({
    err: "Request body does not contain a valid business."
  })
  }
})
/*
 * Route to delete a business.
 */

router.delete('/:businessid', async function (req, res, next) {
  const deleteSuccessful = await deleteBusinessById(req.params.businessid);
  if (deleteSuccessful) {
  res.status(204).end();
  } else {
    next();
  }
});

/*
  created functoins
****************************************************************/
async function insertNewBusiness(business){
  const db = getDbInstance()
  const collection = db.collection('businesses')

  business = extractValidFields(business,businessSchema)
  //console.log("test: ", business)
  const result = await collection.insertOne(business)
  return result.insertedId
}

async function getAllBusiness(){
  const db = getDbInstance()
  const collection = db.collection('businesses')

  const results = await collection.find({}).toArray()
  return results
}

async function getBusinessById(id){
  const db = getDbInstance()
  const collection = db.collection('businesses')

  const businesses = await collection.aggregate([
    { $match: { _id: new ObjectId(id) } },
    { $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "businessid",
        as: "photo"
      }
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "businessid",
        as: "review"
      },
    }
  ]).toArray()
  return businesses[0]
}


async function updateBusinessById(id, business) {
  const db = getDbInstance()
  const collection = db.collection('businesses')

  business = extractValidFields(business,businessSchema)
  const businessValues = {
    ownerid: business.ownerid,
    name: business.name,
    address: business.address,
    city: business.city,
    state: business.state,
    zip: business.zip,
    phone: business.phone,
    category: business.category,
    subcategory: business.subcategory,
    website: business.website,
    email: business.emain
  };


  const result = await collection.replaceOne(
    { _id: new ObjectId(id) },
    businessValues
  );
  return result.matchedCount > 0;


}



async function deleteBusinessById(id) {
  const db = getDbInstance()
  const collection = db.collection('businesses')

  const result = await collection.deleteOne(
    {"_id": new ObjectId(id) }
  )
  return result.deletedCount > 0
}