const favouriteBlog = require('../utils/blog_helper').favouriteBlog

describe('favourite blog', () => {
    test('empty list of blogs returns error', () => {
        const emptyListOfBlogs = []
        expect(() => favouriteBlog(emptyListOfBlogs)).toThrow(Error)
    })

    test('list with one blog returns that blog without identifying fields', () => {
        const listOfOneBlog = [{
            _id: "anything",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12,
            __v: 0
        }]

        const result = favouriteBlog(listOfOneBlog)
        expect(result).toEqual({
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12,
        })
    })

    test('list with multiple blogs returns the correct blog without the identifying fields', () => {
        const biggerList = [
            {
                likes: 5
            },
            {
                likes: 10
            },
            {
                likes: 0
            },
            {
                likes: 20
            }]
        const result = favouriteBlog(biggerList)
        expect(result).toEqual({likes: 20})
    })
})