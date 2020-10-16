const express = require('express');
const router = express.Router();
const request=require('request');
const config = require("config");
const auth=require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require("../../models/Post");
const { check, validationResult } = require('express-validator/check');
const { response } = require('express');
//get logged in profile
router.get('/me',auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            
            return res.status(404).json({msg:'no profile'});
        }
        res.json(profile);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('error happened')
    }
});

//create or update profile

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
]],async (req,res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        };

        const {
            
                
                company,
                website,
                bio,
                status,
                githubusername,
                location,
                skills,
                youtube,
                facebook,
                twitter,
                instagram,
                linkedin
        }=req.body;

        const profileFields={};
        profileFields.user=req.user.id;
        if(company)profileFields.company=company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio= bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername= githubusername;
        if(skills){
            profileFields.skills=skills.split(',').map(skill=>skill.trim());

            
        };
        profileFields.social={};
        if(youtube)profileFields.social.youtube=youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin= linkedin;
        try{
           let profile=await Profile.findOne({user:req.user.id});

            if (profile) {
                // Update
                profile=await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile)
            };

            //create profile
            profile=new Profile(profileFields);

            await profile.save();
            res.json(profile)
        }catch(err){
            console.error(err.message);
            res.status(500).send('error happened')
        }
})

//get all profiles

router.get('/',async (req,res)=>{
    try{
        const profiles = await Profile.find()
            .populate('user', ['name', 'avatar']);

            res.json(profiles);
    }catch(err){
        console.error(err.message);
        res.status(500).send('error happened')
    }
});


//get  profile by id

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user:req.params.user_id})
            .populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({msg:"no profile"})
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});

//delete  profile

router.delete('/',auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({user:req.user.id})
        await Post.deleteMany({ user: req.user.id });  
        await User.findByIdAndRemove({_id:req.user.id})
        res.json({msg:"deleted"});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});

//update ex

router.put('/experience', [auth, [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty(),
]],async (req,res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        };

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        }=req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        try{
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile)
        }catch(err){
            console.error(err.message);
            res.status(500).send('error happened')
        }


});

//delete experience

router.delete('/experience/:exp_id',auth,async (req,res)=>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});
//update education
router.put('/education', [auth, [
    check('school', 'title is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'field is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    };

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }


});

//delete edu

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        await profile.save();
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('error happened')
    }
});

router.get('/github/:username',(req,res)=>{
    try{
         const options = {
           uri: `https://api.github.com/users/${
             req.params.username
           }/repos?per_page=5&sort=created:asc&client_id=${config.get(
             "githubClientId"
           )}&client_secret=${config.get("githubSecret")}`,
           method:'GET',
           headers:{ 'user-agent':'node.js'}
         };

         request(options,(error,response,body)=>{
             if(error)console.error(error)
             if(response.statusCode !==200){
                 res.status(404).json({msg:"No github profile found"})
             }

             res.json(JSON.parse(body))

             
         })
    }catch(err){
        console.error(err.message);
        res.status(500).send("server error");
    }
})



module.exports = router;