const {users} = require('../models')

module.exports = function(req, res, next){
  const userId = req.signedCookies['userId']
  if (userId) {
    users.findById(userId).then((user)=>{
      delete user.password
      req.user = user.dataValues
      next()
    }).catch(next)
  } else {
    next()
  }
}
