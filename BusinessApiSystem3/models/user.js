const { DataTypes } = require('sequelize')
const sequelize = require('../lib/sequelize')
const bcrypt = require('bcryptjs')

const { Business } = require('./business')
const { Photo } = require('./photo')
const { Review } = require('./review')


const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: {
      type: DataTypes.STRING,
      set(value){
        //https://www.npmjs.com/package/bcrypt
        //async (recommended) is recoomended
        this.setDataValue('password', bcrypt.hashSync(value, 8))
      },
      allowNull: false
    },
    admin: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false }
})

/*
* Set up one-to-many relationship between User and Business.
*/
//User.hasMany(Business, { foreignKey: { allowNull: false } })
//Business.belongsTo(User)


/*
* Set up one-to-many relationship between User and Photo.
*/
//User.hasMany(Photo, { foreignKey: { allowNull: false } })
//Photo.belongsTo(User)
//
///*
//* Set up one-to-many relationship between User and Review.
//*/
//User.hasMany(Review, { foreignKey: { allowNull: false } })
//Review.belongsTo(User)




exports.User = User

exports.UserClientFields = [
  'name',
  'email',
  'password',
  'admin'
]

