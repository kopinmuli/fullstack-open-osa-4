const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Test blog number 1',
    author: 'Tester 1',
    url: 'tester1',
    likes: 1
  },
  {
    title: 'Test blog number 2',
    author: 'Tester 2',
    url: 'tester2',
    likes: 2
  },
]
 
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}
  
const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
}  