// Conexión a MongoDB
const mongoose = require('mongoose');

// Aquí defines la URI de tu base de datos directamente en el código
const uri = 'mongodb+srv://kristinalacasta:xMYbMXj9Y2S1j6gR@cluster0.hywhz.mongodb.net/';

// Establece la conexión con MongoDB Atlas
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));

module.exports = db;