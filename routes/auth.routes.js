const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const { ResultCode } = require('./routes');
const userRepository = require('../repository/user.repository');
const profileRepository = require('../repository/profile.repository');
const contactRepository = require('../repository/contact.repository');
const photoRepository = require('../repository/photo.repository');
const router = express.Router();

// /api/auth/me
router.get(
    '/me', 
    async (req, res) => {
    try {

        res.json({ message: 'Ok' });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

// /api/auth/register
router.post(
    '/register', 
    [
        check('email', 'Invalid email address').isEmail(),
        check('password', 'The minimum password length is 6 characters').isLength({min: 6}),
        check('userName', 'The minimum name length is 3 characters').isLength({min: 3})
    ], 
    async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.array(),
                message: 'Invalid registration data',
                resultCode: ResultCode.Error
            })
        }

        const {email, password, userName} = req.body;

        const candidate = await userRepository.getUserByEmail(email);

        if(candidate) {
            return res.status(400).json({ message: 'This user already exists!', resultCode: 1})
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        // Add a new user in database
        const newUser = await userRepository.addUser(email, hashedPassword); 

        // When we create a new user we require his profile(we can't have a user without a profile)
        // Add his profile in database
        const newProfile = await profileRepository.addProfile(newUser.id, userName); 
        // Add his contact in database
        await contactRepository.addContact(newProfile.id); 
        // Add his photo in database
        await photoRepository.addPhoto(newProfile.id); 


        res.status(201).json({message: 'Thanks for registration. User was added!', resultCode: 0});

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong', resultCode: 1 })
    }
});

// /api/auth/login
router.post(
    '/login', 
    [
        check('email', 'Invalid email address').isEmail(),
        check('password', 'Enter a password').exists()
    ],
    async (req, res) => {
    try {

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.array(),
                message: 'Invalid login data', 
                resultCode: 1
            })
        }

        const {email, password} = req.body;

        const user = await userRepository.getUserByEmail(email); 
        const profile = await profileRepository.getProfileByUserId(user.id);

        if(!user) {
            return res.status(200).json({ message: 'Invalid password or email, try again!', resultCode: 1 });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(200).json({ message: 'Invalid password or email, try again!', resultCode: 1 });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.MESSANGER_JWT_SECRET,
            { expiresIn: '360d' }
        );

        res.json({ data: { token, userId: user.id, userName: profile.fullName}, resultCode: 0 });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong', resultCode: 1 })
    }
});

module.exports = router;