const User = require('../models/User');

const userRepository = {
    getUserById: async (userId) => await User.findById(userId),
    getUserByEmail: async (email) => await User.findOne({ email }),
    addUser: async (email, password) => {
        const user = new User({email, password});
        return await user.save();
    }
};


module.exports = userRepository