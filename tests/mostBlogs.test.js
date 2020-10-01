const mostBlogs = require('../utils/blog_helper').mostBlogs
const listOfBlogs = require('../utils/blog_helper').listOfBlogs

describe('most blogs', () => {
    test('when list of blogs is empty return an error', () => {
        const emptyList = []
        expect(() => mostBlogs(emptyList)).toThrow(Error)
    })

    test('when list of blogs has multiple authors, return the author with the most blogs', () => {

        const result = mostBlogs(listOfBlogs)
        expect(result)
            .toEqual({ author: "Jim", blogs: 2})
    })
})

