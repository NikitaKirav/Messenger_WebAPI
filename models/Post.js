const { Schema, model, Types } = require('mongoose');

const PostSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User'},
    profileId: { type: Types.ObjectId, ref: 'Profile'},
    createDate: { type: Date, default: Date.now() },
    text: { type: String, default: '' },
});

module.exports = model('Post', PostSchema);