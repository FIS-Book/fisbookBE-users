var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const db = require('./db.js');

var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

const corsOptions = {
  origin: [`${process.env.BASE_URL}`,'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/auth', usersRouter);


const swaggerOptions = {
    definition: {
        openapi: '3.0.0',  
        info: {
            title: 'Mi API',  
            version: '1.0.0',  
            description: 'Documentación de mi API usando Swagger',  
        },
    },
    apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api/v1/auth/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
