const Post = require('../models/Post');

const postRepository = {
    getPostByProfileId: async (profileId) => await Post.find({ profileId }),
    
    addPost: async (userId, text, profileId) => {
        const post = new Post({userId, createDate: Date.now(), text, profileId});
        return await post.save();
    },

    deletePost: async (postId, profileId) => await Post.deleteOne({_id: postId, profileId})
};


module.exports = postRepository