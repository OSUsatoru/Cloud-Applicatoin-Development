# Instruction

The goal is to incorporate authorization and authentication into our businesses API.  There are a few parts to this assignment, as described below.

## 1. Implement an API endpoint for creating new users

First task is to implement an API endpoint to enable the creation and storage of application users.  Specifically, you should create a `POST /users` API endpoint through which new users can register.  When a user registers, they should provide their name, email address, and password, and you should salt and hash the password on the server before storing it.

You'll need to create a Sequelize `User` model to represent users.  If you work with another version of the code, you'll have to model users in an appropriate way.  However you do it, you should store the following information for each user:
  * `id` - The primary key for the user (if you're using MongoDB, it's fine to stick with the default primary key name `_id`)
  * `name` - User's full name
  * `email` - User's email address (which must be unique among all users)
  * `password` - User's hashed/salted password
  * `admin` - A boolean flag indicating whether the user has administrative permissions (`false` by default)

Importantly, you'll need to make sure you hash and salt users passwords before storing them in your database.  If you stick with the Sequelize implementation from the starter code, the easiest way to do this is to use a [Sequelize setter](https://sequelize.org/docs/v6/core-concepts/getters-setters-virtuals/#setters) for your password field.

Also, note that the starter code contains some user data in `data/users.json`, which you can use to populate some initial users into your database.  If you're using the starter code's Sequelize implementation and populate your database using `initDb.js`, you can add additional code there to populate the users table in a manner similar to the way business, review, and photo data is populated using `bulkCreate()`.  If you do this, the values of the `ownerId` field in the initial business data should map to the correct users from the initial user data.

Finally, note that you may have to manually connect to the database (e.g. using the MySQL terminal monitor) to insert at least one user with administrative permissions (i.e. for whom the `admin` flag is `true`).  If you do this, you can use the following pre-salted/hashed version of the password "hunter2":
```
$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike
```

## 2. Enable JWT-based user logins and implement a user data access endpoint

Once you have enabled user registration for your application, implement a new `POST /users/login` API endpoint that allows a registered user to log in by sending their email address and password.  If the email/password combination is valid, you should respond with a JWT token, which the user can then send with future requests to authenticate themselves.  The JWT token payload should contain the user's ID (with which you should be able to fetch details about the user from the database) and any other information needed to implement the features described in this, and it should expire after 24 hours.

If a user attempts to log in with an invalid username or password, you should respond with a 401 error.

In addition, you should create a `GET /users/{userId}` API endpoint that returns information about the specified user (excluding their password).

## 3. Require authorization to perform certain API actions

Once users can log in, modify your API to implement the following authorization scheme:
  * Only an authorized user can see their own user data and their own lists of businesses, reviews, and photos.  In other words, the following API endpoints should verify that the `userId` specified in the URL path matches the ID of the logged-in user (as indicated by a valid JWT provided by the client):
    * `GET /users/{userId}`
    * `GET /users/{userId}/businesses`
    * `GET /users/{userId}/photos`
    * `GET /users/{userId}/reviews`

  * Only an authorized user can create new businesses, reviews, and photos.  In other words, the following API endpoints must ensure that a user is logged in and that the user ID specified in the POST request body matches the ID of the logged-in user:
    * `POST /businesses`
    * `POST /photos`
    * `POST /reviews`

  * Only an authorized user can modify or delete their own businesses, reviews, and photos.  In other words, the following API endpoints must ensure that a user is logged in and that the user ID for the entity being modified/deleted matches the ID of the logged-in user:
    * `PUT /businesses`, `DELETE /businesses`
    * `PUT /photos`, `DELETE /photos`
    * `PUT /reviews`, `DELETE /reviews`

  * A user with `admin` permissions may perform any action, including creating content or fetching/modifying/deleting the content of any user.

  * Only a user with `admin` permissions may create other `admin` users, i.e. the creation of `admin` users must be accompanied by a valid JWT for a logged-in `admin` user.

All authorized endpoints should respond with an error if the logged-in user is not authorized or if no user is logged in (i.e. no JWT is provided).

