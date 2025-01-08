require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/user');
const dbConnection = require('../../db');


jest.setTimeout(30000);

describe('Integration-Test Reviews DB connection', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI_USERS_TEST, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            await mongoose.connection.asPromise(); // Asegura que la conexión esté lista
        }

        await mongoose.connection.db.collection('users').deleteMany({ email: 'testuser@example.com' });
        await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
        await mongoose.connection.db.collection('users').createIndex({ username: 1 }, { unique: true });

    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('Check the connection to the review database', () => {
        it('should confirm DB is connected', () => {
            expect(mongoose.connection.readyState).toBe(1); // Reemplaza dbConnection
        });

        it('should confirm the connection is to the correct database', () => {
            expect(mongoose.connection.name).toBe('test'); // Asegúrate de que el nombre sea correcto
        });
    });

    describe("Operaciones CRUD a través de la API", () => {
        beforeEach(async () => {
            await User.deleteMany({});
        });

        afterAll(async () => {
            await mongoose.connection.dropDatabase(); // Limpia la base de datos
        });

        it('debería crear y guardar un usuario exitosamente', async () => {
            const user = new User({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan1',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest',
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
                nombre: 'NombreTest',
            });

            await user.save();

            const updatedUserData = {
                username: 'updateduser',
                password: 'newpassword123',
                rol: 'Admin',
                plan: 'Plan2',
                apellidos: 'ApellidoActualizado',
                nombre: 'NombreActualizado',
            };

            const updatedUser = await User.findByIdAndUpdate(user._id, updatedUserData, { new: true });

            expect(updatedUser.username).toBe(updatedUserData.username);
            expect(updatedUser.rol).toBe(updatedUserData.rol);
        });

        it('debería eliminar un usuario exitosamente a través de la API', async () => {
            const user = new User({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan1',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest',
            });

            const savedUser = await user.save();

            await User.deleteOne({ _id: savedUser._id });

            const deletedUser = await User.findOne({ _id: savedUser._id });
            expect(deletedUser).toBeNull();
        });
    });

    describe("Validaciones del Modelo de Usuario", () => {     
        
        // it('debería fallar si el correo electrónico ya existe', async () => {
        //     const user1 = new User({
        //         username: 'user1',
        //         email: 'testuser@example.com',
        //         password: 'password123',
        //         rol: 'User',
        //         plan: 'Plan1',
        //         apellidos: 'ApellidoTest',
        //         nombre: 'NombreTest',
        //     });
        
        //     const user2 = new User({
        //         username: 'user2',
        //         email: 'testuser@example.com', // Mismo email que user1
        //         password: 'password456',
        //         rol: 'User',
        //         plan: 'Plan2',
        //         apellidos: 'ApellidoTest',
        //         nombre: 'NombreTest',
        //     });
        
        //     await user1.save();
        
        //     let error;
        //     try {
        //         await user2.save();
        //     } catch (err) {
        //         error = err;
        //     }
        //     expect(error).toBeDefined();
        //     expect(error.name).toBe('MongoServerError');
        //     expect(error.code).toBe(11000); 
        // });

        it('debería fallar si la contraseña es demasiado corta', async () => {
            const user = new User({
                username: 'testuser',
                email: 'testuser@example.com',
                password: '123',
                rol: 'User',
                plan: 'Plan2',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest',
            });

            await expect(user.save()).rejects.toThrow(/La contraseña debe tener al menos 6 caracteres/);
        });
        
        it('debería fallar si el nombre de usuario es demasiado corto', async () => {
            const user = new User({
                username: 'us',
                email: 'user@example.com',
                password: 'password123',
                rol: 'User',
                plan: 'Plan3',
                apellidos: 'ApellidoTest',
                nombre: 'NombreTest',
            });

            await expect(user.save()).rejects.toThrow(/El nombre de usuario debe tener al menos 3 caracteres/);
        });
        
    });
});