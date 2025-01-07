const mongoose = require('mongoose');
require('dotenv').config();
 
//Function to connect to the database
async function connectToDatabase() {
    try {
        const DB_URL = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_USERS_TEST : process.env.MONGO_URI_USERS;
        //console.log('DB_URL:', DB_URL)
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}
connectToDatabase();
// Access the Mongoose connection instance
const db = mongoose.connection;
module.exports = db;