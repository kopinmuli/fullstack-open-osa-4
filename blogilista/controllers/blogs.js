const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', (request, response) => {
    Blog
      .find({})
      .then(blogs => {
        response.json(blogs)
      })
  })
  
  blogsRouter.post('/', async (request, response) => {
      const body = request.body;

      if (body.title === undefined) {
        return response.status(400).json({ error: "title missing" });
      } else if (body.url === undefined) {
        return response.status(400).json({ error: "url missing" });
      }

      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes | 0,
      })

      blog
        .save()
        .then((savedBlog) => {
          response.status(201).json(savedBlog);
    })
  })

  blogsRouter.delete('/:id', async (request, response) => {

    const id = request.params.id
      await Blog.findByIdAndRemove(id)
      response.status(204).end()
  })

  blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
  
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    }
  
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    if (updatedBlog) {
      response.json(updatedBlog);
    } else {
      return response.status(404).end();
    }
  })

  module.exports = blogsRouter