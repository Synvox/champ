'use strict'
module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define('users', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function() {
      }
    }
  })
  return users
}
