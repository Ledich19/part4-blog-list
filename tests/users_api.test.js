const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const saltRounds = 10
  const passwordHash = await bcrypt.hash('190289', saltRounds)
  const newUser = new User({
    name: "Aleksandr",
    username: "Aleksandr",
    passwordHash,
  })
  await newUser.save()
})

test('user was created', async () => {
  const newUser = {
    name: "Arto Hellas",
    username: "hellas",
    password: "55555",
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const usersEnd = await api.get('/api/users')
  expect(usersEnd.body.length).toBe(2)
})

test('if user have not username or username < 3 returned error', async () => {
  const newUser = {
    name: "Matti Luukkai",
    username: "ml",
    password: "5555555",
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('if user have not password orpassword  < 3 returned error', async () => {
  const newUser = {
    name: "Matti Luukkai",
    username: "mluukkai",
    password: "55",
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})
