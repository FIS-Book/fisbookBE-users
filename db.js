// Mongo DB
const mongoose = require('mongoose');
 
mongoose.connect(`${process.env.MONGO_URI_USERS}`);
 
const db = mongoose.connection;
 
db.on('error', console.error.bind(console, 'MongoDB Atlas connection error:'));
db.once('open', function() {
  console.log("Successfully connected to MongoDB Atlas");
});
 
module.exports = db;