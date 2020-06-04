require('../auth/passport');
const User = require('../models/User')
const passport = require ('passport');
const secret = process.env.SECRET;
const refreshSecret = process.env.REFRESH_SECRET;
const jwt = require('jsonwebtoken');


//sign Up
exports.userSignUp = (req, res, next)=> {
    res.status(200).json({
        message : 'user created successfully',
        user: req.user            
    });   
}

//Login
exports.userLogin = async (req, res, next) => {
    passport.authenticate('login', async (err, user) => {
        try {
            if (err || !user){
                const error = new Error (passport.message)
                return next (error);
            }
            req.login(user, {session : false} , async (error) => {
                if (error) return next (error)
                //never store sensitive data in the token, so I choose only email and id here
                const body = {_id: user._id, email : user.email};
                //sign the JWT token and populate the payload with user email/id
                const token = jwt.sign(body, secret,{expiresIn: 200});
                const refreshToken = jwt.sign(body, refreshSecret,{expiresIn: 1500});
                const filter = {_id: user._id};
                const update = {refreshToken: refreshToken};

                await User.findOneAndUpdate(filter, update, {new: true});
                return res.status(200).json({
                    accestoken: token,
                    refreshToken : refreshToken
                })
            });
        } catch (error) {
            return next (error);
        }
    }) (req, res, next);
}

//refreshTokenlogic
exports.tokenController = async (req, res)=> {    
    const userToken = req.body.refreshToken
    if(userToken == null){
        return res.sendStatus(401);
    }
    else {
        await User.findOne({refreshToken: userToken}, async (err, doc )=> {
            try {
                if (err){
                    console.log(err)
                    return res.sendStatus(403);
                }
                else if (!doc) {
                    console.log('refreshToken doesn\'t exists')
                    return res.sendStatus(403);
                } else {
                    const refreshtoken = doc.refreshToken                
                    jwt.verify (refreshtoken, refreshSecret, async (er, user) => {
                        if (er) {
                            await User.findOneAndUpdate({refreshToken: userToken}, {$unset: {refreshToken: ""}},{new: true}) 
                  
                            return res.status(401).json({
                                error : "Your refresh token has expired, please sign in again" 
                            });                                                                        
                        } else {
                            const body = {_id: user._id, email : user.email}
                            const accesToken = generateAccesToken(body)
                            res.json({accesToken: accesToken})
                        }                                      
                    })  
                }                
            } catch (error) {
                console.log (error);
            }
        })            
    }     
}

//Logout 
exports.logUserOut = async (req, res) => {
    let userID = ""
    const authHeader = req.headers['authorization']
    const token = authHeader.split(' ')[1]
    jwt.verify(token, secret, async (err, user)=>{
        console.log(user)
        userID = user._id
    })
    await User.findByIdAndUpdate({_id: userID}, {$unset:{refreshToken: ""}},{new: true}, (err, doc) => {
        if(err){
            return res.sendStatus(500)
        }
        else{
            return res.status(200).json({
                message: "logout Complete",
            })
        }
    })    
} 


function generateAccesToken(user){
    return jwt.sign(user, secret, {expiresIn: 3600})
}

