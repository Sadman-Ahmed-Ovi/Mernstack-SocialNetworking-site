const express = require('express');
const gravatar = require('gravatar');
const router = express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config');
const { check,validationResult}=require('express-validator/check')

router.post('/',[
    check('name','Name is required').not().notEmpty(),
    check('email','include a valid email').isEmail(),
    check('password','6 or more characters').isLength({min:6})
] ,async (req, res) => {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    };
    const {name,email,password}=req.body;
    const User=require('../../models/User');
    try{
        let user=await User.findOne({email});

        if(user){
           return res.status(400).json({error:[{msg:'already exists'}]})
        }
        const avatar=gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })
        user=new User({
            name,
            email,
            avatar,
            password,
        })

        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);

        await user.save();

        const payload={
            user:{
                id:user.id
            }
        };

        jwt.sign(payload,config.get('jwtSecret'),{expiresIn:36000},
        (err,token)=>{
            if(err) throw err;
            res.json({token})
        })
    }catch(err){
        console.error(err.message);
        res.status(500).send('error happened')
    }



    
},

);

module.exports = router;