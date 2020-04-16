const morgan = require('morgan');
const logger = require('../utils/logger');

morgan.token('body', req => (req.method === 'POST' || req.method === 'PUT') ? JSON.stringify(req.body) : '');
const requestLogger = morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.body(req, res),
    ].join(' ');
});

const unknownEndpoint = (_req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
    logger.error('error handler: ', req.method, req.url, error, `>${error.name}<`, error.message);

    switch (error.name) {
    case 'ValidationError':
        return res.status(400).json({ message: error.message });
    case 'CastError':
        return res.status(400).json({ message: 'malformed id' });
    case 'TypeError':
        return res.status(400).json({ message: 'malformed request' });
    case 'JsonWebTokenError':
        return res.status(401).json({ message: 'invalid token' });
    default:
        break;
    }

    next(error);
};

const tokenExtractor = (req, _res, next) => {
    const auth = req.get('authorization');
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        req.token = auth.substring(7);
    } else {
        req.token = null;
    }

    next();
};



module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
};
