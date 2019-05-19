const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth')
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

module.exports = router;