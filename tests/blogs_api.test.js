const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const blogsInitial = [{
  _id: '5a422a851b54a676234d17f7',
  title: 'React patterns',
  author: 'Michael Chan',
  url: 'https://reactpatterns.com/',
  likes: 7,
  __v: 0,
},
{
  _id: '5a422aa71b54a676234d17f8',
  title: 'Go To Statement Considered Harmful',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  likes: 5,
  __v: 0,
},
{
  _id: '5a422b3a1b54a676234d17f9',
  title: 'Canonical string reduction',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
  likes: 12,
  __v: 0,
},
{
  _id: '5a422b891b54a676234d17fa',
  title: 'First class tests',
  author: 'Robert C. Martin',
  url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
  likes: 10,
  __v: 0,
},
{
  _id: '5a422ba71b54a676234d17fb',
  title: 'TDD harms architecture',
  author: 'Robert C. Martin',
  url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
  likes: 0,
  __v: 0,
},
{
  _id: '5a422bc61b54a676234d17fc',
  title: 'Type wars',
  author: 'Robert C. Martin',
  url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
  likes: 2,
  __v: 0,
},
]

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogsObjects = blogsInitial.map((blog) => {
    delete blog._id
    delete blog.__v
    return new Blog(blog)
  })
  const promiseBlogs = blogsObjects.map((blog) => blog.save())
  await Promise.all(promiseBlogs)
})

test('blogs are returned as json ', async () => {
  await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(blogsInitial.length)
})

test('unique identifiers are named id', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach((element) => {
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
  await api.post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(blogsInitial.length + 1)
  const blogs = response.body.map((blog) => blog.title)
  expect(blogs).toContain('Test blog')
})

test('if likes is missing, likes will be 0', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Aleksandr',
    url: 'https://github.com/Ledich19',
  }
  const postBlog = await api.post('/api/blogs').send(newBlog)
  console.log(postBlog.body)
  expect(postBlog.body.likes).toBeDefined()
  expect(postBlog.body.likes).toBe(0)
})

test('if have not title and url returned 400', async () => {
  let newBlog = {
    title: '',
    author: 'Aleksandr',
    url: 'https://github.com/Ledich19',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  newBlog = {
    title: 'Test blog',
    author: 'Aleksandr',
    url: '',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

describe('delete blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const {
      body,
    } = await api.get('/api/blogs')
    const deletBlog = body[0]
    await api.delete(`/api/blogs/${deletBlog.id}`).expect(204)
    const blogsEnd = await api.get('/api/blogs')
    expect(blogsEnd.body.length).toBe(body.length - 1)
    const blogsUrl = blogsEnd.body.map((n) => n.url)
    expect(blogsUrl).not.toContain(deletBlog.url)
  })
})

describe('update blog', () => {
  test('blog did updated', async () => {
    const {
      body,
    } = await api.get('/api/blogs')
    const updateBlog = body[0]
    console.log(body.likes, typeof (body.likes))
    const newLikes = {
      likes: updateBlog.likes + 1,
    }
    await api
      .put(`/api/blogs/${updateBlog.id}`)
      .send(newLikes)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const blogsEnd = await api.get('/api/blogs')
    expect(blogsEnd.body[0].likes).toBe(updateBlog.likes + 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
