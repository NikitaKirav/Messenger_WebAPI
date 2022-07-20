/** Absolute imports */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/** Repositories */
const userRepository = require('./repository/user.repository');
const profileRepository = require('./repository/profile.repository');
const photoRepository = require('./repository/photo.repository');
const followerRepository = require('./repository/follower.repository');
const contactRepository = require('./repository/contact.repository');
const statusRepository = require('./repository/status.repository');

/** App */
const app = require('./app');

/** Types */
const { ResultCode } = require('./routes/routes');
const postRepository = require('./repository/post.repository');
const likePostRepository = require('./repository/likePost.repository');


const profiles = [
    {
        aboutMe: "I'm Programmer",
        lookingForAJob: true,
        lookingForAJobDescription: 'CSS, React',
        fullName: 'Nikita Kirav',
        id: 'profile-id-1',
        userId: 'user-id-1'
      },
      {
        aboutMe: '',
        lookingForAJob: false,
        lookingForAJobDescription: '',
        fullName: 'Kira',
        id: 'profile-id-2',
        userId: 'user-id-2'
      }
];
const users = [
    {
        createDate: '2022-04-19T10:54:44.210Z',
        id: 'user-id-1',
        email: 'h1@mail.ru',
        password: '123123',
    },
    {
        createDate: '2022-05-06T06:12:14.508Z',
        id: 'user-id-2',
        email: 'h2@mail.ru',
        password: '123123',
    }
];
const photos = [
    {
        small: '/uploads/mini-photo.png',
        large: '/uploads/photo.png',
        id: 'photo-id-1',
        profileId: 'profile-id-1',
    },
    {
        small: '',
        large: '',
        id: 'photo-id-2',
        profileId: 'profile-id-2'
    }
];
const followers = [
    {
        id: 'follower-id-1',
        userId: 'user-id-2',
        followerId: 'user-id-1' 
    },
    {
        id: 'follower-id-2',
        userId: 'user-id-1',
        followerId: 'user-id-2' 
    }
];
const contacts = [
    {
        id: 'contact-id-1',
        github: 'https://github.com/NikitaKirav',
        vk: '',
        facebook: '',
        instagram: '',
        twitter: '',
        website: '',
        youtube: '',
        mainlink: '',
        profileId: 'profile-id-1'
    },
    {
        id: 'contact-id-2',
        github: 'https://github.com/UserName',
        vk: '',
        facebook: '',
        instagram: '',
        twitter: '',
        website: '',
        youtube: '',
        mainlink: '',
        profileId: 'profile-id-2'
    }
];
const statuses = [
    {
        id: 'status-id-1',
        status: 'Hello world!!! test user-id-1',
        userId: 'user-id-1'
    }
];
const posts = [
    {
        id: 'post-id-1',
        createDate: '2022-04-19T10:54:44.210Z',
        text: 'First post',
        userId: 'user-id-1',
        profileId: 'profile-id-1'
    },
    {
        id: 'post-id-2',
        createDate: '2022-05-19T10:54:44.210Z',
        text: 'Second post',
        userId: 'user-id-2',
        profileId: 'profile-id-1'
    }
];
const likePosts = [
    {
        id: 'like-id-1',
        like: true,
        postId: 'post-id-1',
        userId: 'user-id-1'
    },
    {
        id: 'like-id-2',
        like: true,
        postId: 'post-id-1',
        userId: 'user-id-2'
    },
    {
        id: 'like-id-3',
        like: false,
        postId: 'post-id-1',
        userId: 'user-id-3'
    },
];

