const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')


//superagent object
const api = supertest(app)

const initialBlogs = [
    {
        title: "blog3",
        author: "Geoff",
        likes: 3
    },
    {
        title: "blog1",
        author: "Jim",
        likes: 1
    },
    {
        title: "blog2",
        author: "Jessica",
        likes: 2
    }
]

async function clearTestDatabase() {
    await Blog.deleteMany({})
    await User.deleteMany({})
}

async function initialiseTestDatabaseUsers() {
    for (let blog of initialBlogs) {
        let userObject = {username: blog.author, name: blog.author, password: blog.author}
        await api
            .post('/api/users')
            .send(userObject)
    }
}

async function loginAndPostFirstBlog(blog) {
    let loginObject = {username: blog.author, password: blog.author}
    //login (need the token for later)
    const validLoginObject = await api
        .post('/api/login')
        .send(loginObject)

    //need the user's ID for the current author
    const users = await api
        .get('/api/users')
    const [user] = users.body.filter(u => u.username === blog.author)

    //create the first blog post with author's ID and post using the login token
    const blogPost = {
        title: "first blog",
        author: blog.author,
        url: "NA",
        likes: 1,
        userId: user.id
    }
    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${validLoginObject.body.token}`)
        .send(blogPost)
}

beforeEach(async () => {
    await clearTestDatabase();
    //definitely want database users initialised before attempting to log in
    await initialiseTestDatabaseUsers();
    //now log in and post
    for (let blog of initialBlogs) {
        await loginAndPostFirstBlog(blog);
    }
})

describe('blogs api', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there are three blogs', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(initialBlogs.length)
    })

    test('the authors of all the blogs are Geoff, Jim and Jessica', async () => {
        const response = await api.get('/api/blogs')
        const authors = response.body.map(blog => blog.author)

        expect(authors).toStrictEqual(["Geoff", "Jim", "Jessica"])
    })

    test('a valid blog can be added after refactoring the controllers module using async and await keywords', async () => {
        let loginObject = {username: "Geoff" ,password: "Geoff"}
        const validLoginObject = await api
            .post('/api/login')
            .send(loginObject)

        const newBlog = {
            title: "Blog added after refactoring",
            author: "Geoff",
            likes : 4
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${validLoginObject.body.token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-type', /application\/json/)

        const response = await api.get('/api/blogs')
        const authors = response.body.map(blog => blog.author)

        expect(response.body).toHaveLength(initialBlogs.length + 1)
        expect(authors).toContain("Geoff")
    })

    test('empty blog is not added and throws 400 Bad Request', async () => {
        let loginObject = {username: "Geoff" ,password: "Geoff"}
        const validLoginObject = await api
            .post('/api/login')
            .send(loginObject)

        const newBlog = {}
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${validLoginObject.body.token}`)
            .send(newBlog)
            .expect(400)
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(initialBlogs.length)
    })

    test('a specific blog can be viewed', async () => {
        const notesAtStart = await api.get('/api/blogs')
        const noteToView = notesAtStart.body[0]

        const resultNote = await api
            .get(`/api/blogs/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
        expect(resultNote.body).toEqual(processedNoteToView)
    })

    test('Geoff can delete his blog and returns 204 No Content', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]

        let loginObject = {username: "Geoff" ,password: "Geoff"}
        const validLoginObject = await api
            .post('/api/login')
            .send(loginObject)
            .expect(200)

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${validLoginObject.body.token}`)
            .expect(204)

        const blogsAtEndResponse = await api.get('/api/blogs')
        const blogsAtEnd = blogsAtEndResponse.body

        expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)
        expect(blogsAtEnd).not.toContain(blogToDelete)
    })

    test('Jessica cannot delete Geoff\'s blog due to Bad Id', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const geoffsBlog = blogsAtStart.body[0]

        let loginObject = {username: "Jessica", password: "Jessica"}

        const jessicaValidLogin = await api
            .post('/api/login')
            .send(loginObject)
            .expect(200)

        await api
            .delete(`/api/blogs/${geoffsBlog.id}`)
            .set('Authorization', `Bearer ${jessicaValidLogin.body.token}`)
            .expect(400)
            .expect({error: 'Bad Id'})
    })

    test('unique property of the blog, called id, is defined', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToCheck = blogsAtStart.body[0]

        expect(blogToCheck.id).toBeDefined()
    })

    test('blogs are defaulted to zero likes if not explicitly defined', async () => {
        const blog = new Blog({
            author: "Edward Rose",
            title: "Likes are defaulted to zero"
        })

        await blog.save()
        const blogs = await api.get('/api/blogs')
        //ES6 destructuring to get first element of the array
        const [likesAreDefaultedToZero] = blogs.body.filter(blog => blog.title === "Likes are defaulted to zero")

        expect(likesAreDefaultedToZero.likes).toEqual(0)
    })
})

describe('blogs api updates', () => {


    test('updates on a blog that exists updates as required', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToUpdate = blogsAtStart.body[0]

        const blog = {
            author: "Geoff",
            title: "Blog3",
            likes: 10
        }
        await api.put(`/api/blogs/${blogToUpdate.id}`).send(blog).expect(204)
        let blogsAtEnd = await api.get('/api/blogs')
        let [updatedBlog] = blogsAtEnd.body.filter(blog => blog.author === "Geoff")
        expect(updatedBlog.title).toEqual("Blog3")
        expect(updatedBlog.likes).toEqual(10)


    })

    test('updates on a blog that doesn\'t exist returns an appropriate error message', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blog = {
            author: "Doesn't matter",
            title: "NA",
            likes: 1
        }
        await api.put(`/api/blogs/${blogToDelete.id}`).send(blog).expect(405)
        const blogsAtEnd = await api.get('/api/blogs')
        expect(blogsAtStart.length).toEqual(blogsAtEnd.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
})