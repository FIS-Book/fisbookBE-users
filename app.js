var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config(); // Cargar variables de entorno
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const dotenv = require('dotenv');
dotenv.config();

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/auth', usersRouter);

// Conexión a MongoDB
const mongoose = require('mongoose');

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

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',  // Versión de OpenAPI
        info: {
            title: 'Mi API',  // Título de la API
            version: '1.0.0',  // Versión de la API
            description: 'Documentación de mi API usando Swagger',  // Descripción
        },
    },
    // Ruta donde Swagger generará la documentación
    apis: ['./routes/*.js'],  // Los archivos donde están tus rutas (ajusta según tu estructura)
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Usar swagger-ui-express para mostrar la documentación interactiva
app.use('/MS_USERS/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Exportar la app
module.exports = app;
