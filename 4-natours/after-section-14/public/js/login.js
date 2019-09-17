/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'           //**** Basically creates a new cookie without a jwt token in it and it is sent down  ****
    });
    
    
    //**** true:  go to server and get the page again  and not from the cache. Because, the new updated cookie (see comment above)
    //            will be sent to the server and the server will realize that the person is not logged in and so, 
    //            the login/logout menu options will be appropriately turned on in the pug files and then sent down to the browser
    if ((res.data.status = 'success')) location.reload(true);     
                                                                  
                                                                  
 
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
