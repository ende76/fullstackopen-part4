const _ = require('lodash');

const dummy = () => 1;

const totalLikes = blogs => blogs.reduce((total, { likes }) => total + likes, 0);

const favoriteBlog = blogs => {
    if (blogs.length === 0) return null;

    const { author, title, likes } = blogs.reduce((fav, blog) => {
        if (blog.likes <= fav.likes) return fav;

        return blog;
    }, blogs[0]);

    const result = { author, title, likes };

    return result;
};

const mostBlogs = blogList => {
    if (blogList.length === 0) return null;

    const f = _.toPairs(_.countBy(blogList, blog => blog.author));
    const [author, blogs] = _.maxBy(f, ([, blogs]) => blogs);

    return { author, blogs };
};

const mostLikes = blogList => {
    if (blogList.length === 0) return null;

    const aggregateLikes = (map, { author, likes }) => {
        map[author] = (map[author] || 0) + likes;
        return map;
    };

    const f = _.toPairs(blogList.reduce(aggregateLikes, {}));
    const [author, likes] = _.maxBy(f, ([, likes]) => likes);

    return { author, likes };
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
};