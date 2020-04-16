const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (_req, res) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 });

    res.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (blog === null) {
        res.status(404).end();
        return;
    }
    res.json(blog.toJSON());
});

blogsRouter.delete('/:id', async (req, res) => {
    const deleteId = req.params.id;
    const blog = await Blog.findById(deleteId);

    if (blog === null) {
        res.status(404).end();
        return;
    }

    const token = req.token;
    const decodedToken = token ? jwt.verify(token, process.env.SECRET) : null;

    if (!token || !decodedToken.id) {
        return res.status(401).json({ message: 'token missing or invalid ' });
    }
    const user = await User.findById(decodedToken.id);

    if (blog.user.toString() !== user._id.toString()) {
        return res.status(401).json({ message: 'token missing or invalid ' });
    }

    await blog.delete();

    user.blogs = user.blogs.filter(({ _id }) => blog.id !== _id.toString());
    await user.save();

    res.status(204).end();
});

blogsRouter.post('/', async (req, res) => {
    const body = req.body;
    const token = req.token;

    const decodedToken = token ? jwt.verify(token, process.env.SECRET) : null;

    if (!token || !decodedToken.id) {
        return res.status(401).json({ message: 'token missing or invalid ' });
    }
    const user = await User.findById(decodedToken.id);

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id,
    });

    const savedBlog = await blog.save();

    user.blogs.push(savedBlog._id);
    await user.save();

    res.status(201).json(savedBlog);
});

blogsRouter.put('/:id', async (req, res) => {
    const body = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id,
        {
            author: body.author,
            likes: body.likes,
            title: body.title,
            url: body.url,
        },
        {
            new: true,
            omitUndefined: true,
        });

    if (updatedBlog === null) {
        res.status(404).send({ error: 'blog not found' });
    } else {
        res.json(updatedBlog);
    }
});

module.exports = blogsRouter;
