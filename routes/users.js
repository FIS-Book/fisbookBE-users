var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Autenticación
const jwt = require('jsonwebtoken');
const verifyToken = require('../authentication/auth'); // Middleware de verificación de token
const generateToken = require('../authentication/generateToken'); // Función para generar token
// const validateRole = require('../authentication/roleValidator'); // Opcional

// Ruta de prueba para autenticación
router.get('/pruebaAuth', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Autenticación exitosa',
    user: req.user
  });
});

// BD
var User = require('../models/user');
var debug = require('debug')('users-2:server');

/* GET users listing - Obtener todos los usuarios */
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await User.find();
    res.send(result.map((c) => c.cleanup())); // Limpiar atributos
  } catch(e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/* GET /users/:id - Obtener un usuario por ID */
router.get('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario.cleanup());
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/* PUT /users/:id - Actualizar un usuario */
router.put('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const { nombre, email, plan, tipo } = req.body;

  try {
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar los datos
    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    usuario.plan = plan || usuario.plan;
    usuario.tipo = tipo || usuario.tipo;

    await usuario.save();
    res.json(usuario.cleanup());
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/* DELETE /users/:id - Eliminar un usuario */
router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;

  // Verificar si el ID es válido
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const usuario = await User.findByIdAndDelete(userId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

// Ruta de registro
router.post('/register', async (req, res) => {
  const { nombre, apellidos, email, password, plan, tipo } = req.body;

  try {
    const user = new User({ nombre, apellidos, email, password, plan, tipo });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    if (err.code === 11000) {  // Error de duplicados (email único)
      return res.status(400).json({ message: 'El email ya está en uso' });
    }
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Generar el token JWT
    const token = generateToken(user);

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});

module.exports = router;
