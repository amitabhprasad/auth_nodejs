const express = require('express');
const router = express.Router();

const User = require('../models/User');
const {ensureAuthenticated} = require('../config/auth')
const {auth} = require('../config/auth');
router.get('/',(req,res)=>{
    //res.send('Welcome page');
    res.render('welcome')
});

router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    //res.send('Welcome page');
    res.render('dashboard',{
        user:req.user
    });
})

//GET current route (required, only authenticated users have access)
router.get('/api/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
  
    return User.findById(id)
      .then((user) => {
        if(!user) {
          return res.sendStatus(400);
        }
        return res.json({ user: user.toAuthJSON() });
      })
      .catch(err =>{
        console.log('ERROR occured ',err);
        return res.sendStatus(400);
    });
  });

module.exports = router;