const Blog = require('../models/blog');
const User = require('../models/user');

const jwt = require('jsonwebtoken');

const initialBlogs = [
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
    },
    {
        title: 'Test Title 2',
        author: 'Test Author 2',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 8,
    },
    {
        title: 'Test Title 3',
        author: 'Test Author 3',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 2,
    },
];

const nonExistingBlogId = async () => {
    const user = await User.findOne({});
    const blog = new Blog({ title: 'To Be Removed', author: 'To Be Removed', url: 'To Be Removed', user: user.id.toString() });
    await blog.save();
    await blog.remove();

    return blog._id.toString();
};

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs
        .map(blog => blog.toJSON())
        .map(blog => {return { ...blog, user: blog.user.toString() };});
};

const usersInDb = async () => {
    const users = await User.find({});
    return users.map(user => user.toJSON());
};

const oneUserInDb = async (params) => {
    const user = await User.findOne(params || { username: 'root' });

    return user.toJSON();
};

const getTokenFor = user => jwt.sign(user, process.env.SECRET);

module.exports = {
    initialBlogs,
    nonExistingBlogId,
    blogsInDb,
    usersInDb,
    oneUserInDb,
    getTokenFor
};