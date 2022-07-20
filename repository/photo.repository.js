const Photo = require('../models/Photo');

const photoRepository = {
    getPhotoByProfileId: async (profileId) => await Photo.findOne({ profileId }),

    addPhoto: async (profileId) => {
        const photo = new Photo({ profileId });
        return await photo.save();
    }
};


module.exports = photoRepository