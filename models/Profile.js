const { Schema, model, Types } = require('mongoose');

const ProfileSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User'},
    aboutMe: { type: String, default: '' },
    lookingForAJob: { type: Boolean, default: false },
    lookingForAJobDescription: { type: String, default: '' },
    fullName: { type: String, default: '' },
    contacts: { type: Types.ObjectId, ref: 'Contact'},
    photos: { type: Types.ObjectId, ref: 'Photo'}
});

module.exports = model('Profile', ProfileSchema);