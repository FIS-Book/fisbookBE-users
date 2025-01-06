const jwt = require('jsonwebtoken');

// Middleware de verificación del token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  // Extrae el token después del prefijo "Bearer"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Formato de token inválido' });
  }

  // Verifica el token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }
    req.user = decoded; // Agrega el usuario decodificado al objeto request
    next(); // Llama al siguiente middleware o controlador de la ruta
  });
};

module.exports = verifyToken;