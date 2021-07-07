const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
    id: 1,
  })
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
  const newUser = new User({
    name: body.name,
    username: body.username,
    passwordHash,
  })
  const saveUser = await newUser.save()
  return response.json(saveUser)
})

module.exports = usersRouter
