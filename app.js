var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api-v1/users', usersRouter);

// Conexión a MongoDB
const mongoose = require('mongoose');

// URI de la base de datos
const uri = 'mongodb+srv://kristinalacasta:xMYbMXj9Y2S1j6gR@cluster0.hywhz.mongodb.net/';

// Establece la conexión con MongoDB Atlas
mongoose.connect(uri)
  .then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Exportar la app
module.exports = app;
