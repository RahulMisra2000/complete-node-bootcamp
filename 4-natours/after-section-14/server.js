const mongoose = require('mongoose');
const dotenv = require('dotenv');

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


process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});
