const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({})
        .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 });

    response.json(users.map(user => user.toJSON()));
});

usersRouter.post('/', async (req, res) => {
    const body = req.body;

    if (!body.password || body.password.length < 3) {
        res.status(400).json({ message: 'password is shorter than the minimum allowed length' });
        return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    });

    const savedUser = await user.save();

    res.json(savedUser);
});

module.exports = usersRouter;