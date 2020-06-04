# About this repository

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/GoJrM/Node-API-Auth/issues)


As a junior Web Developper I really want to improve my understanding about Nodejs.
This repo is about sharing a sample on how I handled Authentication and Authorization for a basic Node Express API and only from the server side perspective. For this to work, I will use a JWT type authentication based on access and refresh Token using passport. 

This is for an educationnal purpose (mine include) and I'm aware that the development below is not production ready from many aspects. I will try to be as precise as I can but I might skip some steps in order to keep this topic as clean as possible.

# Overview 

[Getting started](#getting-started)

[Fast method](#fast-method)

[Step by step developement](#step-by-step-developement)

[Model](#model)

[Auth](#auth)

[Routes](#routes)

[Controllers](#controllers)

[Documentation](#documentation)

[Requests with Postman](#requests-with-postman)

[Contibute](#contribute)

[License](#license)

## Getting started
In order to get ready I will list every important dependencies/libraries for this particular feature to work.

I assume you already have nodejs installed on your computer.
If not you can get it Here: https://nodejs.org/en/

We will also use npm (installed alongside nodejs) as our "dependency manager" but you could use Yarn if you like.

To follow this sample you will need every lib/package listed below.
##### express: [![npm version](https://badge.fury.io/js/express.svg)](https://badge.fury.io/js/express)
One of the most famous nodejs framework as it is really easy to use (and I like express' router).
More infos here: https://expressjs.com/fr/

##### mongodb:
My favourite Nosql database. You work with Documents formatted like JSON. It's easy to use and very very efficiant.
More infos here: https://www.mongodb.com/fr

##### mongoose: [![npm version](https://badge.fury.io/js/mongoose.svg)](https://badge.fury.io/js/mongoose)
It's an ODM for mongodb. Basically ou work with "Schemas" for you data moddeling and it does a lot of heavy lifting for you. I'ts really easy to get access to your database and work with data. 
More infos here: https://mongoosejs.com/docs/ 

##### body-parser: [![npm version](https://badge.fury.io/js/body-parser.svg)](https://badge.fury.io/js/body-parser)
To easily parse the request body.
More infos here: https://www.npmjs.com/package/body-parser

##### bcryptjs: [![npm version](https://badge.fury.io/js/bcryptjs.svg)](https://badge.fury.io/js/bcryptjs)
One of the easiest and safe way to secure passwords before storing them to the database. I chose to use bcryptjs over bcrypt as it doesn't require additionnal dependancies and behave the same.

##### swagger-ui-express: [![npm version](https://badge.fury.io/js/swagger-ui-express.svg)](https://badge.fury.io/js/swagger-ui-express)
Simply an awesome tool to document and design your API based on OpenApi specifications,it also improves team communication. It can do a lot more but I will stick to this purpose for now. For this demo I will use swagger-express-ui. It is a community edition but it's updated more often than the official version and really easy to use.
More infos here: https://swagger.io/specification/

##### passport, passwort-jwt, passport-local: [![npm version](https://badge.fury.io/js/passport.svg)](https://badge.fury.io/js/passport) [![npm version](https://badge.fury.io/js/passport-jwt.svg)](https://badge.fury.io/js/passport-jwt) [![npm version](https://badge.fury.io/js/passport-local.svg)](https://badge.fury.io/js/passport-local) 
passport is an authentication middleware really easy to use with express. Basically you define some authentication strategies that you can use through your whole application. For this demo I will only use a local strategy (email+password) but you could use many more ( like Twitter, facebook with oauth...).
More infos here: http://www.passportjs.org/

##### dotenv: [![npm version](https://badge.fury.io/js/dotenv.svg)](https://badge.fury.io/js/dotenv)
Really usefull to set up environment variables as a configuration file (.env). By doing this we split sensitive data from our application code.
More infos here: https://www.npmjs.com/package/dotenv 

##### nodemon [![npm version](https://badge.fury.io/js/nodemon.svg)](https://badge.fury.io/js/nodemon)
nodemon automatically restarts your server every time you save a change. 
I added a little script to launch the server easily.

**./package.json**
```
{
    "name": "node-api-auth",
    "version": "1.0.0",
    "description": "Basic API Auth for an Express project with passport and JWT",
    "main": "app.js",
    "scripts": {
    "startDev": "nodemon app.js"
    },

```


## Fast method 
You can clone the whole repository.
You have to dowload every packages needed for the project to run. 
Open a terminal in the root of the project then run the command:

`npm install`

By doing this, npm will read the package.json file and pull every package it can find in "dependancies".
I intentionally skip the package installation procedure with npm or yarn because you can find this steps easily on the links above.

**This 2 steps are _mandatory_ if you want to clone and test the sample right away**

You will first have to create a .env file where you will store sensitive data (like MongoURI or passport secrets).
Next you have to connect to your favorite database. I will to do so by using a Mongodb cluster on mongodbatlas right [here](#https://www.mongodb.com/cloud/atlas). 
It is pretty straightforward to set up and create collections.
Once set up get yout mongoURI and store it in your .env file like so:

**./.env**
```
MONGO_URI = "mongodb+srv://{YOUR_USERNAME}:{YOUR_PASSWORD}@db-test-cluster-fn4re.mongodb.net/{YOUR_DATABASE}?retryWrites=true&w=majority"

```
*You can replace everything inside the curly braces with your credentials and mongodb collection name*

You also need to add 2 environment variables that will be needed to sign and verify json web tokens.

```
SECRET = "a very long, random and complicated string with mixted characters"
REFRESH_SECRET= "same idea, different string"

```

You can then type `npm run startDev` in a terminal to run the node server and connect to Mongodb cluster.

From now on the server will run on localhost:5000
You can now see the API documentation by typing the following url: 'localhost:5000/api-docs'.
You can now try different requests with Postman (more details about Postman at the end).
To stop the server You have to press `ctrl+c`.

## Step by step development
If you decided to follow the step by step guide, you have to install every dependancy by your own.
I suggest you clone the repository and delete everything except the package.json file and then type `npm install` to install every dependency right away. 
After creating your .env file and your mongodb cluster you can now create an app.js file in your root repository.
Let us keep it simple as much as possible, I'll just do the basic requirements for express, mongoose, body-parser and dotenv.
Then I connect to the mongodbatlas cluster with the mongoose `connect()` method.
Finally I define on which ports our API will handle requests.

**./app.js**

```javascript
// Connecting to mongodb
const db = process.env.MONGO_URI; 
mongoose
    .set('useUnifiedTopology', true)
    .connect(
        db,
        { 
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true
         }
    )
    .then(() => console.log("MongoDB succesfully connected"))
    .catch(err => console.log(err));

const port = process.env.PORT || 5000
app.listen (port, () => console.log ('Server up and running on port: ' +port+ '!'));

module.exports = app;

```

### Model
Now let us have a look on our data structure. For this feature I will only focus on the User model.

**./models/User.js**
```javascript

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({  
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    refreshToken: {
        type: String
    }
});

```
Mongoose allows you to structure your data by using `Schemas`. It is really easier to work with data when it is clearly structured, even more with Nosql databases. 
For the purpose of this feature, I will keep the User model really simple with only a few attributes (email, password and refreshtoken).

**./models/User.js**
```javascript

//using the pre() hook before any save
UserSchema.pre('save', function (next){  
    const user = this;
    if (this.isModified('password') || this.isNew){
        bcrypt.genSalt(10, function(err, salt){
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
      return next();
    }
});

UserSchema.methods.comparePassword = async function (password) { 
    const user = this; 
    const compare = await bcrypt.compare(password, user.password);
    return compare;
};
module.exports = mongoose.model('User', UserSchema);

```
I set a `pre()` hook for the mongoose `save()` method. It allows me to check if the document already exists everytime I want to save a user in db.
If it is new or modified the password is hashed using bcryptjs.

### Auth
It's time to take care about authentication strategies with passport.
I choosed to use a local and synchronous authentication strategy. First I Have to set up a secret that will be used for generating and verifying the tokens and refreshTokens.

**As an advice it is important to have a very long and random characters as secrets only known by the server.**
I already showed in a previous part how to create a .env file and how to store environment variables inside it.

**./auth/passport.js**
```javascript

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

```
I first require the jwt and passport dependancy needed to set my strategies up.
I followed the documentation on http://www.passportjs.org/ so feel free to do the same to understand every parameters I use.
*It is important to note that you can pass other attributes than email and password. You just have to set `passReqToCallback` to `true` to access the request body, this way you can add any attributes to your user object.*
This previous exemple illustrate the `signup strategy`.

**./auth/passport.js**
```javascript

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

```
Same logic for the login but we first check if the (unique) email from the user input already exists in db and then call the comparepassword() methods we created earlier.

```javascript

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

```
Basically this Jwt strategy automatically verifies and decode a token sent by a client in the request header.

### Routes
This directory will contain only authencation/authorization related endpoints.
None of these routes will be protected as you don't need to be logged In to sign Up or sign In. 

**./routes/authRoutes/authRoute.js**
```javascript

const passport=require('passport');
const authController = require('../../controllers/authController');

const router = require('express').Router();

router.post('/auth/signup',passport.authenticate('signup', {session : false}),authController.userSignUp); 
router.post('/auth/login', authController.userLogin);
router.post('/auth/token', authController.tokenController);

module.exports = router;

```
As you can see for the **/signup** endpoint I can call directly my `signup` strategy by passing it as second parameter, then the relevant controller which will handle the request and appropriate response.

When the Client access token expires, It can sends the refreshtoken in the request body so the tokenController can question the database about it and do the appropriate action. This prevents the Client to be forced to sign In every time it needs access to the API ressources.

**./routes/authRoutes/logoutRoute.js**
```javascript

const authController = require('../../controllers/authController');

const router = require('express').Router();

router.get('/auth/logout', authController.logUserOut);

module.exports = router;

```
The **/logout** endpoint differs from the others as it is a protected route. Indeed the user must first be logged In to log Out.

### Controllers
Let us have a look to our authControllers

**./controllers/authController.js**
```javascript

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
                const refreshToken = jwt.sign(body, refreshSecret,{expiresIn: 15});
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

```
The `userSignup` controller is pretty straitforward so I won't comment it (most of the logic being handled by our passport strategy).
Let us take a look on the `userLogin` controller.
I first begin to require and call our passport strategy for the login. If we don't encounter errors or user credentials missing, we call the passport `login()` method and sign both the token and refreshToken. I finally await to update the database with a new refreshToken (on every login).
** Note that I set accessToken expiration time to 200s and refreshToken expiration time to 1500s for this sample purpose **

**./controllers/authController.js**
```javascript

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

```
The **/token** endpoint will concern every Client which accesToken has expired. We don't want the user to always sign in when his accesToken expires (because the accessToken expiration is very short). 
The Client must to send his refreshToken so I can compare with the one stored in database (every user has its own refreshToken).
If it exists and is not expired, the server signs a new accesToken and send it to the Client. 
If the refreshToken expired, I erase it from the database and the user will have to sign in again to obtain both new acces and refreshToken.

**./controllers/authController.js**
```javascript

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

```
The `userLogout` controller is pretty easy to understand, it retrieve the accesToken by splitting the `authorization header` from the request and unset the user's refreshToken from the db.

**Warning there is one major drawback with this solution.**

When an accessToken is signed, there is no way to unsign it from the back-end side. So it is **mandatory** that the Client **ERASES** the accessToken when hitting the **/logout** endpoint. This is the only way to invalidate the accessToken. All I can do from this side is to erase the refreshToken from the database so the user has to sign in again.

### Documentation
I won't explain everything here has it would be an entire subject on its own. You can find every informations on the link above.
I can mention that I used openAPI specifications 2.0 because I learned that way but you can also use 3.0 (recommended).
For this part I will try a expose how I documented the API (really effective for team working). 
I used the `swagger-ui-express` library (it's a community library but really effective and well documented) and the `yamljs` library (to easily convert json to yaml because swagger-ui-express expects json files to work properly).

**./app.js**
```javascript

//to call our passport strategies
require('./auth/passport');
const authRoutes = require('./routes/authRoutes/authRoutes');
const authUserRoute = require('./routes/authRoutes/logoutRoute');

const swaggerUi= require('swagger-ui-express');

//To convert yaml to json (for usage of swaggerFile)
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');


const app = express();

```
*You can see here how to require your strategies with passport and how to use swagger-ui-express and yamljs.*
```javascript

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', authRoutes);

//secured route
app.use('api/v1', passport.authenticate('jwt', {session: false}), authUserRoute);

```
Basically the swagger-ui-express library will read the yaml file and generate a already formatted documentation based on tags.
This documentation will be accessible from the **/api-docs** endpoint.

I won't comment the swaggerDocument here as it is a yaml configuration file. You can find the whole documentation [here](#https://swagger.io/specification/).
Note that I use openAPI specifications 2.0.

### Requests with Postman
Postman is an amazing tool I won't describe as I'm sure everybody is familiar with it.
It allows you to easily send requests to your server and check how it behaves.
From now on everything seems to be set up let us type `npm run startDev` and check if everything works fine.

I will first check the API documentation to see how to formulate my requests with Postman.

![api-docs-01](https://user-images.githubusercontent.com/56259327/80973309-7d90e680-8e1f-11ea-9acc-4d5638331f49.png)

As you can see it is pretty easy to read and well organized too.
You can see really easily what what the server expects as request and what desired response he should return.

![api-docs-02](https://user-images.githubusercontent.com/56259327/80973565-d791ac00-8e1f-11ea-8c73-3b4682bec6b4.png)

For te purpose of this topic I will use only the attributes we need (email, password, access and refreshTokens). But I showed an exemple of what a basic **/user** endpoint can look like.

**auth/signup**
![postam-signup](https://user-images.githubusercontent.com/56259327/80973801-24758280-8e20-11ea-8213-e3048d7a1e76.png)

**auth/login**
![postman-login](https://user-images.githubusercontent.com/56259327/80984109-b89a1680-8e2d-11ea-917e-9acddd5486c2.png)
*You just need the email/password to get access, you're granted with your access/RefreshToken.*

**auth/token**
![postman-token](https://user-images.githubusercontent.com/56259327/80973960-5a1a6b80-8e20-11ea-8809-f6eae1f276ff.png)
All you have to do is pass the refreshToken in the request body to be granted with a new accessToken.

**auth/logout**
![postman-logout](https://user-images.githubusercontent.com/56259327/80973997-6b637800-8e20-11ea-888a-4edc84a6ca09.png)
Here you need to pass your accesToken in the authorization field as bearer Token. It is necessary for every protected route.

### Contribute

Feel free to contribute comment and help me improve. If you see some major issues or if I didn't properly use some tool, feel free to make me know. 'Pardon my french !' English is not my native tongue so don't be to rude with me if you see some approximations. 

### license

MIT