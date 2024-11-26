var express = require('express');
var router = express.Router();

// BD 
var User = require('../models/user');
var debug = require('debug')('users-2:server');

// Lista simulada de usuarios
let usuarios = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', plan: 'Básico', tipo: 'normal' },
  { id: 2, nombre: 'María Gómez', email: 'maria@example.com', plan: 'Premium', tipo: 'admin' },
  { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@example.com', plan: 'Básico', tipo: 'normal' },
  { id: 4, nombre: 'Ana López', email: 'ana@example.com', plan: 'Premium', tipo: 'normal' }
];

/* GET users listing. */
router.get('/', async function(req, res, next) {
  // control de errores
  try{
    const result = await User.find(); // llamada asíncrona
    res.send(result.map((c) => c.cleanup())); // limpieza de atributos que se devuelven
  } catch(e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/* GET /users - Obtener todos los usuarios */
router.get('/', function(req, res, next) {
  res.json(usuarios); // Enviar la lista de usuarios como respuesta JSON
});

/* GET /users/:id - Obtener un usuario por ID */
router.get('/:id', function(req, res, next) {
  const id = parseInt(req.params.id); // Convertir ID de string a número
  const usuario = usuarios.find(user => user.id === id);

  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  res.json(usuario);
});

/* POST /users - Crear un nuevo usuario */
router.post('/', async function(req, res, next) {
  const {nombre, email, plan, tipo} = req.body;

  const user = new User({
    nombre,
    email,
    plan,
    tipo
  });

  try{
    await user.save();
    return res.sendStatus(201);
  } catch(e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/* PUT /users/:id - Actualizar un usuario */
router.put('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(user => user.id === id);

  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Actualizar los datos del usuario
  usuario.nombre = req.body.nombre || usuario.nombre;
  usuario.email = req.body.email || usuario.email;
  usuario.plan = req.body.plan || usuario.plan;
  usuario.tipo = req.body.tipo || usuario.tipo;

  res.json(usuario); // Responder con el usuario actualizado
});

/* DELETE /users/:id - Eliminar un usuario */
router.delete('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  const indice = usuarios.findIndex(user => user.id === id);

  if (indice === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  usuarios.splice(indice, 1); // Eliminar usuario de la lista
  res.json({ message: 'Usuario eliminado' });
});

module.exports = router;


