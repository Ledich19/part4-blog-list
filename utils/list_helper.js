const _ = require('lodash')

const dummy = () => 1

const totalLikes = (list) => {
  const likes = list.reduce((accum, blog) => accum + blog.likes, 0)
  return likes
}

const favouriteBlog = (blogs) => {
  let blogIndex = 0
  blogs.forEach((element, i) => {
    if (element.likes > blogs[blogIndex].likes) {
      blogIndex = i
    }
  })
  const blog = {
    title: blogs[blogIndex].title,
    author: blogs[blogIndex].author,
    likes: blogs[blogIndex].likes,
  }
  return blog
}

const mostBlogs = (blog) => {
  const countBlogs = _.countBy(blog, 'author')
  const transform = _.map(countBlogs, (elem, key) => ({
    author: key,
    blogs: elem,
  }))
  return _.maxBy(transform, 'blogs')
}

const mostLikes = (blogs) => {
  const autors = _.groupBy(blogs, 'author')
  const likesSum = _.map(autors, (elem, key) => ({
    author: key,
    likes: _.sumBy(elem, 'likes'),
  }))
  return _.maxBy(likesSum, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes,
}
