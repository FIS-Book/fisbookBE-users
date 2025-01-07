require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/user');  
const db = require('./db.js');


jest.setTimeout(30000);
 
describe("Pruebas de Integración - Conexión con la DB de Usuarios", () => {
    let dbConnect;
 
    beforeAll(async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI_USERS_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
          dbConnect = mongoose.connection;
          if (dbConnect.readyState !== 1) {
            throw new Error('La conexión a la base de datos no está activa.');
          }
        } catch (error) {
          console.error('Error al conectar con la base de datos:', error);
          throw error; 
        }
      });

 
    beforeEach(async () => {
        await User.deleteMany({});  
    });
 
    afterAll(async () => {
        if (dbConnect.readyState == 1) {
            await dbConnect.close();
            await mongoose.disconnect();
        }
    });
 
    describe("Operaciones CRUD a través de la API", () => {
        it('debería crear y guardar un usuario exitosamente', async () => {
            const user = new User({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan1',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest'
            });
 
            const savedUser = await user.save();
            expect(savedUser.username).toBe(user.username);
            expect(savedUser.email).toBe(user.email);
        });
 
        it('debería actualizar un usuario exitosamente a través de la API', async () => {
            const user = new User({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan1',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest'
            });
 
            const updatedUserData = {
                username: 'updateduser',
                password: 'newpassword123',
                rol: 'Admin',
                plan: 'Plan2',
                apellidos: 'ApellidoActualizado',
                nombre: 'NombreActualizado'
            };
 
            await user.save();
            const updatedUser = await User.findByIdAndUpdate(user._id, updatedUserData, { new: true });
 
            expect(updatedUser.username).toBe(updatedUserData.username);
            expect(updatedUser.email).toBe(user.email);  
            expect(updatedUser.rol).toBe(updatedUserData.rol);
            expect(updatedUser.plan).toBe(updatedUserData.plan);
            expect(updatedUser.apellidos).toBe(updatedUserData.apellidos);
            expect(updatedUser.nombre).toBe(updatedUserData.nombre);
        });
 
        it('debería eliminar un usuario exitosamente a través de la API', async () => {
            const user = new User({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan1',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest'
            });
 
            const savedUser = await user.save();
 
            await User.deleteOne({ _id: savedUser._id });
 
            const deletedUser = await User.findOne({ _id: savedUser._id });
            expect(deletedUser).toBeNull();
        });
    });
 
    describe("Validaciones del Modelo de Usuario", () => {
        it('debería fallar si el correo electrónico ya existe', async () => {
            const user1 = new User({
                username: 'user1',
                email: 'testuser@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan1',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest'
            });
 
            const user2 = new User({
                username: 'user2',
                email: 'testuser@example.com',
                password: 'password456',
                rol: 'User',
                plan: 'Plan2',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest'
            });
 
            await user1.save();
            let error;
            try {
                await user2.save();
            } catch (err) {
                error = err;
            }
 
            expect(error).toBeDefined();
            expect(error.code).toBe(11000);  
        });
 
        it('debería fallar si la contraseña es demasiado corta', async () => {
            const user = new User({
                username: 'testuser',
                email: 'testuser@example.com',
                password: '123', 
                rol: 'User',
                plan: 'Plan2',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest'
            });
 
            try {
                await user.save();
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.errors.password).toBeDefined();
                expect(error.errors.password.message).toBe('La contraseña debe tener al menos 6 caracteres.');
            }
        });
 
        it('debería fallar si el nombre de usuario es demasiado corto', async () => {
            const user = new User({
                username: 'us',  
                email: 'user@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan3',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest'
            });
 
            try {
                await user.save();
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.errors.username).toBeDefined();
                expect(error.errors.username.message).toBe('El nombre de usuario debe tener al menos 3 caracteres');
            }
        });
    });
});