describe('All APIs', () => {
    describe('User APIs /users/', () => {

        profileRepository.getProfiles = jest.fn().mockResolvedValue(profiles);
        userRepository.getUserById = jest.fn((userId) => users.find(x => x.id === userId));
        photoRepository.getPhotoByProfileId = jest.fn((profileId) => photos.find(x => x.profileId === profileId));
        followerRepository.getFollowerByIdAndUserId = jest.fn((followerId, userId) => followers.find(x => x.followerId === followerId && x.userId === userId));
        followerRepository.saveFollower = jest.fn(() => Promise.resolve());
        followerRepository.deleteFollower = jest.fn(() => Promise.resolve());

        it('GET /api-messanger/users/ --> array users', () => {
            return request(app)
                .get('/api-messanger/users')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                totalCount: 2,
                                items: [
                                    {
                                        id: profiles[0].userId,
                                        name: profiles[0].fullName,
                                        photos: {small: photos[0].small ?? '', large: photos[0].large ?? ''},
                                        followed: false
                                    },
                                    {
                                        id: profiles[1].userId,
                                        name: profiles[1].fullName,
                                        photos: {small: photos[1].small ?? '', large: photos[1].large ?? ''},
                                        followed: false
                                    }
                                ]
                            }
                        })
                    );
                });
        });

        it('GET /api-messanger/users/user-id-1 --> follower=false user-id-1', () => {
            return request(app)
                .get('/api-messanger/users/user-id-1')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                followed: false
                            }
                        })
                    );
                });
        });

        it('GET /api-messanger/users/user-id-1 + Bearer Token --> follower=true user-id-1', () => {
            const token = jwt.sign(
                { userId: 'user-id-2' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .get('/api-messanger/users/user-id-1')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                followed: true
                            }
                        })
                    );
                });
        });

        it('GET /api-messanger/users/9999999 --> 404 if not found', () => {
            const token = jwt.sign(
                { userId: 'user-id-2' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .get('/api-messanger/users/9999999')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        it('POST /api-messanger/users/follow/follower-id-1 --> add follower-id-1', () => {
            const token = jwt.sign(
                { userId: 'user-id-2' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .post('/api-messanger/users/follow/follower-id-1')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    name: 'user-id-1'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success
                        })
                    );
                    expect(followerRepository.saveFollower).toBeCalledWith('follower-id-1', 'user-id-2')
                });        
        });

        it('DELETE /api-messanger/users/follow/follower-id-1 --> delete follower-id-1', () => {
            const token = jwt.sign(
                { userId: 'user-id-2' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .delete('/api-messanger/users/follow/follower-id-1')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    name: 'user-id-1'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success
                        })
                    );
                    expect(followerRepository.deleteFollower).toBeCalledWith('follower-id-1', 'user-id-2')
                });        
        });
    });

    describe('Profile APIs /profile/', () => {
        profileRepository.updateProfile = jest.fn().mockResolvedValue(profiles[0]);
        contactRepository.updateContact = jest.fn(() => Promise.resolve());
        profileRepository.getProfileByUserId = jest.fn((userId) => profiles.find(x => x.userId === userId));
        statusRepository.getStatusByUserId = jest.fn((userId) => statuses.find(x => x.userId === userId));
        statusRepository.updateStatus = jest.fn(() => Promise.resolve());
        statusRepository.addStatus = jest.fn(() => Promise.resolve());
        contactRepository.getContactByProfileId = jest.fn((profileId) => contacts.find(x => x.profileId === profileId));
        photoRepository.getPhotoByProfileId = jest.fn((profileId) => photos.find(x => x.profileId === profileId));

        it('PUT /profile/ --> updated profile', () => {
            const token = jwt.sign(
                { userId: 'user-id-1' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            const contacts =
            {
                github: 'https://github.com/NikitaKirav',
                vk: '',
                facebook: '',
                instagram: '',
                twitter: '',
                website: '',
                youtube: '',
                mainlink: ''
            };

            return request(app)
                .put('/api-messanger/profile')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    aboutMe: profiles[0].aboutMe,
                    lookingForAJob: profiles[0].lookingForAJob,
                    lookingForAJobDescription: profiles[0].lookingForAJobDescription,
                    fullName: profiles[0].fullName,
                    contacts: contacts
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: profiles[0]
                        })
                    );
                    expect(profileRepository.getProfileByUserId).toBeCalledWith('user-id-1');
                    expect(profileRepository.updateProfile).toBeCalledWith('user-id-1', {
                        aboutMe: profiles[0].aboutMe,
                        lookingForAJob: profiles[0].lookingForAJob,
                        lookingForAJobDescription: profiles[0].lookingForAJobDescription,
                        fullName: profiles[0].fullName,
                    });
                    expect(contactRepository.updateContact).toBeCalledWith('profile-id-1', contacts);
                }); 
        });

        it('GET /profile/status/user-id-1 --> get status by user-id-1', () => {
            return request(app)
                .get('/api-messanger/profile/status/user-id-1')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                status: 'Hello world!!! test user-id-1'
                            }
                        })
                    );
                });
        });

        it('PUT /profile/status --> updated status', () => {
            const token = jwt.sign(
                { userId: 'user-id-1' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .put('/api-messanger/profile/status')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    status: 'my new status!',
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                status: 'my new status!'
                            }
                        })
                    );
                    expect(statusRepository.getStatusByUserId).toBeCalledWith('user-id-1');
                    expect(statusRepository.updateStatus).toBeCalledWith('user-id-1', 'my new status!');
                });
        });

        it('PUT /profile/status --> add status', () => {
            const token = jwt.sign(
                { userId: 'user-id-2' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .put('/api-messanger/profile/status')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    status: 'my new status!',
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                status: 'my new status!'
                            }
                        })
                    );
                    expect(statusRepository.getStatusByUserId).toBeCalledWith('user-id-2');
                    expect(statusRepository.addStatus).toBeCalledWith('user-id-2', 'my new status!');
                });
        });

        
        it('GET /profile/user-id-1 --> get profile by user-id-1', () => {
            return request(app)
                .get('/api-messanger/profile/user-id-1')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                id: profiles[0].id,
                                userId: profiles[0].userId, 
                                aboutMe: profiles[0].aboutMe,
                                lookingForAJob: profiles[0].lookingForAJob,
                                lookingForAJobDescription: profiles[0].lookingForAJobDescription,
                                fullName: profiles[0].fullName,
                                contacts: {
                                    github: contacts[0].github,
                                    vk: contacts[0].vk,
                                    facebook: contacts[0].facebook,
                                    instagram: contacts[0].instagram,
                                    twitter: contacts[0].twitter,
                                    website: contacts[0].website,
                                    youtube: contacts[0].youtube,
                                    mainlink: contacts[0].mainlink
                                }, 
                                photos: photos[0]
                            }
                        })
                    );
                });
        });

    });

    describe('Auth APIs /auth/', () => {
        const newUser = {
            createDate: '2022-04-19T10:54:44.210Z',
            id: 'user-id-3',
            email: 'h3@mail.ru',
            password: '123123',
        };
        const newProfile = {
            aboutMe: "",
            lookingForAJob: false,
            lookingForAJobDescription: '',
            fullName: 'New User',
            id: 'profile-id-3',
            userId: 'user-id-3'
        };
        userRepository.getUserByEmail = jest.fn((email) => users.find(x => x.email === email));
        userRepository.addUser = jest.fn(() => newUser);
        profileRepository.addProfile = jest.fn(() => newProfile);
        contactRepository.addContact = jest.fn(() => Promise.resolve());
        photoRepository.addPhoto = jest.fn(() => Promise.resolve());
        profileRepository.getProfileByUserId = jest.fn((userId) => profiles.find(x => x.userId === userId));

        it('POST /api-messanger/auth/register --> register a new user', () => {

            return request(app)
                .post('/api-messanger/auth/register')
                .set('Content-Type',  'application/json')
                .send({
                    email: 'h3@mail.ru', 
                    password: '123123', 
                    userName: 'NewUser'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            message: 'Thanks for registration. User was added!'
                        })
                    );
                    expect(userRepository.getUserByEmail).toBeCalledWith('h3@mail.ru');
                    expect(userRepository.addUser).toBeCalledWith('h3@mail.ru', expect.anything());
                    expect(profileRepository.addProfile).toBeCalledWith('user-id-3', 'NewUser');
                    expect(contactRepository.addContact).toBeCalledWith('profile-id-3');
                    expect(photoRepository.addPhoto).toBeCalledWith('profile-id-3');
                });        
        });

        it('POST /api-messanger/auth/login --> login', () => {

            bcrypt.compare = jest.fn(() => true);

            return request(app)
                .post('/api-messanger/auth/login')
                .set('Content-Type',  'application/json')
                .send({
                    email: 'h2@mail.ru', 
                    password: '123123'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success
                        })
                    );
                    expect(userRepository.getUserByEmail).toBeCalledWith('h2@mail.ru');
                    expect(profileRepository.getProfileByUserId).toBeCalledWith('user-id-2');
                });        
        });
    });

    describe('Post APIs /post/', () => {
        profileRepository.getProfileByUserId = jest.fn((userId) => profiles.find(x => x.userId === userId));
        postRepository.getPostByProfileId = jest.fn((profileId) => posts.filter(x => x.profileId === profileId));
        photoRepository.getPhotoByProfileId = jest.fn((profileId) => photos.find(x => x.profileId === profileId));
        likePostRepository.getLikesByPostIdAndIsLike = jest.fn((postId, like) => likePosts.filter(x => x.postId === postId && x.like === like));
        likePostRepository.getLikesByPostIdAndUserId = jest.fn((postId, userId) => likePosts.find(x => x.postId === postId && x.userId === userId));
        postRepository.addPost = jest.fn(() => posts[1]);
        postRepository.deletePost = jest.fn(() => ({ deletedCount: 1 }));
        likePostRepository.deleteLikes = jest.fn(() => Promise.resolve());
        likePostRepository.updateLike = jest.fn(() => Promise.resolve());    
        likePostRepository.addLike = jest.fn(() => Promise.resolve());   

        it('GET /api-messanger/post/user-id-1 --> array posts', () => {
            return request(app)
                .get('/api-messanger/post/user-id-1')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            data: {
                                posts: [
                                    {
                                        id: posts[0].id,
                                        profileId: posts[0].profileId,
                                        userId: posts[0].userId,
                                        avatar: photos[0].small,
                                        createDate: posts[0].createDate,
                                        text: posts[0].text,
                                        userName: profiles[0].fullName,
                                        likes: 2, 
                                        dislikes: 1,
                                        userLike: 'liked'
                                    },
                                    {
                                        id: posts[1].id,
                                        profileId: posts[1].profileId,
                                        userId: posts[1].userId,
                                        avatar: photos[1].small,
                                        createDate: posts[1].createDate,
                                        text: posts[1].text,
                                        userName: profiles[1].fullName,
                                        likes: 0, 
                                        dislikes: 0,
                                        userLike: null
                                    }
                                ]
                            }
                        })
                    );
                });
        });

        it('POST /api-messanger/post --> added a new post', () => {
            const token = jwt.sign(
                { userId: 'user-id-2' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );


            return request(app)
                .post('/api-messanger/post')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    text: posts[1].text, 
                    profileId: 'profile-id-1'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                            post: {
                                id: posts[1].id,
                                profileId: posts[1].profileId,
                                userId: posts[1].userId,
                                avatar: photos[1].small,
                                createDate: posts[1].createDate,
                                text: posts[1].text,
                                userName: profiles[1].fullName,
                                likes: 0, 
                                dislikes: 0
                            }

                        })
                    );
                    expect(postRepository.addPost).toBeCalledWith('user-id-2', posts[1].text, 'profile-id-1');
                    expect(profileRepository.getProfileByUserId).toBeCalledWith('user-id-2');
                });        
        });

        it('DELETE /api-messanger/post/post-id-1 --> deleted the post', () => {
            const token = jwt.sign(
                { userId: 'user-id-1' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );


            return request(app)
                .delete('/api-messanger/post/post-id-1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                        })
                    );
                    expect(postRepository.deletePost).toBeCalledWith('post-id-1', 'profile-id-1');
                    expect(likePostRepository.deleteLikes).toBeCalledWith('post-id-1');
                });        
        });

        it('PUT /api-messanger/post/like --> add like', () => {
            const token = jwt.sign(
                { userId: 'user-id-1' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .put('/api-messanger/post/like')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    postId: 'post-id-3', 
                    like: true
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                        })
                    );
                    expect(likePostRepository.addLike).toBeCalledWith("post-id-3", "user-id-1", true);
                });        
        });
        
        it('PUT /api-messanger/post/like --> update like', () => {
            const token = jwt.sign(
                { userId: 'user-id-1' },
                process.env.MESSANGER_JWT_SECRET,
                { expiresIn: '360d' }
            );

            return request(app)
                .put('/api-messanger/post/like')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type',  'application/json')
                .send({
                    postId: 'post-id-1', 
                    like: true
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            resultCode: ResultCode.Success,
                        })
                    );
                    expect(likePostRepository.updateLike).toBeCalledWith("post-id-1", "user-id-1", true);
                });        
        });
    });
});
