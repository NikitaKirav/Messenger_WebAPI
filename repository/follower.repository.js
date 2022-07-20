const Follower = require('../models/Follower');

const followerRepository = {
    getFollowerByIdAndUserId: async (followerId, userId) => await Follower.findOne({ followerId, userId }),

    saveFollower: async (followerId, userId) => {
        const newFollower = new Follower({
            userId,
            followerId
        });

        await newFollower.save();
    },
    
    deleteFollower: async (followerId, userId) => { await Follower.deleteOne({ userId, followerId }) }
};


module.exports = followerRepository