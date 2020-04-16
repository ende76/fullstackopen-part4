const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const User = require('../models/user');

const bcrypt = require('bcrypt');

const api = supertest(app);


describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('sekret', 10);
        const user = new User({ username: 'root', name: 'Super User', passwordHash });

        await user.save();
    });

    test('existing user can login with correct password', async () => {
        const user0 = {
            username: 'root',
            password: 'sekret',
        };

        const tokenResponse = await api
            .post('/api/login')
            .send(user0)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(tokenResponse.body.token).toBeDefined();
    });

    test('existing user can *NOT* login with wrong password', async () => {
        const user0 = {
            username: 'root',
            password: 'wrongpassword',
        };

        await api
            .post('/api/login')
            .send(user0)
            .expect(401, /invalid/)
            .expect('Content-Type', /application\/json/);
    });

    test('existing user can *NOT* login with wrong username', async () => {
        const user0 = {
            username: 'wrongusername',
            password: 'sekret',
        };

        await api
            .post('/api/login')
            .send(user0)
            .expect(401, /invalid/)
            .expect('Content-Type', /application\/json/);
    });

    test('existing user can *NOT* login with missing password', async () => {
        const user0 = {
            username: 'root',
        };

        await api
            .post('/api/login')
            .send(user0)
            .expect(401, /invalid/)
            .expect('Content-Type', /application\/json/);
    });

    test('existing user can *NOT* login with missing username', async () => {
        const user0 = {
            password: 'sekret',
        };

        await api
            .post('/api/login')
            .send(user0)
            .expect(401, /invalid/)
            .expect('Content-Type', /application\/json/);
    });
});

afterAll(() => {
    mongoose.connection.close();
});