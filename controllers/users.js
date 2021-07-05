const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const {
    body,
  } = request

  if (body.password.length < 3) {
    return response.status(400).json({
      error: 'Too short password',
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  console.log(`\u001B[33m${passwordHash}\u001B[0m`)
  const newUser = new User({
    name: body.name,
    username: body.username,
    passwordHash,
  })
  const saveUser = await newUser.save()
  response.json(saveUser)
})

module.exports = usersRouter
