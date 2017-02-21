const {users} = require('../models')
const passwordHash = require('password-hash')
const express = require('express')
const Crypto = require('crypto')
const router = express.Router()

router.get('/', (req, res, next)=>{
  if (req.user)
    res.send({
      username: req.user.username,
      email: req.user.email
    })
  else res.sendStatus(401)
})

router.post('/login', (req, res, next)=>{
  users.find({
    where: {
      username: req.body.username || ''
    }
  }).then((user)=>{
    if (user && passwordHash.verify(req.body.password + user.salt, user.password)) {
      res.cookie('userId', user.id, {signed: true})
      delete user.dataValues.salt
      delete user.dataValues.password
      res.send(user.dataValues)
    } else {
      res.sendStatus(401)
    }
  }).catch(next)
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
      const salt = Crypto.randomBytes(32).toString()
      const hash = passwordHash.generate(password + salt)
      users.create({
        username: username,
        password: hash,
        email: email,
        salt: salt
      }).then((user)=>{
        res.cookie('userId', user.id, {signed: true})
        delete user.dataValues.password
        delete user.dataValues.salt
        res.send(user.dataValues)
      }).catch(next)
    }
  }).catch(next)
})

module.exports = router
