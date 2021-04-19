const { Schema, model } = require('mongoose');

const Message = Schema({
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    text: { type: String, default: '' },
    createDate: { type: Date, default: Date.now() },
    updateDate: { type: Date, default: Date.now() },
    fromPhoto: { type: String, default: '' }
});

module.exports = model('Message', Message);