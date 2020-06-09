require('../auth/passport');
const User = require('../models/User')
const passport = require ('passport');
const secret = process.env.SECRET;
const refreshSecret = process.env.REFRESH_SECRET;
const jwt = require('jsonwebtoken');

const token_Exp= 200;

//sign Up
exports.userSignUp = (req, res, next)=> {    
    return res.status(200).json({
        message : req.message,
        user: req.user            
    });   
}

//Login
exports.userLogin = async (req, res, next) => {
    passport.authenticate('login', async (err, user) => {
        try {
            if (err || !user){
                console.log(err);
                return res.status(423).json({
                    error: 'server error',
                    message: 'Oups the password or the email might be wrong'
                })
            }
            await req.login(user, { session : false } , async (error) => {
                if (error) {
                    return next (error)
                } else {
                    const body = { _id: user._id, email : user.email };                                    
                    const token = await jwt.sign(body, secret,{expiresIn: token_Exp});
                    const expirationTime = Math.floor(Date.now() / 1000) + token_Exp;
                    const refreshToken = jwt.sign(body, refreshSecret,{expiresIn: 30});
                    const filter = {_id: user._id};
                    const update = {refreshToken: refreshToken};                  
                    const updated = await User.findOneAndUpdate(filter, update, { new: true });
                    if (updated) { 
                        return res.status(200).json({
                            message : 'User authenticated',
                            accesToken: token,
                            expiresIn:  expirationTime,
                            created: new Date(),
                            refreshToken : refreshToken
                        })
                    }
                        
                }                
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
        const user = await User.findOne({refreshToken: userToken})
        try {
            if (!user){
                return res.sendStatus(403).json({
                    message : 'User not found'
                });
            } else {
                const refreshtoken = user.refreshToken                
                await jwt.verify (refreshtoken, refreshSecret, async (err, user) => {
                    if (err) {
                        await User.findOneAndUpdate({refreshToken: userToken}, {$unset: {refreshToken: ""}},{new: true}) 
                
                        return res.status(401).json({
                            error : "Your refresh token has expired, please sign in again" 
                        });                                                                        
                    } else {
                        const body = {_id: user._id, email : user.email}                        
                        const expires_In = Math.floor(Date.now() / 1000) + token_Exp;                      
                        const accesToken = await generateAccesToken(body , token_Exp)
                        return res.status(200).json({
                            accesToken: accesToken,
                            expires_In: expires_In,
                            created : new Date()
                        })
                    }                                      
                })  
            }                
        } catch (error) {
            console.log (error);
        }
                   
    }     
}

//Logout 
exports.logUserOut = async (req, res) => {
    const authHeader = req.headers['authorization']
    const accesToken = authHeader.split(' ')[1]
    try {
        await jwt.verify(accesToken, secret, async (error, user) => {
            if (error) {
                return res.status(401).json({              
                    message : 'AccessToken expired'
                })
            } else {
                const userId = user._id
                await User.findByIdAndUpdate({_id: userId}, {$unset:{refresh_token: ""}}, async (er, doc) => {
                    if (doc){
                        console.log(doc)
                        return res.status(200).json({                    
                            message : 'User successfully logged out'
                        })
                    }
                })
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json ({          
            error: 'Server Error'
        })
    }
};


function generateAccesToken(user,token_Exp) {
    return jwt.sign(user, secret, {expiresIn: token_Exp})
}

