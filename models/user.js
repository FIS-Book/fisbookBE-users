const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        enum: ['Activo', 'No activo'],
        required: true
    },
    tipo: {
        type: String,
        enum: ['Admin', 'User'], // Define el tipo de usuario
        required: true
    },
    listaLecturasId: [{ type: String }] // Opcional: IDs de listas gestionadas por otro microservicio
    ,
    numDescargas: {
        type: Number,
        default: 0 // Número de descargas inicial
    },
    resenasId: [{ type: String}] // Referencia a reseñas que haya escrito
});

userSchema.methods.cleanup = function() {
    return {
        id: this._id,
        nombre: this.nombre,
        apellidos: this.apellidos,
        email: this.email,
        plan: this.plan,
        tipo: this.tipo,
        listaLecturasId: this.listaLecturasId,
        numDescargas: this.numDescargas,
        resenasId: this.resenasId
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;