const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.post('/', async (request, response) => {
    
    const { username, name, password } = request.body

    const existingUser = await User.findOne({ username })
  
    if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
    }
    if (username === undefined || password === undefined) {
        return response.status(400).json({ error: 'username or password undefined' })
    }
    if (username.length < 3) {
        return response.status(400).json({ error: 'username too short' })
    }
    if (password.length < 3) {
        return response.status(400).json({ error: 'password too short' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
  
    const user = new User({
        username,
        name,
        passwordHash,
    })
  
    const savedUser = await user.save()
  
    response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs')
    response.json(users)
  })

module.exports = usersRouter