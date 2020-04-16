const config = require('./utils/config');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

logger.info('MongoDB connecting');
mongoose
    .connect(config.MONGODB_URI, {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => logger.info('MongoDB connection established'))
    .catch(() => {
        logger.error('MongoDB connection failed');
        process.exit(1);
    });

const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const middleware = require('./utils/middleware');

const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

app.use(cors());
app.use(middleware.tokenExtractor);
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(middleware.requestLogger);

app.use('/api/login', loginRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;