const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;  
const ExtractJwt = require('passport-jwt').ExtractJwt; 
const User = require('../models/User');

const secret = process.env.SECRET;


// Sign Up
exports = passport.use('signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,email, password, done) => {
    try {        
        const userFields = { 
        email,
        password        
        };
        const user = await User.create(userFields);
        console.log("user successfully created");
        return done (null, user);
    } catch (error){    
        done (error);
    }
}));

// Login
exports = passport.use ('login', new localStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback: true
}, async (req,email, password, done) => {
    try{
        // Find the user in db according to user input
        const user = await User.findOne({ email });
        if (!user){
            console.log('user not found');
            return done (null, false);
        }        
        //validate password and make sure if it maches the one in db            
        const validate = await user.comparePassword(password);
        if (!validate){
        return done(null, false);
        }
        return done (null,user);
    } catch (error) {
        done (error);
    }
}));
 
// token validation stategy
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secret;

exports = passport.use('jwt', new JwtStrategy (opts, async (token, done) => { 
    try {
    console.log('User authenticated')
    return done(null,token);
    
    } catch (error) {
        done(error);
    }
}));