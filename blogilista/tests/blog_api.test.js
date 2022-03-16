const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')


beforeEach(async () => {
  await Blog.deleteMany({})
  
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})


describe('Initial tests', () => {
  let token = null

  beforeAll(async () => {
    const testUser = await new User({
      username: 'Timo Testaaja',
      passwordHash: await bcrypt.hash('timppa69', 10),
    }).save()

    const createUserToken = { username: 'Timo Testaaja', id: testUser.id }
    token = jwt.sign(createUserToken, process.env.SECRET)
    return token
  })
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs').set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`)
    expect(response.body).toHaveLength(2)
  })
    
  test('the id is set right', async () => {
    const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`)
    expect(response.body[0].id).toBeDefined()
  })
})

describe('Post tests', () => {
  let token = null

  beforeAll(async () => {
    const testUser = await new User({
      username: 'Timo Testaaja',
      passwordHash: await bcrypt.hash('timppa69', 10),
    }).save()

    const createUserToken = { username: 'Timo Testaaja', id: testUser.id }
    token = jwt.sign(createUserToken, process.env.SECRET)
    return token
  })

  test('post blogs working', async () => {
    const newBlog = {
      title: 'Test blog number 3',
      author: 'Tester 3',
      url: 'tester3',
      likes: 3
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`)
    expect(response.body).toHaveLength(3)
  })  

  test('verify if likes property is missing then it defaults to 0', async () => {
    const newBlog = {
      title: 'Test blog number 4',
      author: 'Tester 4',
      url: 'tester4',
    }
    const response = 
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
    expect(response.body.likes).toBeDefined()
    expect(response.body.likes).toBe(0)
  })

  test('no title and url properties', async () => {
    const newBlog = {
      author: 'No title or url',
      likes: 1,
    }
    
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog).expect(400)
  })
  test('if token is not provided blog is not added', async () => {

    const blog = {
      title: 'no token attached',
      author: 'unnamed',
      url: 'give me 401'
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', '')
      .send(blog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('delete blog', () => {
  let token = null
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const testUser = await new User({
      username: 'Timo Testaaja',
      passwordHash: await bcrypt.hash('timppa69', 10),
    }).save()

    const createUserToken = { username: 'Timo Testaaja', id: testUser.id }
    token = jwt.sign(createUserToken, process.env.SECRET)
        

    const newBlog = {
      title: 'Test delete blog ',
      author: 'Test deleting',
      url: 'delete'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)

    return token
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(0)

  })
})

describe('update blog', () => {
  let token = null
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const testUser = await new User({
      username: 'Timo Testaaja',
      passwordHash: await bcrypt.hash('timppa69', 10),
    }).save()

    const createUserToken = { username: 'Timo Testaaja', id: testUser.id }
    token = jwt.sign(createUserToken, process.env.SECRET)
        

    const newBlog = {
      title: 'Test update blog',
      author: 'Test updating',
      url: 'update'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)

    return token
  })

  test('blog can be updated', async () => {
      
    const newBlog = {
      title: 'Test update blogOK',
      author: 'Test updatingOK',
      url: 'updateOK'
    }
  
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
  
    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
  
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd[0]
      
    expect(updatedBlog.title).toBe('Test update blogOK')
    expect(updatedBlog.author).toBe('Test updatingOK')
    expect(updatedBlog.url).toBe('updateOK')
  })
})

afterAll(() => {
  mongoose.connection.close()
})