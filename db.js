// Conexión a MongoDB
const mongoose = require('mongoose');
const { db } = require('./models/user');
require('dotenv').config();

// Obtén la URI desde las variables de entorno
const uri = process.env.MONGO_URI_USERS;

if (!uri) {
    console.error('❌ Error: La variable de entorno MONGO_URI_USERS no está definida.');
    process.exit(1); // Salir del proceso si no se encuentra la URI
}

// Establece la conexión con MongoDB Atlas
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));

module.exports = db;