const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport');

//User
const User = require('../models/User');
const {ensureAuthenticated} = require('../config/auth');
const {auth} = require('../config/auth');

router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/register',(req,res)=>{
    res.render('register');
});


//Register handler

router.post('/register',(req,res)=>{
   const {name,email,password,password2} = req.body;
   let errors = [];

   //check required fields
   if(!name||!email||!password||!password2){
    errors.push({msg:'please fill in all fields'});
   }

   //check password match
   if(password !== password2){
       errors.push({msg: 'password do not match'});
   }
   //check password match
   if(password.length<6){
    errors.push({msg: 'password should be atleast 6 characters'});
   }
   if(errors.length>0){
     res.render('register',{
        errors,
        name,
        email,
        password,
        password2
     })
   }else{
       // Validation passed
       User.findOne({email:email})
       .then((user)=>{
            if(user){
                //user exists
                errors.push({msg: 'User with email is already registered'});
                res.render('register',{
                    errors,
                    name,
                    email,
                    password,
                    password2
                 })
            }
            else{
                const newUser = new User ({
                    name,
                    email,
                    password
                });
                //Hash password
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                        if(err){
                            throw err;
                        }
                        newUser.password = hash;
                        //save user
                        newUser.save()
                        .then(user=>{
                            req.flash('success_msg','You are registered, please login');
                            res.redirect('/users/login');
                        })
                        .catch(err=>{
                            console.log(err);
                        })
                    })
                })
            }
       })

       ;
   }
});

//Login handle
router.post('/login',(req,res,next)=>{
    //console.log(req);
    //body: { email: 'test@abc.com', password: '123456' },
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
});

router.post('/api/authenticate',auth.optional,(req,res,next)=>{
    
    const { body } = req;
    
    if(!body.email) {
        return res.status(422).json({
          errors: {email: 'is required',},
        });
      }

    if(!body.password) {
        return res.status(422).json({
          errors: {password: 'is required',},
        });
      }
    return passport.authenticate('local',{session:false},(err,passportUser,info)=>{
        if (err) return next(err);
        if(passportUser){
            const user = passportUser;
            user.token = passportUser.generateJWT();
            return res.json({ user: user.toAuthJSON() });
        }
        return status(400).info;
    })(req, res, next);
});

//Logout handle
router.get('/logout',ensureAuthenticated,(req,res)=>{
   req.logOut();
   req.flash('success_msg','You are log out');
   res.redirect('/users/login');
});
module.exports = router;
