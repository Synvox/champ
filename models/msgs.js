'use strict'
module.exports = function(sequelize, DataTypes) {
  var msgs = sequelize.define('msgs', {
    type: DataTypes.STRING,
    data: DataTypes.JSON
  }, {
    classMethods: {
      associate: function({msgs, users}) {
        users.hasMany(msgs)
      }
    }
  })
  return msgs
}
