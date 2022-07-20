const { Router } = require('express');
const { ResultCode } = require('./routes');
const auth = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const profileRepository = require('../repository/profile.repository');
const postRepository = require('../repository/post.repository');
const photoRepository = require('../repository/photo.repository');
const likePostRepository = require('../repository/likePost.repository');
const router = Router();

// Get user posts
router.get('/:userId', async (req, res) => {
    try {

        let userId = req.params.userId;
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"

        if(token) {
            const secret = process.env.MESSANGER_JWT_SECRET;
            const decoded = jwt.verify(token, secret, {ignoreExpiration: true} );
            const user = decoded;
            userId = user.userId;
        }

        const profile = await profileRepository.getProfileByUserId(req.params.userId); 
        const posts = await postRepository.getPostByProfileId(profile.id);

        let fullPosts = [];
        for (let i = 0; i < posts.length; i++) {
            const profile = await profileRepository.getProfileByUserId(posts[i].userId); 
            const photos = await photoRepository.getPhotoByProfileId(profile.id);

            const likes = await likePostRepository.getLikesByPostIdAndIsLike(posts[i].id, true); 
            const dislikes = await likePostRepository.getLikesByPostIdAndIsLike(posts[i].id, false);
            const uLike = await likePostRepository.getLikesByPostIdAndUserId(posts[i].id, userId); 
            let userLike = null;
            if (uLike && uLike.like === true) {
                userLike = 'liked';
            }
            if (uLike && uLike.like === false) {
                userLike = 'disliked';
            }
            fullPosts.push({
                id: posts[i].id,
                profileId: posts[i].profileId,
                userId: posts[i].userId,
                avatar: photos.small,
                createDate: posts[i].createDate.toLocaleString(),
                text: posts[i].text,
                userName: profile.fullName,
                likes: likes.length, 
                dislikes: dislikes.length,
                userLike: userLike
            });
        }

        res.json({
            resultCode: ResultCode.Success,
            data: {posts: fullPosts}
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

// Add new post
router.post('/', auth, 
    async (req, res) => {
    try {
        const {text, profileId} = req.body;

        const newPost = await postRepository.addPost(req.user.userId, text, profileId); 
        const profile = await profileRepository.getProfileByUserId(newPost.userId); 
        const photos = await photoRepository.getPhotoByProfileId(profile.id); 
        const fullPost = {
            id: newPost.id,
            profileId: profileId,
            userId: newPost.userId,
            avatar: photos.small,
            createDate: newPost.createDate,
            text: newPost.text,
            userName: profile.fullName,
            likes: 0, 
            dislikes: 0
        };

        res.status(201).json({post: fullPost , resultCode: 0});

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong', resultCode: 1 })
    }
});

// Delete post
router.delete('/:postId', auth, 
    async (req, res) => {
    try {
        const profile = await profileRepository.getProfileByUserId(req.user.userId); 
        // ProfileId - 2 argument for checking what a user is an owner of this post
        const result = await postRepository.deletePost(req.params.postId, profile.id); 
        const deleteLikeResult = await likePostRepository.deleteLikes(req.params.postId); 
        if (result.deletedCount && result.deletedCount > 0) {
            res.status(200).json({resultCode: 0});
        } else {
            res.status(403).json({resultCode: 1});
        }

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong', resultCode: 1 })
    }
});

router.put("/like", auth, async (req, res) => {
    try {
        const {postId, like} = req.body;
        const likePost = await likePostRepository.getLikesByPostIdAndUserId(postId, req.user.userId); 
        // If likePost exist, then update likePost. In another way add a new record.
        if (likePost) {
            const result = await likePostRepository.updateLike(postId, req.user.userId, like);
        } else {
            const result = await likePostRepository.addLike(postId, req.user.userId, like);
        }

        res.json({
            resultCode: ResultCode.Success
        });
        
    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' });
    }

});

module.exports = router;