const mongoose = require('mongoose');


// ***** This does not work when we host our application in some places like HEROKU for example.
//       There we either use the Heroku CLI and add the environment variables like so ...  heroku config:set key value
//       or we go into our Heroku dashboard and set them up there
const dotenv = require('dotenv');


// ********************************* This handler should be the FIRST thing *******************************
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});




dotenv.config({ path: './config.env' });

// ***************** EXPRESS APP **************************************************************************
const app = require('./app');



// ***************** Database connection logic ************************************************************
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
  .then(() => console.log('DB connection successful!'));
// ***************** Database connection logic ************************************************************


// ***************** Start the Web Server that comes with Express *****************************************
const port = process.env.PORT || 3000;
// ********* We save the server so we can use it later ***
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



// ********* All unhandled Promise Rejections ***************************************************************
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {                                    // Shutdown our Server **************************
        process.exit(1);                                    // Now exit our node application ****************
    }); 
});


//*********** Remember, Heroku every 24 hours sends a sigterm to our application for health reasons and then immediately 
//*********** restarts
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
        //************* Here we don't do a process.exit(with code) BECAUSE that is what SIGTERM does. It is telling us that 
        // a termination signal has just been received by our process so there is NO NEED for us to do a process.exit 
    });
});
