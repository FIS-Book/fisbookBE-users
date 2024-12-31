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


router.get('/healthz', (req, res) => {
  /* 
  #swagger.tags = ['Health']
  #swagger.description = 'Endpoint to check the health status of the service.'
  #swagger.responses[200] = { $ref: '#/responses/ServiceHealthy' }
  #swagger.responses[500] = { $ref: '#/responses/ServerError' }
*/
res.sendStatus(200);
});


/**
 * @swagger
 * api-v1/users:
 *   get:
 *     summary: Obtiene una lista de todos los usuarios.
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await User.find();
    res.send(result.map((c) => c.cleanup())); // Limpiar atributos
  } catch(e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * api-v1/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del usuario.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
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

/**
 * @swagger
 * api-v1/users/{id}:
 *   put:
 *     summary: Actualiza los datos de un usuario.
 *     description: Actualiza los datos del usuario identificado por el ID proporcionado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario.
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario.
 *               plan:
 *                 type: string
 *                 description: Plan del usuario.
 *               rol:
 *                 type: string
 *                 description: Rol de usuario.
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
 *       400:
 *         description: ID inválido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.put('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const { nombre, apellidos, username, email, plan, rol } = req.body;
 
  try {
    const usuario = await User.findById(id);
 
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
 
    // Actualizar los datos del usuario
    usuario.nombre = nombre || usuario.nombre;
    usuario.apellidos = apellidos || usuario.apellidos;
    usuario.username = username || usuario.username;
    usuario.email = email || usuario.email;
    usuario.plan = plan || usuario.plan;
    usuario.rol = rol || usuario.rol;
 
    await usuario.save();
    res.json(usuario.cleanup());
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * api-v1/users/{id}:
 *   delete:
 *     summary: Elimina un usuario por su ID.
 *     description: Elimina el usuario identificado por el ID proporcionado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 *       400:
 *         description: ID inválido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
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

/**
 * @swagger
 * /api-v1/users/register:
 *   post:
 *     summary: Registra un nuevo usuario.
 *     description: Crea un nuevo usuario en la base de datos con los datos proporcionados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellidos
 *               - username
 *               - email
 *               - password
 *               - plan
 *               - rol
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Error en la solicitud (datos inválidos o faltantes).
 *       409:
 *         description: El username o email ya está en uso.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/register', async (req, res) => {
  const { nombre, apellidos, username, password, email, plan, rol} = req.body;

  try {
    const user = new User({ nombre, apellidos, username, email, password, plan, rol });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    if (err.code === 11000) {  // Error de duplicados (email único)
      return res.status(409).json({ message: 'El username o el email ya está en uso' });
    }
    res.status(400).json({ message: 'Error al registrar usuario', error: err.message });
  }
});


/**
 * @swagger
 * /api-v1/users/login:
 *   post:
 *     summary: Inicia sesión en el sistema.
 *     description: Permite a un usuario autenticarse con su email y contraseña, y devuelve un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Dirección de correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación.
 *       400:
 *         description: Error en la solicitud (datos inválidos o faltantes).
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Generar el token JWT
    const token = generateToken(user);

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (err) {
    res.status(400).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});

/**
 * @swagger
 * /api-v1/users/{userId}/downloads:
 *   patch:
 *     summary: Actualiza el número de descargas de un usuario.
 *     description: Permite a un administrador o al propio usuario actualizar la cantidad de descargas asociadas a un usuario.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario cuya cantidad de descargas se actualizará.
 *         schema:
 *           type: string
 *           example: "609c1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - downloadCount
 *             properties:
 *               downloadCount:
 *                 type: integer
 *                 description: Nuevo número de descargas del usuario.
 *                 example: 100
 *     responses:
 *       200:
 *         description: El número de descargas del usuario se ha actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *                   example: "El número de descargas del usuario se ha actualizado éxitosamente."
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "609c1f77bcf86cd799439011"
 *                     downloadCount:
 *                       type: integer
 *                       example: 100
 *       400:
 *         description: Error en la solicitud (datos inválidos o faltantes).
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.patch('/:userId/downloads', verifyToken, async (req, res) => { 
  try {
    const { userId } = req.params;
    const { downloadCount } = req.body;

    // Validar si downloadCount está definido
    if (typeof downloadCount === 'undefined') {
      return res.status(400).json({ error: "'downloadCount' is required." });
    }

    // Actualizar el número de descargas del usuario
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { downloadCount } },
      { new: true, runValidators: true }
    );

    // Verificar si el usuario fue encontrado
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Responder con el mensaje de éxito y el usuario actualizado
    res.json({
      message: 'El número de descargas del usuario se ha actualizado éxitosamente.',
      user: updatedUser,
    });
  } catch (error) {
    // Manejo de errores, como validaciones fallidas
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Fallo en la validación. Compruebe los datos proporcionados.', details: error.errors });
    }
    // Manejo de errores inesperados del servidor
    return res.status(500).json({ message: 'Ha ocurrido un error inesperado en el servidor', error: error.message });
  }
});


module.exports = router;
