const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const tokenExtractor = require('../utils/middleware').tokenExtractor

// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
//         return authorization.substring(7)
//     }
//     return null
// }

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({error: 'token missing or invalid id'})
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()

    response.status(201).json(result)

})

blogsRouter.delete('/:id', async (req, res) => {

    const blog = await Blog.findById(req.params.id)
    const blogAuthorId = blog.user.toString()
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if(decodedToken.id !== blogAuthorId) {
        res.status(400).json({error: 'Bad Id'})
    }
    await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

blogsRouter.get(`/:id`, async (req, res, next) => {
    const blog = await Blog.findById(req.params.id).populate('user', {username: 1, name: 1})
    if (blog) {
        res.status(200).json(blog)
    } else {
        res.status(404).end()
    }
})

blogsRouter.put('/:id', async (req, res, ) => {

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body)

    if (updatedBlog) {
        res.status(204).end()
    } else {
        res.status(405).send({error: 'Cannot update an id that does not exist'})
    }
})

module.exports = blogsRouter