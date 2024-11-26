var express = require('express');
var router = express.Router();

// Lista simulada de usuarios
let usuarios = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', plan: 'Básico', tipo: 'normal' },
  { id: 2, nombre: 'María Gómez', email: 'maria@example.com', plan: 'Premium', tipo: 'admin' },
  { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@example.com', plan: 'Básico', tipo: 'normal' },
  { id: 4, nombre: 'Ana López', email: 'ana@example.com', plan: 'Premium', tipo: 'normal' }
];

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(usuarios);
});

module.exports = router;
