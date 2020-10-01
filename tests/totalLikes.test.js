const totalLikes = require('../utils/blog_helper').totalLikes

describe('totalLikes', () => {
    test('of empty list is zero', () => {
        const emptyList = []

        const result = totalLikes(emptyList)
        expect(result).toBe(0)
    })

    test('when list has only one blog equals the likes of that blog', () => {
        const listWithABlog = [{
            _id: '1234jkh32489741jhg',
            title: "Go to statements considered harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        }]

        const result = totalLikes(listWithABlog)
        expect(result).toBe(5)
    })

    test('of a bigger list is calculated right', () => {
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

        const result = totalLikes(biggerList)
        expect(result).toBe(20)
    })
});