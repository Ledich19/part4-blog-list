const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const blog = {
    ...request.body,
    likes: request.body.likes || 0,
  }
  const newBlog = new Blog(blog)
  const saveBlog = await newBlog.save()
  response.json(saveBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const {
    id,
  } = request.params
  console.log(id)
  await Blog.findByIdAndRemove(id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
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