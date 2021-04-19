const { Schema, model, Types } = require('mongoose');

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profiles: { type: Types.ObjectId, ref: 'Profile' },
    createDate: { type: Date, default: Date.now() },
});

module.exports = model('User', UserSchema);
