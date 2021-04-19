const { Schema, model, Types } = require('mongoose');

const FollowerSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User'},
    followerId: { type: Types.ObjectId, ref: 'User' }
});

module.exports = model('Follower', FollowerSchema);