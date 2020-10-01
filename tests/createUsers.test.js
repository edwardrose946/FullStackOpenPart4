const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const mongoose = require('mongoose')

const supertest = require('supertest')
const app = require('../app')

//superagent object
const api = supertest(app)

describe('when there is initially one use in the data base', () => {
  beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash})

      await user.save()
  })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: "Edward1234",
            name: "Edward",
            password: "CHicken DipPers"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'superuser',
            password: 'doesnt matter'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username and password are too short', async () => {

        const newUser = {
            username: "ji",
            name:"ji",
            password:"ji"
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password or username too short')
    })

    test('creation fails with proper statuscode and message if username type is incorrect', async () => {

        const newUser = {
            username: [1,2,3,4],
            name: 100,
            password: "CHicken DipeperPers"
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('User validation failed')
    })

})

afterAll(() => {
    mongoose.connection.close()
})