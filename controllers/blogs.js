const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (_req, res) => {
    const blogs = await Blog.find({});
    res.json(blogs);
});

blogsRouter.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (blog === null) res.status(404);
    res.json(blog);
});

blogsRouter.delete('/:id', async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (blog === null) res.status(404);
    res.status(204).end();
});

blogsRouter.post('/', async (req, res) => {
    const blog = new Blog(req.body);

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
});

blogsRouter.put('/:id', async (req, res) => {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (updatedBlog === null) {
        res.status(404).send({ error: 'blog not found' });
    } else {
        res.json(updatedBlog);
    }
});

module.exports = blogsRouter;
