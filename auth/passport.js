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
}, async (req, email, password, done) => {
        try {        
            const userInputs = { 
            email,
            password        
            };
            const userExists = await User.findOne( { email: email } )
            if (userExists) {        
                return done (null, false, { message: 'The email already exists'});
            } else {
                const user = await User.create(userInputs);
                console.log("user successfully created");
                return done (null, user, { message : 'User successfully created'});
            }            
        } catch (err) { 
            console.log(err)   
            return done (err);
        }
    }));

// Login
exports = passport.use ('login', new localStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback: true
}, async (req,email, password, done) => {
    try{        
        const user = await User.findOne({ email });
        if (!user){
            console.log('user not found');
            return done (null, false);
        }                        
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

exports = passport.use('jwt', new JwtStrategy (opts, async (payload, done) => { 
    try {
        const user = await  User.findById({ _id : payload._id})
        if (!user){
            return done(null, false)
        } else {
            return done(null,payload);
        }    
    } catch (err) {
        return done(err, false);
    }
}));