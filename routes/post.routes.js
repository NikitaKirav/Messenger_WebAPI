const { Router } = require('express');
const Profile = require('../models/Profile');
const { ResultCode } = require('./routes');
const Photo = require('../models/Photo');
const Post = require('../models/Post');
const LikePost = require('../models/LikePost');
const auth = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const router = Router();

router.get('/:userId', async (req, res) => {
    try {

        let userId = req.params.userId;
        const token = req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"

        if(token) {
            const secret = process.env.MESSANGER_JWT_SECRET;
            const decoded = jwt.verify(token, secret, {ignoreExpiration: true} );
            const user = decoded;
            userId = user.userId;
        }

        const profile = await Profile.findOne({ userId: req.params.userId });
        const posts = await Post.find({profileId: profile.id });

        let fullPosts = [];
        for (let i = 0; i < posts.length; i++) {
            const profile = await Profile.findOne({ userId: posts[i].userId });
            const photos = await Photo.findOne({ profileId: profile.id });

            const likes = await LikePost.find({postId: posts[i].id, like: true});
            const dislikes = await LikePost.find({postId: posts[i].id, like: false});
            const uLike = await LikePost.findOne({postId: posts[i].id, userId: userId});
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

        const post = new Post({userId: req.user.userId, createDate: Date.now(), text: text, profileId: profileId});
        const newPost = await post.save();
        const profile = await Profile.findOne({ userId: newPost.userId });
        const photos = await Photo.findOne({ profileId: profile.id });
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
        const profile = await Profile.findOne({userId: req.user.userId});
        const result = await Post.deleteOne({_id: req.params.postId, profileId: profile.id});
        const result2 = await LikePost.deleteMany({postId: req.params.postId});
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
        const likePost = await LikePost.findOne({postId: postId, userId: req.user.userId});
        // If likePost exist, then update likePost. In another way add a new record.
        if (likePost) {
            const likeNew = {
                $set: {
                    date: Date.now(),
                    like: like,
                }
            }

            const result = await LikePost.findOneAndUpdate({postId: postId, userId: req.user.userId}, likeNew);
        } else {
            const likeNew = new LikePost({
                postId: postId,
                userId: req.user.userId,
                date: Date.now(),
                like: like
            });

            const result = await likeNew.save();
        }

        res.json({
            resultCode: ResultCode.Success
        });
        
    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }

});

module.exports = router;