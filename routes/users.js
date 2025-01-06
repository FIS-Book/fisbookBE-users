var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const axios = require('axios'); // Para hacer solicitudes HTTP

// Autenticación
const jwt = require('jsonwebtoken');
const verifyToken = require('../authentication/auth'); 
const generateToken = require('../authentication/generateToken'); // Función para generar token

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
 * /api/v1/auth/users:
 *   get:
 *     summary: Obtiene una lista de todos los usuarios.
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/users', verifyToken, async (req, res) => {
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
 * /api/v1/auth/users/{id}:
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
router.get('/users/:id', verifyToken, async (req, res) => {
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
 * /api/v1/auth/users/{id}:
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
router.put('/users/:id', verifyToken, async (req, res) => {
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
 * /api/v1/auth/users/{id}:
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
router.delete('/users/:id', verifyToken, async (req, res) => {
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
 * /api/v1/auth/users/register:
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
router.post('/users/register', async (req, res) => {
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
 * /api/v1/auth/users/login:
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
router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const token = generateToken(user);

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (err) {
    res.status(400).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});


/**
 * @swagger
 * /api/v1/auth/users/{userId}/downloads:
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
 *               numDescargas:
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
 *                     numDescargas:
 *                       type: integer
 *                       example: 100
 *       400:
 *         description: Error en la solicitud (datos inválidos o faltantes).
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 * 
 */
router.patch('/users/:userId/downloads', verifyToken, async (req, res) => { 
  try {
    const { userId } = req.params;  // Ahora estamos usando userId
    const { numDescargas } = req.body;

    // Validar si numDescargas está definido
    if (typeof numDescargas === 'undefined') {
      return res.status(400).json({ error: "'numDescargas' is required." });
    }

    // Actualizar el número de descargas del usuario utilizando userId
    const updatedUser = await User.findByIdAndUpdate(
      userId,  // Buscar por userId
      { $set: { numDescargas } },
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



/**
 * @swagger
 * /api/v1/auth/users/{userId}/readings:
 *   get:
 *     summary: Obtiene las listas de lectura de un usuario.
 *     description: Permite obtener las listas de lecturas de un usuario dado su `userId`.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario cuyas listas de lecturas se desean obtener.
 *         schema:
 *           type: string
 *           example: "00000000001"
 *     responses:
 *       200:
 *         description: Se han obtenido las listas de lecturas del usuario exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID del usuario.
 *                     nombre:
 *                       type: string
 *                       description: Nombre del usuario.
 *                     apellidos:
 *                       type: string
 *                       description: Apellidos del usuario.
 *                     listaLecturasId:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de IDs de las listas de lectura asociadas al usuario.
 *                 readings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID de la lista de lectura.
 *                       name:
 *                         type: string
 *                         description: Nombre de la lista de lectura.
 *                       description:
 *                         type: string
 *                         description: Descripción de la lista de lectura.
 *       400:
 *         description: Error en la solicitud, parámetros inválidos.
 *       404:
 *         description: No se encontraron listas de lecturas para el usuario.
 *       500:
 *         description: Error inesperado del servidor.
 */

router.get('/users/:id/readings', verifyToken, async (req, res) => {
  const { id } = req.params;

  // Validar que el ID del usuario sea válido
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de usuario inválido.' });
  }

  // Obtener el token del encabezado Authorization
  const token = req.headers['authorization'];
  
  // Validar si el token está presente
  if (!token) {
    return res.status(401).json({ message: 'Token de autorización faltante.' });
  }
  
  console.log('Token recibido por el endpoint:', token); // Log para depuración

  try {
    // Hacer la solicitud al microservicio de lecturas
    const response = await axios.get(`${process.env.BASE_URL}/api/v1/readings`, {
      headers: {
        Authorization: token, // Enviar el token al microservicio
      },
      params: { userId: id }, // Enviar el ID como parámetro
    });

    console.log('Respuesta del microservicio:', response.data); // Log para ver los datos devueltos

    // Verificar que la respuesta tiene datos y no está vacía
    if (response.data && Array.isArray(response.data.genres) && response.data.genres.length > 0) {
      return res.status(200).json({
        message: 'Listas de lectura obtenidas con éxito.',
        readings: response.data.genres, // Devolver los géneros con sus detalles
      });
    } else {
      return res.status(404).json({ message: 'No se encontraron lecturas para este usuario.' });
    }
  } catch (error) {
    console.error('Error en el endpoint:', error);

    // Manejar errores específicos
    if (error.response) {
      // Si la respuesta es 401, significa que el token es inválido
      if (error.response.status === 401) {
        return res.status(401).json({ message: 'No autorizado: Token inválido o faltante.' });
      }

      // Si se recibe un error distinto de 401, mostrar los detalles
      return res.status(error.response.status || 500).json({
        message: error.response.data.message || 'Error al obtener las lecturas del microservicio.',
        error: error.response.data || error.message,
      });
    }

    // Si ocurre un error inesperado, mostrar detalles del error
    return res.status(500).json({ message: 'Error inesperado en el servidor.', error: error.message });
  }
});


/**
 * @swagger
 * /api/v1/auth/users/reviews/user/{userId}/book:
 *   get:
 *     summary: Obtiene las reseñas de un usuario para un libro.
 *     description: Permite obtener todas las reseñas que un usuario ha realizado para libros específicos.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: El ID del usuario cuyas reseñas se desean consultar.
 *         schema:
 *           type: string
 *           example: "00000000001"
 *     responses:
 *       200:
 *         description: Reseñas del usuario para libros obtenidas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookId:
 *                     type: string
 *                     description: ID del libro.
 *                   review:
 *                     type: string
 *                     description: Contenido de la reseña.
 *                   rating:
 *                     type: number
 *                     description: Calificación dada al libro.
 *       400:
 *         description: Parámetros inválidos en la solicitud.
 *       404:
 *         description: No se encontraron reseñas para este usuario.
 *       500:
 *         description: Error inesperado en el servidor.
 */

router.get('/users/reviews/user/:userId/book', verifyToken, async (req, res) => {
  console.log('User from Token:', req.user); // Asegúrate de que el usuario sea correcto
 
  const { userId } = req.params;
 
  if (!userId) {
    return res.status(400).json({ message: 'El parámetro userId es obligatorio.' });
  }
 
  try {
    const token = req.headers.authorization.split(' ')[1]; // Token enviado al backend
    const response = await axios.get(`${process.env.BASE_URL}/api/v1/reviews/users/${userId}/bk`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
 
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: 'No se encontraron reseñas para este usuario.' });
    }
 
    return res.status(200).json({
      message: 'Reseñas del usuario para libros obtenidas exitosamente.',
      reviews: response.data,
    });
  } catch (error) {
    console.error('Axios Error:', error.response?.data || error.message);
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ message: 'No autorizado: verifica tu token.' });
    }
    return res.status(500).json({ message: 'Error inesperado en el servidor.', error: error.message });
  }
});

module.exports = router;
