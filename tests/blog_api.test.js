const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');

const api = supertest(app);

beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('sekret', 10);
    const rootUser = new User({ username: 'root', blogs: [], passwordHash });
    await rootUser.save();
    const rootId = rootUser._id.toString();

    const otherUser = new User({ username: 'otheruser', passwordHash });
    await otherUser.save();

    await Blog.deleteMany({});

    for (let blog of helper.initialBlogs) {
        blog.user = rootId;

        let blogObject = new Blog(blog);
        const savedBlog = await blogObject.save();
        rootUser.blogs.push(savedBlog);
    }

    await rootUser.save();
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

            expect(resultBlog.body.id).toEqual(blogToView.id);
            expect(resultBlog.body.title).toEqual(blogToView.title);
            expect(resultBlog.body.author).toEqual(blogToView.author);
            expect(resultBlog.body.url).toEqual(blogToView.url);
            expect(resultBlog.body.likes).toEqual(blogToView.likes);
            expect(resultBlog.body.user).toEqual(blogToView.user);
        });

        test('getting a non-existent id returns 404', async () => {
            const nonExistingId = await helper.nonExistingBlogId();

            await api
                .get(`/api/blogs/${nonExistingId}`)
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

        test('title can be updated', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToUpdate = initialBlogs[0];
            const titleBeforeUpdate = blogToUpdate.title;

            expect(titleBeforeUpdate).not.toBe('updated title');

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send({ title: 'updated title' })
                .expect(200);

            const updatedBlog = response.body;

            expect(updatedBlog.title).toBe('updated title');
        });

        test('author can be updated', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToUpdate = initialBlogs[0];
            const authorBeforeUpdate = blogToUpdate.author;

            expect(authorBeforeUpdate).not.toBe('updated author');

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send({ author: 'updated author' })
                .expect(200);

            const updatedBlog = response.body;

            expect(updatedBlog.author).toBe('updated author');
        });

        test('url can be updated', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToUpdate = initialBlogs[0];
            const urlBeforeUpdate = blogToUpdate.url;

            expect(urlBeforeUpdate).not.toBe('updated url');

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send({ url: 'updated url' })
                .expect(200);

            const updatedBlog = response.body;

            expect(updatedBlog.url).toBe('updated url');
        });
    });



    describe('deleting a specific blog', () => {
        test('a blog can be deleted', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToDelete = initialBlogs[0];
            const user = await helper.oneUserInDb();
            const token = helper.getTokenFor(user);

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: `bearer ${token}` })
                .expect(204);

            const blogsAtEnd = await helper.blogsInDb();
            const userAtEnd = await helper.oneUserInDb();

            expect(blogsAtEnd).toHaveLength(
                helper.initialBlogs.length - 1
            );
            const titles = blogsAtEnd.map(r => r.title);
            expect(titles).not.toContain(blogToDelete.title);

            const userBlogIds = userAtEnd.blogs.map(blog => blog.toString());

            expect(userBlogIds).not.toContain(blogToDelete.id.toString());
        });

        test('deleting a blog with a token for the wrong user should return 401', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToDelete = initialBlogs[0];
            const user = await helper.oneUserInDb({ username: 'otheruser' });
            const token = helper.getTokenFor(user);

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: `bearer ${token}` })
                .expect(401);

            const blogsAtEnd = await helper.blogsInDb();

            expect(blogsAtEnd).toHaveLength(
                helper.initialBlogs.length
            );
        });

        test('deleting a blog without a token should return 401', async () => {
            const initialBlogs = await helper.blogsInDb();
            const blogToDelete = initialBlogs[0];

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(401);

            const blogsAtEnd = await helper.blogsInDb();

            expect(blogsAtEnd).toHaveLength(
                helper.initialBlogs.length
            );
        });
    });
});



describe('for blog creation', () => {
    test('a valid blog can be added', async () => {
        const user = await helper.oneUserInDb();
        const token = helper.getTokenFor(user);

        const newBlog = {
            author: 'New Test Author',
            title: 'New Test Title',
            url: 'http://new.test.url/',
            likes: 9000,
        };

        await api
            .post('/api/blogs')
            .set({ Authorization: `bearer ${token}` })
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const allBlogs = await helper.blogsInDb();
        const titles = allBlogs.map(({ title }) => title);

        expect(allBlogs).toHaveLength(helper.initialBlogs.length + 1);
        expect(titles).toContain(newBlog.title);
    });

    test('a valid blog without token should return 401', async () => {
        const newBlog = {
            author: 'New Test Author',
            title: 'New Test Title',
            url: 'http://new.test.url/',
            likes: 9000,
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401, /token missing or invalid/)
            .expect('Content-Type', /application\/json/);

        const allBlogs = await helper.blogsInDb();
        expect(allBlogs).toHaveLength(helper.initialBlogs.length );
    });


    test('on creation, likes default to 0 if not specified', async () => {
        const user = await helper.oneUserInDb();
        const token = helper.getTokenFor(user);

        const newBlog = {
            author: 'New Test Author',
            title: 'New Test Title',
            url: 'http://new.test.url/',
            userId: user.id,
        };

        const response = await api
            .post('/api/blogs')
            .set({ Authorization: `bearer ${token}` })
            .send(newBlog);

        const savedBlog = response.body;

        expect(savedBlog.likes).toBe(0);
    });

    describe('validation', () => {
        test('blog without title is not added', async () => {
            const user = await helper.oneUserInDb();
            const token = helper.getTokenFor(user);

            const newBlog = {
                author: 'Test Author',
                url: 'http://test.url/',
                likes: 9,
                userId: user.id,
            };

            await api
                .post('/api/blogs')
                .set({ Authorization: `bearer ${token}` })
                .send(newBlog)
                .expect(400);

            const allBlogs = await helper.blogsInDb();

            expect(allBlogs).toHaveLength(helper.initialBlogs.length);
        });

        test('blog without url is not added', async () => {
            const user = await helper.oneUserInDb();
            const token = helper.getTokenFor(user);

            const newBlog = {
                author: 'Test Author',
                title: 'Test Title',
                likes: 9,
                userId: user.id,
            };

            await api
                .post('/api/blogs')
                .set({ Authorization: `bearer ${token}` })
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