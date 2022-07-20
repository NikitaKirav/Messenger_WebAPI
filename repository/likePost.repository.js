const LikePost = require('../models/LikePost');

const likePostRepository = {
    getLikesByPostIdAndIsLike: async (postId, like) => await LikePost.find({ postId, like }),

    getLikesByPostIdAndUserId: async (postId, userId) => await LikePost.findOne({ postId, userId }),

    deleteLikes: async (postId) => await LikePost.deleteMany({ postId }),

    updateLike: async (postId, userId, like) => {
        const likeNew = {
            $set: {
                date: Date.now(),
                like: like,
            }
        }

        return await LikePost.findOneAndUpdate({postId, userId}, likeNew)
    },

    addLike: async (postId, userId, like) => {
        const likeNew = new LikePost({
            postId,
            userId,
            date: Date.now(),
            like
        });

        return await likeNew.save();
    }
};


module.exports = likePostRepository