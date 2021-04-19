const { Router } = require('express');
const Profile = require('../models/Profile');
var path = require('path');
const { ResultCode } = require('./routes');
const Contact = require('../models/Contact');
const Status = require('../models/Status');
const Photo = require('../models/Photo');
const auth = require('../middleware/auth.middleware');
const router = Router();
const config = require('config');
const multer  = require("multer");
const sharp = require('sharp');
const {unlink, access} = require('fs');

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) =>{
      cb(null, "uploads");
  },
  filename: (req, file, cb) =>{
      cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  
  if(file.mimetype === "image/png" || 
  file.mimetype === "image/jpg"|| 
  file.mimetype === "image/jpeg"){
      cb(null, true);
  }
  else{
      cb(null, false);
  }
}

const upload = multer({storage:storageConfig, fileFilter: fileFilter});

/*router.get('/', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.userId });
        const contacts = await Contact.findOne({ profileId: profile.id });
        const photos = await Photo.findOne({ profileId: profile.id });
        res.json({
            resultCode: ResultCode.Success,
            data: {...profile, contacts, photos}
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});*/


router.put('/', auth, async (req, res) => {
    try {
        const userProfile = await Profile.find({ userId: req.user.userId });

        if(userProfile) {
            const profileParams = req.body;

          const updateProfile = {
            $set: {
                userId: req.user.userId,
                aboutMe: profileParams.aboutMe,
                lookingForAJob: profileParams.lookingForAJob,
                lookingForAJobDescription: profileParams.lookingForAJobDescription,
                fullName: profileParams.fullName,
            },
            };

            const resultProfile = await Profile.findOneAndUpdate({userId: req.user.userId}, updateProfile);

            const updateContacts = {
                $set: {
                    github: profileParams.contacts.github,
                    vk: profileParams.contacts.vk,
                    facebook: profileParams.contacts.facebook,
                    instagram: profileParams.contacts.instagram,
                    twitter: profileParams.contacts.twitter,
                    website: profileParams.contacts.website,
                    youtube: profileParams.contacts.youtube,
                    mainlink: profileParams.contacts.mainlink
                },
                };
    
            const resultContacts = await Contact.findOneAndUpdate({profileId: resultProfile.id}, updateContacts);

            res.json({
                resultCode: ResultCode.Success,
                data: resultProfile
            });
        } else {
            return res.status(400).json({ message: `You can't correct this profile!`, resultCode: 1});
        }

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});


router.get('/status/:userId', async (req, res) => {
    try {
        const result = await Status.findOne({ userId: req.params.userId });
        res.json({
            resultCode: ResultCode.Success,
            data: {
                status: result ? result.status : ''
            }
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

router.put('/status', auth, async (req, res) => {
    try {
        const status = await Status.findOne({ userId: req.user.userId });
        const statusParams = req.body;

        if(status) {            
            const updateStatus = {
                $set: {
                    status: statusParams.status
                },
                };

            const resultContacts = await Status.findOneAndUpdate({userId: req.user.userId}, updateStatus);

            res.json({
                resultCode: ResultCode.Success,
                data: {
                    status: statusParams.status
                }
            });
        } else {

            const status = new Status({userId: req.user.userId, status: statusParams.status});
            const newStatus = await status.save();

            res.json({
                resultCode: ResultCode.Success,
                data: {
                    status: statusParams.status
                }
            });
        }

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.params.userId });
        const contacts = await Contact.findOne({ profileId: profile.id });
        const photos = await Photo.findOne({ profileId: profile.id });
        res.json({
            resultCode: ResultCode.Success,
            data: {
                id: profile.id,
                userId: profile.userId, 
                aboutMe: profile.aboutMe,
                lookingForAJob: profile.lookingForAJob,
                lookingForAJobDescription: profile.lookingForAJobDescription,
                fullName: profile.fullName,
                contacts: {
                    github: contacts.github,
                    vk: contacts.vk,
                    facebook: contacts.facebook,
                    instagram: contacts.instagram,
                    twitter: contacts.twitter,
                    website: contacts.website,
                    youtube: contacts.youtube,
                    mainlink: contacts.mainlink
                }, 
                photos
            }
        });

    } catch(e) {
        res.status(500).json({ message: 'Something went wrong' })
    }
});


router.put("/photo", auth, upload.single("file"), async (req, res, next) => {
   
    let formData = req.file;
    console.log(formData);

    await sharp(formData.path)
        .resize(64,64)
        .toFile(path.resolve(req.file.destination,'mini-' + formData.filename), function(err) {
        });

    // Get old photos and delete their
    const profile = await Profile.findOne({ userId: req.user.userId });
    const photosOld = await Photo.findOne({ profileId: profile.id });

    const pathLarge = /\/uploads([^\s]+(?=\.(jpg|gif|png))\.\2)/g.exec(photosOld.large);
    const pathSmall = /\/uploads([^\s]+(?=\.(jpg|gif|png))\.\2)/g.exec(photosOld.small);
    deleteFile(pathLarge);
    deleteFile(pathSmall);
    

    if(!formData)
        res.send("Error");
    else {
        if (profile) {

            const updatePhoto = {
                $set: {
                    large: `${config.get("baseUrl")}/uploads/${formData.filename}`,
                    small: `${config.get("baseUrl")}/uploads/mini-${formData.filename}`
                },
                };

            await Photo.findOneAndUpdate({profileId: profile.id}, updatePhoto);

        }
        const photos = await Photo.findOne({ profileId: profile.id });
        res.json({
            resultCode: ResultCode.Success,
            data: {                
                photos
            }
        });
    }
});

const deleteFile = (imagePath) => {
    if (imagePath && imagePath.length) {
        let newPath = path.join(__dirname, '../', imagePath[0]);
        access(newPath, function(error){
            if (error) {
                console.log("File don't exist");
            } else {
                unlink(newPath, (err) => {
                    if (err) throw err;
                    console.log(imagePath[0] + ' was deleted');
                });
            }
        });
    }
}

module.exports = router;