const {users} = require('../models')
const passwordHash = require('password-hash')
const express = require('express')
const router = express.Router()

router.get('/', (req, res, next)=>{
  if (req.user)
    res.send(req.user)
  else res.sendStatus(401)
})

router.post('/login', (req, res, next)=>{
  users.find({
    where: {
      username: req.body.username || ''
    }
  }).then((user)=>{
    if (user && passwordHash.verify(req.body.password, user.password)) {
      res.cookie('userId', user.id, {signed: true})
      delete user.dataValues.password
      res.send(user.dataValues)
    } else {
      res.sendStatus(401)
    }
  }).catch(e=>{console.log(e); res.sendStatus(500)})
})

router.post('/create', (req, res, next)=>{
  const {username, password, email} = req.body

  if (!username || !password || !email)
    return res.sendStatus(400)
  if (!username.trim().length
      || !password.trim().length
      || !email.trim().length)
    return res.sendStatus(400)

  users.find({
    where: {
      username: username
    }
  }).then((user)=>{
    if (user) {
      return res.sendStatus(409)
    } else {
      const hash = passwordHash.generate(password)
      users.create({
        username: username,
        password: hash,
        email: email
      }).then((user)=>{
        res.cookie('userId', user.id, {signed: true})
        delete user.dataValues.password
        res.send(user.dataValues)
      }).catch(e=>{console.log(e); res.sendStatus(500)})
    }
  }).catch(e=>{console.log(e); res.sendStatus(500)})
})

module.exports = router
