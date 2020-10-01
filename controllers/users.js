const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res) => {
    const body = req.body

    const validUsernameAndPasswordLength = body.password.length > 2 && body.username.length > 2
    if (! validUsernameAndPasswordLength) {
        return res.status(401).json({error: 'password or username too short'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()

    res.json(savedUser)
})

usersRouter.get('/', async (req, res) => {
    //an individual note object has a reference called 'Note'
    const users = await User.find({}).populate('blogs', {likes: 1, title: 1, author: 1, url: 1})
    res.json(users)
})

module.exports = usersRouter