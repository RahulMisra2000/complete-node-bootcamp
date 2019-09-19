/* eslint-disable */    //* Disabling because we don't want eslint running on client js
import axios from 'axios';
import { showAlert } from './alerts';

//********** The Stripe object below is exposed to the global scope by the stripe.js library that we included elsewhere in the client code
const stripe = Stripe('pk_test_BUkd0ZXAj6m0q0jMyRgBxNns00PPtgvjjr');

export const bookTour = async tourId => {
  try {
    //********************** Call our API and have it call Stripe's API to create a checkout session and get it back to us
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
 
    //********************** Call Stripe's API and have them show THEIR payment screen to ask use for payment details and authorization
                    await stripe.redirectToCheckout({sessionId: session.data.session.id});
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
