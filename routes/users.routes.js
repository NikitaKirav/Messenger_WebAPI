const { Router } = require('express');
const { ResultCode } = require('./routes');
const auth = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const router = Router();
const userRepository = require('../repository/user.repository');
const profileRepository = require('../repository/profile.repository');
const photoRepository = require('../repository/photo.repository');
const followerRepository = require('../repository/follower.repository');


router.get('/', async (req, res) => {
    try {

        let userId = '';
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"

        if(token && token !== '{}') {
            const secret = process.env.MESSANGER_JWT_SECRET;
            const decoded = jwt.verify(token, secret, {ignoreExpiration: true} );
            const user = decoded;
            userId = user.userId;
        }

        const profiles = await profileRepository.getProfiles(); 

        let profileList = {
            totalCount: userId === '' ? profiles.length : profiles.length-1,
            items: []
        };
        for(let i=0; i < profiles.length; i++) {
            const profileUserId = await userRepository.getUserById(profiles[i].userId); 
            if (profileUserId.id !== userId) {
                const photos = await photoRepository.getPhotoByProfileId(profiles[i].id);
                const follower = userId === '' ? null : await followerRepository.getFollowerByIdAndUserId(profiles[i].userId, userId);
                profileList.items.push({
                    id: profiles[i].userId,
                    name: profiles[i].fullName,
                    photos: {small: photos.small ?? '', large: photos.large ?? ''},
                    followed: follower ? true : false
                });
            }
        }

        res.json({
            resultCode: ResultCode.Success,
            data: {...profileList}
        });

    } catch(e) {
        console.log(e.message);
        res.status(500).json({ message: 'Something went wrong' })
    }
});

router.get('/:userId', async (req, res, next) => {
    try {

        let ownerId = '';
        let follower = null;
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"

        if(token && token !== '{}') {
            const secret = process.env.MESSANGER_JWT_SECRET;
            const decoded = jwt.verify(token, secret, {ignoreExpiration: true} );
            const user = decoded;
            ownerId = user.userId;
        }
        if (ownerId !== '') {
            follower = await followerRepository.getFollowerByIdAndUserId(req.params.userId, ownerId);

            /*if(!follower) {
                return next(createError(404, "Not found"));
            }*/
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
        await followerRepository.saveFollower(req.params.followerId, req.user.userId);

        res.json({
            resultCode: ResultCode.Success
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

router.delete('/follow/:followerId', auth, async (req, res) => {
    try {
        await followerRepository.deleteFollower(req.params.followerId, req.user.userId);

        res.json({
            resultCode: ResultCode.Success
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

module.exports = router;