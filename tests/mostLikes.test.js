const mostLikes = require('../utils/blog_helper').mostLikes
const listOfBlogs = require('../utils/blog_helper').listOfBlogs

describe('most likes', () => {
    test('will throw an error on an empty list', () => {
        const emptyList = []
        expect(() => mostLikes(emptyList)).toThrow(Error)
    })

    test('will find the correct number of likes for a list of many blogs', () => {
        const result = mostLikes(listOfBlogs)
        expect(result).toEqual({author: "Jim", likes: 21})

    })
})