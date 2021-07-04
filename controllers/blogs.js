const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const blog = {
    ...request.body,
    likes: request.body.likes || 0,
  }
  const newBlog = new Blog(blog)
  try {
    const saveBlog = await newBlog.save()
    response.json(saveBlog)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const {
    id,
  } = request.params
  console.log(id)
  try {
    await Blog.findByIdAndRemove(id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
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
  try {
    await Blog.findByIdAndUpdate(id, updateBlog, {
      new: true,
    })
    response.json(updateBlog)
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter
