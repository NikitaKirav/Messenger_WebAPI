const Status = require('../models/Status');

const statusRepository = {
    getStatusByUserId: async (userId) => await Status.findOne({ userId }),

    updateStatus: async (userId, statusText) => {
        const updateStatus = {
            $set: {
                status: statusText
            },
            };

        return await Status.findOneAndUpdate({userId}, updateStatus);
    },

    addStatus: async (userId, statusText) => {
        const status = new Status({userId, status: statusText});
        return await status.save();
    }
};


module.exports = statusRepository