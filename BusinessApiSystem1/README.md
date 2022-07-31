# Instruction

The goals are to practice designing a RESTful API from an application description, to begin implementing endpoints for the API you designed, and to containerize your API using Docker.

## 1. Design a RESTful API for a Yelp-like application

Your first task for this assignment is to design a RESTful API (i.e. API endpoints with corresponding request and response bodies) for a Yelp-like application.  This application will specifically be centered around businesses and user reviews of businesses in US cities.  The API you design should permit the following functionality:

### Businesses

  * Users who own businesses should be able to add their businesses to the application.  When a business owner adds their business they will need to include the following information:
    * Business name
    * Business street address
    * Business city
    * Business state
    * Business ZIP code
    * Business phone number
    * Business category and subcategories (e.g. category "Restaurant" and subcategory "Pizza")

    The following information may also optionally be included when a new business is added:
      * Business website
      * Business email

  * Business owners may modify any of the information listed above for an already-existing business they own.

  * Business owners may remove a business listing from the application.

  * Users may get a list of businesses.  The representations of businesses in the returned list should include all of the information described above.  In a later assignment, we will implement functionality to allow the user to list only a subset of the businesses based on some filtering criteria, but for now, assume that users will only want to fetch a list of all businesses.

  * Users may fetch detailed information about a business.  Detailed business information will include all of the information described above as well as reviews of the business and photos of the business (which we discuss below).

### Reviews

  * Users may write a review of an existing business.  A review will include the following information:
    * A "star" rating between 0 and 5 (e.g. 4 stars)
    * An "dollar sign" rating between 1 and 4, indicating how expensive the business is (e.g. 2 dollar signs)
    * An optional written review

    Note that a user may write at most one review of any business.

  * Users may modify or delete any review they've written.

### Photos

  * Users may upload image files containing photos of an existing business.  Each photo may have an associated caption.

  * Users may remove any photo they've uploaded, and they may modify the caption of any photo they've uploaded.

  * Users may list all of the businesses they own.

  * Users may list all of the reviews they've written.

  * Users may list all of the photos they've uploaded.

Your design should follow the best practices we're discussing in lecture, such as URL naming, etc.  As you're designing your API, make sure to think about which API responses should be paginated, which API responses should include links to other API resources (i.e. how your API will implement HATEOAS), and what API endpoints will need some form of authentication.  Some of this will come into play in the server implementation you'll write below, while some of it (e.g. authentication) won't come into play until later assignments.

**Importantly, make sure to read below for important details about how you'll implement this API.**

## 2. Implement a server for your API

After you've designed your API, implement a server for it using Node.js and Express.  Your server should meet the following requirements:

  * Your server API should implement a route for each of the API endpoints in the design you created above.

  * Any API endpoint with a parameterized route should perform basic verification of the specified route parameters.  For example, if you have a route with a parameter representing the ID of a specific business, you should verify that the ID is valid.

  * Any API endpoint that takes a request body should perform basic verification of the data provided in the request body.  You example, if one of your endpoints requires a request body that contains a business name and a business address, you should verify that those two fields are present in the request body.

  * Each API endpoint should respond with an appropriate HTTP status code and, when needed, a response body.

  * API endpoints should have paginated responses where appropriate.

  * Your server should run on the TCP port specified by the `PORT` environment variable.

  * You should be able to launch your server using the command `npm start`.

  * **Importantly, DO NOT worry about actually storing API data in your server.**  When a client makes a request to your API that includes a request body (e.g. a business), you may simply validate the body without storing it.  When a client makes a request to your API that would generate a response body, you can simply send back (hard-coded) dummy data with the appropriate format.

  * **DO NOT worry about users, only businesses, reviews, and photos.**  There's no need in this assignment to verify ownership of any business/photo/review.

  For now, it doesn't matter too much how you represent photo entities, as long as your representation makes sense.  For example, you could let photos be represented as a URL and caption.

**Remember, the main purpose of this assignment is to practice your API design skills, not to store API data.**  We'll worry about storing data in future assignments.  Don't complicate things for yourself in this assignment by trying to come up with a sophisticated data storage framework.

## 3. Write some basic tests for your server

Once your API server is implemented (or, preferably, as you're implementing your server), your next task is to implement some basic tests for your server.  The test should demonstrate the functionality of all of the endpoints you implemented above.  You may use any tool you like to write these tests (e.g. [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/), [curl](https://curl.haxx.se/), etc.).

## 4. Containerize your server using Docker

Your last task for this assignment is to write a Dockerfile that packages the API server you wrote into a Docker image along with all of the server's runtime dependencies. Containers launched from this image should automatically start the server listening on a specified port, and you should be able to successfully make requests to the containerized server from the outside world (e.g. from your host machine).