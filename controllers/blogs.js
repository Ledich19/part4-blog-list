const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middlewere')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const {
    body,
  } = request
  const users = request.user
  const blog = {
    ...body,
    likes: body.likes || 0,
    user: users._id,
  }
  const newBlog = new Blog(blog)
  const saveBlog = await newBlog.save()
  users.blogs = users.blogs.concat(saveBlog._id)
  await users.save()
  response.json(saveBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const { user } = request
  console.log(user)
  const {
    id,
  } = request.params
  const blog = await Blog.findById(id)
  console.log(blog)

  const blogUserId = blog.user.toString()
  const userId = user.id.toString()
  if (blogUserId !== userId) {
    return response.status(400).json({ error: 'it is impossible to delete the wrong user' })
  }
  await Blog.findByIdAndRemove(id)
  user.blogs = user.blogs.filter((b) => b.toString() === id)
  await user.save()
  return response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const {
    id,
  } = request.params
  const {
    body,
  } = request
  const updateBlog = {
    likes: body.likes,
  }
  await Blog.findByIdAndUpdate(id, updateBlog, {
    new: true,
  })
  response.json(updateBlog)
})

module.exports = blogsRouter
