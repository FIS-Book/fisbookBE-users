const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno

const generateToken = (user) => {
  // Generamos un token JWT
  try {
    const plainUser = {
      _id: user._id.toString(), // Convertir ObjectId a string
      nombre: user.nombre,
      apellidos: user.apellidos,
      username: user.username,
      email: user.email,
      plan: user.plan,
      rol: user.rol,
    };
    const token = jwt.sign(plainUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
  } catch (e) {
    console.error('Error al generar token:', e.message, e.stack);
    return null;
  }
  
};

module.exports = generateToken;

