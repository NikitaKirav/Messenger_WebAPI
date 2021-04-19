const { Router } = require('express');
const Profile = require('../models/Profile');
const { ResultCode } = require('./routes');
const Photo = require('../models/Photo');
const Follower = require('../models/Follower');
const auth = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = Router();

router.get('/', async (req, res) => {
    try {

        let userId = '';
        const token = req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"

        if(token) {
            const secret = process.env.MESSANGER_JWT_SECRET;
            const decoded = jwt.verify(token, secret, {ignoreExpiration: true} );
            const user = decoded;
            userId = user.userId;
        }

        const profiles = await Profile.find();

        let profileList = {
            totalCount: userId === '' ? profiles.length : profiles.length-1,
            items: []
        };
        for(let i=0; i < profiles.length; i++) {
            const profileUserId = await User.findById(profiles[i].userId);
            if (profileUserId.id !== userId) {
                const photos = await Photo.findOne({ profileId: profiles[i].id });
                const follower = userId === '' ? null : await Follower.findOne({followerId: profiles[i].userId, userId});
                profileList.items.push({
                    id: profiles[i].userId,
                    name: profiles[i].fullName,
                    photos: {small: photos.small, large: photos.large},
                    followed: follower ? true : false
                });
            }
        }

        res.json({
            resultCode: ResultCode.Success,
            data: {...profileList}
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

router.get('/:userId', async (req, res) => {
    try {

        let ownerId = '';
        let follower = null;
        const token = req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"

        if(token) {
            const secret = process.env.MESSANGER_JWT_SECRET;
            const decoded = jwt.verify(token, secret, {ignoreExpiration: true} );
            const user = decoded;
            ownerId = user.userId;
        }
        if (ownerId !== '') {
            follower = await Follower.findOne({followerId: req.params.userId, userId: ownerId});
        }

        res.json({
            resultCode: ResultCode.Success,
            data: {
                followed: follower ? true : false
            }
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

router.post('/follow/:followerId', auth, async (req, res) => {
    try {
        const newFollower = new Follower({
            userId: req.user.userId,
            followerId: req.params.followerId
        });

        await newFollower.save();

        res.json({
            resultCode: ResultCode.Success
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

router.delete('/follow/:followerId', auth, async (req, res) => {
    try {
        const result = await Follower.deleteOne({userId: req.user.userId, followerId: req.params.followerId})

        res.json({
            resultCode: ResultCode.Success
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

module.exports = router;