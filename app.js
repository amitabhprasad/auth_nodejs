const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();
//passport config
require('./config/passport')(passport);

const PORT = process.env.PORT || 5000;

//DB Config
const db = require('./config/keys').MongoURI;

// connect to Mongo
mongoose.connect(db,{ useNewUrlParser:true })
.then(()=>{
    console.log('MongoDB connected !!!');
})
.catch(err =>{
    console.log('ERROR occured ',err);
})
//EJS
app.use(expressLayouts);
app.set('view engine','ejs');

//bodyparser
app.use(express.urlencoded({extended:false}));
app.use(session({
  secret : 'secret',
  resave: true,
  saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
//connect flash
app.use(flash());

//Gloval vars
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})
//Route
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));
//login 
app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`)
});