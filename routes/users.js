var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// BD
var User = require('../models/user');
var debug = require('debug')('users-2:server');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene una lista de todos los usuarios.
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 *       500:
 *         description: Error en el servidor.
 */

/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    const result = await User.find(); // Llamada asíncrona
    res.send(result.map((c) => c.cleanup())); // Limpieza de atributos que se devuelven
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /users/{id}:
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

/* GET /users/:id - Obtener un usuario por ID */
router.get('/:id', async function(req, res, next) {
  const id = req.params.id;
  try {
    const usuario = await User.findById(id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario.cleanup()); // Devolver el usuario con la limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario.
 *     description: Crea un nuevo usuario con los datos proporcionados en el cuerpo de la solicitud.
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
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del usuario.
 *               username:
 *                 type: string
 *                 description: Nombre de usuario.
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario.
 *               plan:
 *                 type: string
 *                 description: Plan del usuario (Activo o No activo).
 *               tipo:
 *                 type: string
 *                 description: Tipo de usuario (Admin o User).
 *     responses:
 *       201:
 *         description: Usuario creado con éxito.
 *       400:
 *         description: Error en los datos de entrada.
 *       500:
 *         description: Error en el servidor.
 */

/* POST /users - Crear un nuevo usuario */
router.post('/', async function(req, res, next) {
  const { nombre, apellidos, username, email, plan, tipo } = req.body;

  const user = new User({
    nombre,
    apellidos,
    username,
    email,
    plan,
    tipo
  });

  try {
    await user.save();
    return res.status(201).json(user.cleanup());
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /users/{id}:
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
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del usuario.
 *               username:
 *                 type: string
 *                 description: Nombre de usuario.
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario.
 *               plan:
 *                 type: string
 *                 description: Plan del usuario (Activo o No activo).
 *               tipo:
 *                 type: string
 *                 description: Tipo de usuario (Admin o User).
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

/* PUT /users/:id - Actualizar un usuario */
router.put('/:id', async function(req, res, next) {
  const id = req.params.id;
  const { nombre, apellidos, username, email, plan, tipo } = req.body;

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
    usuario.tipo = tipo || usuario.tipo;

    await usuario.save();
    res.json(usuario.cleanup());
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /users/{id}:
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

/* DELETE /users/:id - Eliminar un usuario */
router.delete('/:id', async function(req, res, next) {
  const userId = req.params.id;

  // Verificar si el ID es un ObjectId válido
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

module.exports = router;
