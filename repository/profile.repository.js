const Profile = require('../models/Profile');

const profileRepository = {
    getProfiles: async () => await Profile.find(),

    getProfileByUserId: async (userId) => await Profile.findOne({ userId }),

    updateProfile: async (userId, profileParams) => {
        const updateProfile = {
            $set: {
                userId: userId,
                aboutMe: profileParams.aboutMe,
                lookingForAJob: profileParams.lookingForAJob,
                lookingForAJobDescription: profileParams.lookingForAJobDescription,
                fullName: profileParams.fullName,
            },
        };

        return await Profile.findOneAndUpdate({userId}, updateProfile);
    },

    addProfile: async (userId, fullName) => {
        const profile = new Profile({userId, fullName});
        return await profile.save();
    }
};


module.exports = profileRepository