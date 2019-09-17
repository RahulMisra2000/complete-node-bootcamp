const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);

// ******** Difference between the two middlewares ****************************************************************************************
// ******** authController.isLoggedIn    : This middleware just adds req.user if the cookie had a jwt token *******************************
// ******** authController.protect       : This middleware short circuits and calls the global error handler if a valid jwt was not in the http request header or cookie ************************
router.get('/', authController.isLoggedIn, viewsController.getOverview);



router.get('/tour/:slug',         authController.isLoggedIn, viewsController.getTour);
router.get('/login',              authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me',                 authController.protect, viewsController.getAccount);
router.get('/my-tours',           authController.protect, viewsController.getMyTours);

router.post('/submit-user-data',  authController.protect,  viewsController.updateUserData);

module.exports = router;
