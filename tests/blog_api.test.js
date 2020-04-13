const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
    await Blog.deleteMany({});

    for (let blog of helper.initialBlogs) {
        let blogObject = new Blog(blog);
        await blogObject.save();
    }
});



describe('for existing, stored blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('blogs define id property instead of _id', async () => {
        const response = await api.get('/api/blogs');
        const blogs = response.body;

        expect(blogs[0].id).toBeDefined();
        expect(blogs[0]._id).not.toBeDefined();
    });

    test('there are three blogs', async () => {
        const response = await api.get('/api/blogs');

        expect(response.body).toHaveLength(helper.initialBlogs.length);
    });

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs');

        const titles = response.body.map(({ title }) => title);

        expect(titles).toContain('Go To Statement Considered Harmful');
    });



    describe('viewing a specific blog', () => {
        test('a specific blog can be viewed', async () => {
            const initialBlogs = await helper.blogsInDb();

            const blogToView = initialBlogs[0];

            const resultBlog = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);

            expect(resultBlog.body).toEqual(blogToView);
        });

        test('getting a non-existent id returns 404', async () => {
            const tempBlog = {
                author: 'Temp Author',
                title: 'Temp Title',
                url: 'http://temp.url/',
            };

            const response =
                await api
                    .post('/api/blogs')
                    .send(tempBlog);

            const nonExistentId = response.body.id;

            await api.delete(`/api/blogs/${nonExistentId}`);

            await api
                .get(`/api/blogs/${nonExistentId}`)
                .expect(404);
        });

        test('getting a malformed id returns 400', async () => {
            await api
                .get('/api/blogs/malformedidstring')
                .expect(400);
        });
    });



    describe('updating a specific blog', () => {
        test('likes can be updated', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToUpdate = initialBlogs[0];
            const likesBeforeUpdate = blogToUpdate.likes;

            expect(likesBeforeUpdate).not.toBe(500);

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send({ likes: 500 })
                .expect(200);

            const updatedBlog = response.body;

            expect(updatedBlog.likes).toBe(500);
        });
    });



    describe('deleting a specific blog', () => {
        test('a blog can be deleted', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToDelete = initialBlogs[0];

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204);

            const blogsAtEnd = await helper.blogsInDb();

            expect(blogsAtEnd).toHaveLength(
                helper.initialBlogs.length - 1
            );

            const titles = blogsAtEnd.map(r => r.title);

            expect(titles).not.toContain(blogToDelete.title);
        });
    });
});



describe('for blog creation', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            author: 'New Test Author',
            title: 'New Test Title',
            url: 'http://new.test.url/',
            likes: 9000,
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const allBlogs = await helper.blogsInDb();
        const titles = allBlogs.map(({ title }) => title);

        expect(allBlogs).toHaveLength(helper.initialBlogs.length + 1);
        expect(titles).toContain(newBlog.title);
    });

    test('on creation, likes default to 0 if not specified', async () => {
        const newBlog = {
            author: 'New Test Author',
            title: 'New Test Title',
            url: 'http://new.test.url/',
        };

        const response = await api
            .post('/api/blogs')
            .send(newBlog);

        const savedBlog = response.body;

        expect(savedBlog.likes).toBe(0);
    });

    describe('validation', () => {
        test('blog without title is not added', async () => {
            const newBlog = {
                url: 'http://test.url/',
                likes: 9
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400);

            const allBlogs = await helper.blogsInDb();

            expect(allBlogs).toHaveLength(helper.initialBlogs.length);
        });

        test('blog without url is not added', async () => {
            const newBlog = {
                title: 'test title',
                likes: 9
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400);

            const allBlogs = await helper.blogsInDb();

            expect(allBlogs).toHaveLength(helper.initialBlogs.length);
        });
    });
});



afterAll(() => {
    mongoose.connection.close();
});