const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// ********************** Create a router ***********************************************************************************
const router = express.Router();  

// router.param('id', tourController.checkID);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews

// ************** This is a nested Router ****************************************************************************************
router.use('/:tourId/reviews', reviewRouter);
// *******************************************************************************************************************************


// **************** Conventional  usage router.route(  ).httpVerb(Middlewares,..,Handler);   *************************************
//                                                                              the Handler is also a middleware, the difference
//                                                                              is that it sends response to the client     res.
// *******************************************************************************************************************************
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
 
  .post(authController.protect,                           // **** AUTHENTICATION middleware -- makes sure that all kosher with JWT
        authController.restrictTo('admin', 'lead-guide'), //      AUTHORIZATION  middleware -- makes sure user has permissions to 
                                                          //                                   do post on the resource
        tourController.createTour                         //      WORK           middleware -- this middleware actually does the work
       );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour
  )
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;
