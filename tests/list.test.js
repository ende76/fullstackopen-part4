const listHelper = require('../utils/list_helper');

test('dummy return one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
});

describe('total likes', () => {
    const emptyList = [];
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        }
    ];
    const listWithMultipleBlogs = [
        {
            _id: '5a422aa71b54a676234d17f5',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        },
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 8,
            __v: 0
        },
        {
            _id: '5a422aa71b54a676234d17f2',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 2,
            __v: 0
        },

    ];

    test('of empty list is zero', () => {
        expect(listHelper.totalLikes(emptyList)).toBe(0);
    });

    test('of one blog should equals likes of that blog', () => {
        expect(listHelper.totalLikes(listWithOneBlog)).toBe(5);
    });

    test('of multiple blogs should be summed up correctly', () => {
        expect(listHelper.totalLikes(listWithMultipleBlogs)).toBe(15);
    });
});

describe('favorite blog', () => {
    const emptyList = [];
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        }
    ];
    const listWithMultipleBlogs = [
        {
            _id: '5a422aa71b54a676234d17f5',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        },
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Test Title 2',
            author: 'Test Author 2',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 8,
            __v: 0
        },
        {
            _id: '5a422aa71b54a676234d17f2',
            title: 'Test Title 3',
            author: 'Test Author 3',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 2,
            __v: 0
        },

    ];

    test('of empty list should be null', () => {
        expect(listHelper.favoriteBlog(emptyList)).toBeNull();
    });

    test('of one blog should be that blog', () => {
        const expected = {
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            likes: 5,
        };
        expect(listHelper.favoriteBlog(listWithOneBlog)).toEqual(expected);
    });

    test('of multiple blogs should be the blog with most likes', () => {
        const expected = {
            title: 'Test Title 2',
            author: 'Test Author 2',
            likes: 8,
        };

        expect(listHelper.favoriteBlog(listWithMultipleBlogs)).toEqual(expected);
    });
});

describe('most blogs', () => {
    const oneBlog = {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0,
    };

    const emptyList = [];

    const listWithOneBlog = [oneBlog];

    const listWithMultipleBlogs = [
        oneBlog,
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        },
        {
            _id: '5a422b3a1b54a676234d17f9',
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
            likes: 12,
            __v: 0
        },
        {
            _id: '5a422b891b54a676234d17fa',
            title: 'First class tests',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
            likes: 10,
            __v: 0
        },
        {
            _id: '5a422ba71b54a676234d17fb',
            title: 'TDD harms architecture',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
            likes: 0,
            __v: 0
        },
        {
            _id: '5a422bc61b54a676234d17fc',
            title: 'Type wars',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
            likes: 2,
            __v: 0
        }
    ];

    test('of empty list should be null', () => {
        expect(listHelper.mostBlogs(emptyList)).toBeNull();
    });

    test('of one blog should be that blog\'s author', () => {
        const expected = {
            author: 'Michael Chan',
            blogs: 1,
        };

        expect(listHelper.mostBlogs(listWithOneBlog)).toEqual(expected);
    });

    test('of list with many blogs should be author of most blogs', () => {
        const expected = {
            author: 'Robert C. Martin',
            blogs: 3,
        };

        expect(listHelper.mostBlogs(listWithMultipleBlogs)).toEqual(expected);
    });
});

describe('most likes', () => {
    const oneBlog = {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0,
    };

    const emptyList = [];

    const listWithOneBlog = [oneBlog];

    const listWithMultipleBlogs = [
        oneBlog,
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        },
        {
            _id: '5a422b3a1b54a676234d17f9',
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
            likes: 12,
            __v: 0
        },
        {
            _id: '5a422b891b54a676234d17fa',
            title: 'First class tests',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
            likes: 10,
            __v: 0
        },
        {
            _id: '5a422ba71b54a676234d17fb',
            title: 'TDD harms architecture',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
            likes: 0,
            __v: 0
        },
        {
            _id: '5a422bc61b54a676234d17fc',
            title: 'Type wars',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
            likes: 2,
            __v: 0
        }
    ];

    test('of empty list should be null', () => {
        expect(listHelper.mostLikes(emptyList)).toBeNull();
    });

    test('of one blog to be author of that blog', () => {
        const expected = {
            author: 'Michael Chan',
            likes: 7,
        };

        expect(listHelper.mostLikes(listWithOneBlog)).toEqual(expected);
    });

    test('of multiple blogs to be author with most likes', () => {
        const expected = {
            author: 'Edsger W. Dijkstra',
            likes: 17,
        };

        expect(listHelper.mostLikes(listWithMultipleBlogs)).toEqual(expected);
    });
});