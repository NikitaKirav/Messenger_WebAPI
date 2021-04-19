const { Schema, model, Types } = require('mongoose');

const StatusSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User'},
    status: { type: String, default: '' },
});

module.exports = model('Status', StatusSchema);