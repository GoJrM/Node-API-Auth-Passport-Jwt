const passport=require('passport');
const authController = require('../../controllers/authController');


const router = require('express').Router();

router.post('/auth/signup',passport.authenticate('signup', {session : false}),authController.userSignUp); 
router.post('/auth/login', authController.userLogin);
router.post('/auth/token', authController.tokenController);


module.exports = router;