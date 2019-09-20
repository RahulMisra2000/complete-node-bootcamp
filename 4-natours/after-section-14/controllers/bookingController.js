
//********* Notice how we provide our api secrey key we got from Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  //******************************************************************  2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  //***************************************************************** 3) Send the checkout session back to the client code (browser)
  res.status(200).json({
    status: 'success',
    session
  });
});

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};


/* *********** I am reproducing a part of the code from app.js here for REFERENCE ONLY
               Author configured HEROKU to send a post request to /webhook-checkout when a CC charge goes through
               so, any res.send etc from any middleware at this route will be sent BACK to HEROKU and NOT TO OUR application
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout           //***** this last middleware is coded below
* **************//

exports.webhookCheckout = (req, res, next) => {
  
  //*** Think of this as getting the signature from the header and making sure all is KOSHER and getting hold of the event object *****
      const signature = req.headers['stripe-signature'];
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);       // Sent to HEROKU
      }
  //*** Think of this as getting the signature from the header and making sure all is KOSHER and getting hold of the event object *****
  
  //*** We can configure HEROKU to send us all kinds of events as and when they happen and we can specify to HEROKU
  //    to have all of them come to a single endpoint like eg /webhook-checkout and that is WHY here we check the event type so 
  //    accordingly we can process 
    if (event.type === 'checkout.session.completed')
      createBookingCheckout(event.data.object);    // Add a record in mongoDB using information from the session object 
                                                   // that we had Stripe create at the time the CC transaction was being done

    res.status(200).json({ received: true });                              // Sent to HEROKU
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
