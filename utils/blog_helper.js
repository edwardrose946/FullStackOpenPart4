const listOfBlogs = [
    {
        _id: "anything",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        likes: 12,
        __v: 0
    },
    {
        _id: "anything",
        title: "blog post 1",
        author: "Jim",
        likes: 15,
        __v: 0
    },
    {
        _id: "anything",
        title: "blog post 2",
        author: "Geoff",
        likes: 10,
        __v: 0
    },
    {
        _id: "anything",
        title: "blog post 3",
        author: "Jim",
        likes: 6,
        __v: 0
    }]


const totalLikes = (listOfBlogs) => {
    return listOfBlogs.length === 0 ? 0 : listOfBlogs.reduce((accumulator, current) => {
        return accumulator > current.likes ? accumulator : current.likes
    }, 0)
}

const favouriteBlog = (listOfBlogs) => {

    if (listOfBlogs.length === 0) {
        throw Error('Cannot find a favorite blog from an empty list')
    }
    const topBlog = listOfBlogs
        .reduce((accumulator, current) => {return accumulator.likes > current.likes ? accumulator : current})
    delete topBlog._id
    delete topBlog.__v
    return topBlog
}

const mostBlogs = (listOfBlogs) => {
    if (listOfBlogs.length === 0) {
        throw Error('Cannot find the author with the most blogposts of an empty list')
    }

    let mostProlificAuthor = {blogs: 0}
    const frequencyMap = {}

    for (const blog of listOfBlogs) {
        if (blog.author in frequencyMap) {
            frequencyMap[blog.author] = frequencyMap[blog.author] + 1
        } else {
            frequencyMap[blog.author] = 1
        }
    }

    for(const author in frequencyMap) {
        let noOfBlogs = frequencyMap[author];
        if (noOfBlogs > mostProlificAuthor.blogs) {
            mostProlificAuthor = {
                author: author,
                blogs: noOfBlogs
            }
        }
    }

    return mostProlificAuthor
}

const mostLikes = (listOfBlogs) => {
    if (listOfBlogs.length === 0) {
        throw new Error("Cannot find author with the most likes across all blogs on an empty list")
    }

    let mostLikedAuthor = {likes: 0}
    const frequencyMap = {}

    for (const blog of listOfBlogs) {
        if (blog.author in frequencyMap) {
            frequencyMap[blog.author] = frequencyMap[blog.author] + blog.likes
        } else {
            frequencyMap[blog.author] = blog.likes
        }
    }

    for(const author in frequencyMap) {
        let noOfLikes = frequencyMap[author];
        if (noOfLikes > mostLikedAuthor.likes) {
            mostLikedAuthor = {
                author: author,
                likes: noOfLikes
            }
        }
    }

    return mostLikedAuthor
}

module.exports = {
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes,
    listOfBlogs
}