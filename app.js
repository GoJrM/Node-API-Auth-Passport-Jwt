require('dotenv').config()
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport=require('passport');

//to call our passport strategies
require('./auth/passport');
const authRoutes = require('./routes/authRoutes/authRoutes');
const authUserRoute = require('./routes/authRoutes/logoutRoute');

const swaggerUi= require('swagger-ui-express');

//To convert yaml to json (for usage of swaggerFile)
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');


const app = express();

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );
app.use(bodyParser.json());

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', authRoutes);

//secured route
app.use('/api/v1', passport.authenticate('jwt', {session: false}), authUserRoute);
    
const port = process.env.PORT || 5000
app.listen (port, () => console.log ('Server up and running on port: ' +port+ '!'));

module.exports = app;