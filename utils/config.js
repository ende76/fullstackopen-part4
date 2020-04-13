require('dotenv').config();

const isTestEnv = process.env.NODE_ENV === 'test';

const { PORT, MONGODB_URI, TEST_MONGODB_URI } = process.env;

module.exports = {
    PORT,
    MONGODB_URI: isTestEnv ? TEST_MONGODB_URI : MONGODB_URI,
};