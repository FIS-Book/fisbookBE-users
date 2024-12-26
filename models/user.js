const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
});

userSchema.methods.cleanup = function() {
    return {
        id: this._id,
        nombre: this.nombre,
        email: this.email,
        plan: this.plan,
        tipo: this.tipo
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;