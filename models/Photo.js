const { Schema, model, Types } = require('mongoose');

const ProfileSchema = new Schema({
    profileId: { type: Types.ObjectId, ref: 'Profile', unique: true},
    small: { type: String, default: '' },
    large: { type: String, default: '' }
});

module.exports = model('Photo', ProfileSchema);