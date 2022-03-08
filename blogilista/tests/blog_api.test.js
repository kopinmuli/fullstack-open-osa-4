const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require("./test_helper");
const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('Initial tests', () => {
    test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(2)
    })
    
    test('the id is set right', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined();
    })
})

describe('Post tests', () => {
    test('post blogs working', async () => {
        const newBlog = {
            title: 'Test blog number 3',
            author: 'Tester 3',
            url: 'tester3',
            likes: 3
        }
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(3)
    });  

    test('verify if likes property is missing then it defaults to 0', async () => {
        const newBlog = {
            title: 'Test blog number 4',
            author: 'Tester 4',
            url: 'tester4',
        }
    const response = await api.post('/api/blogs').send(newBlog).expect(201)
    expect(response.body.likes).toBeDefined()
    expect(response.body.likes).toBe(0)
    })

    test("no title and url properties", async () => {
        const newBlog = {
        author: "No title or url",
        likes: 1,
        };
    
        await api.post("/api/blogs").send(newBlog).expect(400);
    });
})

describe('delete blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    })
})

describe("update blog", () => {
    test("blog can be updated", async () => {
      
    const newBlog = {
        title: 'Test blog number 5',
        author: 'Tester 5',
        url: 'tester5',
        likes: 5,
      };
  
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];
  
      await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog)
      .expect(200);
  
      const blogsAtEnd = await helper.blogsInDb();
      const updatedBlog = blogsAtEnd[0];
      
      expect(updatedBlog.title).toBe('Test blog number 5');
      expect(updatedBlog.author).toBe("Tester 5");
      expect(updatedBlog.url).toBe('tester5');
      expect(updatedBlog.likes).toBe(5); 
    })
  })
  
afterAll(() => {
  mongoose.connection.close()
})