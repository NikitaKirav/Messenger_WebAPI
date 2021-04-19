const { Schema, model, Types } = require('mongoose');

const LikePostSchema = new Schema({
    postId: { type: Types.ObjectId, ref: 'Post'},
    userId: { type: Types.ObjectId, ref: 'User'},
    date: { type: Date, default: Date.now() },
    like: { type: Boolean, default: false },
});

module.exports = model('LikePost', LikePostSchema);