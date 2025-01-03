const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'], 
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'] // Validación de longitud mínima
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son obligatorios'],
        minlength: [2, 'Los apellidos deben tener al menos 2 caracteres']
    },
    username: {
        type: String,
        required: true, // El username es obligatorio
        unique: true, // El username debe ser único
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'], // Validación de longitud mínima
        maxlength: [30, 'El nombre de usuario no puede tener más de 30 caracteres'], // Validación de longitud máxima
        match: [/^[a-zA-Z0-9._-]+$/, 'El nombre de usuario solo puede contener letras, números, puntos, guiones bajos y guiones'], // Expresión regular para validar los caracteres permitidos
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido'] // Expresión regular para validar el formato de email
    },
    plan: {
        type: String,
        enum: {
            values: ['Activo', 'No activo'],
            message: 'El plan debe ser "Activo" o "No activo"'
        },
        required: [true, 'El plan es obligatorio']
    },
    tipo: {
        type: String,
        enum: {
            values: ['Admin', 'User'],
            message: 'El tipo debe ser "Admin" o "User"'
        },
        required: [true, 'El tipo de usuario es obligatorio']
    },
    listaLecturasId: [{ type: String }],
    numDescargas: {
        type: Number,
        default: 0
    },
    resenasId: [{ type: String }]
});

// Método de limpieza de datos
userSchema.methods.cleanup = function() {
    return {
        id: this._id,
        nombre: this.nombre,
        apellidos: this.apellidos,
        username: this.username,
        email: this.email,
        plan: this.plan,
        tipo: this.tipo,
        listaLecturasId: this.listaLecturasId,
        numDescargas: this.numDescargas,
        resenasId: this.resenasId
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
