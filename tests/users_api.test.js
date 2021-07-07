const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const users = helper.userInitial
  const user = users[0]
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(user.password, saltRounds)
  const newUser = new User({
    ...user,
    passwordHash,
  })
  await newUser.save()
})

test('user was created', async () => {
  const newUser = {
    name: 'Arto Hellas',
    username: 'hellas',
    password: '55555',
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const usersEnd = await helper.usersInDb()
  expect(usersEnd.length).toBe(helper.userInitial.length + 1)
})

test('if user have not username or username < 3 returned error', async () => {
  const newUser = {
    name: 'Matti Luukkai',
    username: 'ml',
    password: '5555555',
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  const usersEnd = await helper.usersInDb()
  expect(usersEnd.length).toBe(helper.userInitial.length)
})

test('if user have not password orpassword  < 3 returned error', async () => {
  const newUser = {
    name: 'Matti Luukkai',
    username: 'mluukkai',
    password: '55',
  }
  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})
