const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'] 
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son obligatorios'],
        minlength: [2, 'Los apellidos deben tener al menos 2 caracteres']
    },
    username: {
        type: String,
        required: true, 
        unique: true, 
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'], 
        maxlength: [30, 'El nombre de usuario no puede tener más de 30 caracteres'], 
        match: [/^[a-zA-Z0-9._-]+$/, 'El nombre de usuario solo puede contener letras, números, puntos, guiones bajos y guiones'], 
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido'] // Expresión regular para validar el formato de email
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'] // Validación de longitud mínima
    },
    plan: {
        type: String,
        enum: {
            values: ['Plan1', 'Plan2', 'Plan3'],
            message: 'El plan debe ser "Plan1", "Plan2" o "Plan3"'
        },
        required: [true, 'El plan es obligatorio']
    },
    rol: {
        type: String,
        enum: {
            values: ['Admin', 'User'],
            message: 'El rol de usuario debe ser "Admin" o "User"'
        },
        required: [true, 'El rol de usuario es obligatorio']
    },
    listaLecturasId: [{ type: String }],
    numDescargas: {
        type: Number,
        default: 0
    },
    resenasId: [{ type: String }]
});

userSchema.methods.cleanup = function() {
    return {
        id: this._id,
        nombre: this.nombre,
        apellidos: this.apellidos,
        username: this.username,
        email: this.email,
        plan: this.plan,
        rol: this.rol,
        listaLecturasId: this.listaLecturasId,
        numDescargas: this.numDescargas,
        resenasId: this.resenasId
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;