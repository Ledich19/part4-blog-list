const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)
beforeAll(async () => {
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
beforeEach(async () => {
  const user = await User.findOne({
    name: 'Aleksandr',
    username: 'Aleksandr',
  })

  await Blog.deleteMany({})
  const blogsObjects = helper.blogsInitial.map((blog) => {
    const newBlog = {
      ...blog,
      user: user._id
    }
    return new Blog(newBlog)
  })
  await Blog.insertMany(blogsObjects)

  user.blogs = helper.blogsInitial.map((blog) => blog._id)
  await user.save()
})

test('blogs are returned as json ', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api
    .get('/api/blogs')
  expect(response.body)
    .toHaveLength(helper.blogsInitial.length)
})

test('unique identifiers are named id', async () => {
  const response = await api
    .get('/api/blogs')
  response.body
    .forEach((element) => {
      expect(element.id).toBeDefined()
    })
})

test('blog can be added', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Aleksandr',
    url: 'https://github.com/Ledich19',
    likes: 1000000,
  }
  const token = await helper.getToken()
  await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const blogsInDb = await helper.blogsInDb()
  expect(blogsInDb).toHaveLength(helper.blogsInitial.length + 1)
  const blogs = blogsInDb.map((blog) => blog.title)
  expect(blogs).toContain('Test blog')
})

test('if likes is missing, likes will be 0', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Aleksandr',
    url: 'https://github.com/Ledich19',
  }
  const token = await helper.getToken()
  const postBlog = await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
  expect(postBlog.body.likes).toBeDefined()
  expect(postBlog.body.likes).toBe(0)
})

test('if have not title or url returned 400', async () => {
  const token = await helper.getToken()

  let newBlog = {
    title: '',
    author: 'Aleksandr',
    url: 'https://github.com/Ledich19',
  }
  await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
    .expect(400)

  newBlog = {
    title: 'Test blog',
    author: 'Aleksandr',
    url: '',
  }
  await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
    .expect(400)
})

test('if blog heve not token status 401', async () => {
  const newBlog = {
    title: '',
    author: 'Aleksandr',
    url: 'https://github.com/Ledich19',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

test('delete blog succeeds with status code 204 if id is valid', async () => {
  const token = await helper.getToken()
  const blogs = await Blog.find({})
  const deletBlog = blogs[0]
  await api
    .delete(`/api/blogs/${deletBlog.id}`)
    .set('Authorization', token)
    .expect(204)

  const blogsInDb = await helper.blogsInDb()
  expect(blogsInDb.length).toBe(blogs.length - 1)

  const blogsUrl = blogsInDb.map((n) => n.url)
  expect(blogsUrl).not.toContain(deletBlog.url)
})

test('blog did updated', async () => {
  const token = await helper.getToken()
  const blogs = await Blog.find({})
  const updateBlog = blogs[0]
  const newLikes = {
    likes: updateBlog.likes + 1,
  }
  await api
    .put(`/api/blogs/${updateBlog.id}`)
    .set('Authorization', token)
    .send(newLikes)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsInDb = await helper.blogsInDb()
  expect(blogsInDb[0].likes).toBe(updateBlog.likes + 1)
})

afterAll(() => {
  mongoose.connection.close()
})
