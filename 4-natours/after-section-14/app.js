const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin * api.natours.com, front-end natours.com app.use(cors({origin: 'https://www.natours.com'}))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// ************************************************** Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ************************************************** Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);       //* 

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// **  ******** Body parsers, reading data from http req body into req.body ****************************************************

//************* Getting json inside the http req body into req.body when the http request's content type = application/json
app.use(express.json({ limit: '10kb' }));                                   


//************ Getting form's values which are in http req body into req.body when http request's content type = application/x-www-form-urlencoded
//             ie forms are posted using the default enctype of application/x-www-form-urlencoded way ***
//             DETOUR: For forms using multipart/form-data (used when using forms to upload files) you will need to use multer middleware
app.use(express.urlencoded({ extended: true, limit: '10kb' }));         
                                                                     
// **  ******** Body parsers, reading data from http req body into req.body ****************************************************




app.use(cookieParser());

// ************************************************** Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ************************************************** Data sanitization against XSS
app.use(xss());

// ************************************************** Prevent parameter pollution
// The following query string parameters can occur more than once in the url and the last one will be taken
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
// ************************************************** 
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
// ******************** Remember the router is a middleware also. That is why we do app.use ********************************

//************************* For website views
app.use('/', viewRouter);


//************************* For REST API calls
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);


//************************* Catch all route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
