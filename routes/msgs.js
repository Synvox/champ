const {users, msgs} = require('../models')
const express = require('express')
const router = express()

const clients = new Set()

router.get('/', (req, res, next)=>{
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.writeHead(200)
  const lastEvent = req.get('Last-Event-ID') || 0

  clients.add(res)

  msgs.findAll({
    where: {
      id: {
        $gt: lastEvent
      },
      createdAt: {
        $gt: new Date()
      }
    }
  }).then((foundMsgs)=>{
    const batch = foundMsgs.map((msg)=>{
      return [
        'event: create',
        `id: ${msg.id}`,
        `data: ${JSON.stringify(msg)}`
      ].join('\n')

    }).join('\n\n') + '\n\n'

    res.write(batch)
  })

  req.on('close', function() {
    clients.delete(res)
  })
})

msgs.addHook('afterCreate','stream',(msg)=>{
  clients.forEach((res)=>{
    const lines = [
      'event: create',
      `id: ${msg.id}`,
      `data: ${JSON.stringify(msg)}`
    ].join('\n') + '\n\n'

    res.write(lines)
  })
})

router.post('/',(req, res, next)=>{
  if (!req.user) return res.sendStatus(401)

  const {type, data} = req.body
  const msg = {
    type: type || 'text',
    data: data || {},
    userId: req.user.id
  }

  msgs.create(msg)

  res.sendStatus(200)
})


module.exports = router
