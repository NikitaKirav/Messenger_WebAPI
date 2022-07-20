const Contact = require('../models/Contact');

const contactRepository = {
    updateContact: async (profileId, contactParams) => {
        const updateContacts = {
            $set: {
                github: contactParams.github,
                vk: contactParams.vk,
                facebook: contactParams.facebook,
                instagram: contactParams.instagram,
                twitter: contactParams.twitter,
                website: contactParams.website,
                youtube: contactParams.youtube,
                mainlink: contactParams.mainlink
            },
            };

        return await Contact.findOneAndUpdate({profileId}, updateContacts);
    },

    addContact: async (profileId) => {
        const contact = new Contact({ profileId });
        return await contact.save();
    },

    getContactByProfileId: async (profileId) => await Contact.findOne({ profileId })
};


module.exports = contactRepository