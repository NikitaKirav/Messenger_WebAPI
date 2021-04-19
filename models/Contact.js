const { Schema, model, Types } = require('mongoose');

const ProfileSchema = new Schema({
    profileId: { type: Types.ObjectId, ref: 'Profile', unique: true},
    github: { type: String, default: '' },
    vk: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
    youtube: { type: String, default: '' },
    mainlink: { type: String, default: '' },
});

module.exports = model('Contact', ProfileSchema);