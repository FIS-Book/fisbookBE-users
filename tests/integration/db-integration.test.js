require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/user');
const request = require('supertest');
const app = require('../../app');  // Suponiendo que 'app' es tu servidor de Express

jest.setTimeout(30000); // Aumentar el tiempo de espera para las pruebas

describe("Integration Tests - Users DB Connection", () => {
    let dbConnect;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        dbConnect = mongoose.connection;
        if (dbConnect.readyState == 1) {
            return;
        }

        await new Promise((resolve, reject) => {
            dbConnect.on("connected", resolve);
            dbConnect.on("error", reject);
        });
    });

    beforeEach(async () => {
        await User.deleteMany({});  // Limpiar la base de datos antes de cada test
    });

    afterAll(async () => {
        if (dbConnect.readyState == 1) {
            await dbConnect.dropDatabase();  // Limpiar la base de datos después de todas las pruebas
            await dbConnect.close();
            await mongoose.disconnect();
        }
    });

    describe("Tests CRUD operations for Users", () => {
        it('should create and save a user successfully', async () => {
            const userData = {
                nombre: 'John',
                apellidos: 'Doe',
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123', // Asegúrate de manejar el hash de la contraseña si es necesario
                plan: 'Activo',
                tipo: 'User',
            };

            const res = await request(app).post('/users')  // Suponiendo que tu ruta es '/users'
                .send(userData)
                .expect(201);  // Espera que la respuesta sea un código 201 (creado)

            // Comprobamos que el usuario se creó correctamente
            expect(res.body).toHaveProperty('nombre', userData.nombre);
            expect(res.body).toHaveProperty('apellidos', userData.apellidos);
            expect(res.body).toHaveProperty('username', userData.username);
            expect(res.body).toHaveProperty('email', userData.email);
            expect(res.body).toHaveProperty('plan', userData.plan);
            expect(res.body).toHaveProperty('tipo', userData.tipo);
        });

        it('should return validation error if username is too short', async () => {
            const userData = {
                nombre: 'John',
                apellidos: 'Doe',
                username: 'a',  // Username demasiado corto
                email: 'testuser@example.com',
                password: 'password123',
                plan: 'Activo',
                tipo: 'User',
            };

            const res = await request(app).post('/users')
                .send(userData)
                .expect(400);  // Espera un código de error 400 (Bad Request)

            expect(res.body.message).toContain('El nombre de usuario debe tener al menos 3 caracteres');
        });

        it('should fetch a user by id', async () => {
            const userData = {
                nombre: 'John',
                apellidos: 'Doe',
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                plan: 'Activo',
                tipo: 'User',
            };

            const user = new User(userData);
            await user.save();

            const res = await request(app).get(`/users/${user._id}`)
                .expect(200);  // Espera que la respuesta sea un código 200 (OK)

            expect(res.body).toHaveProperty('nombre', userData.nombre);
            expect(res.body).toHaveProperty('apellidos', userData.apellidos);
            expect(res.body).toHaveProperty('username', userData.username);
        });

        it('should return validation error if plan is not valid', async () => {
            const userData = {
                nombre: 'John',
                apellidos: 'Doe',
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                plan: 'InvalidPlan',  // Plan no válido
                tipo: 'User',
            };

            const res = await request(app).post('/users')
                .send(userData)
                .expect(400);  // Espera un código de error 400 (Bad Request)

            expect(res.body.message).toContain('El plan debe ser "Activo" o "No activo"');
        });

        it('should update a user successfully', async () => {
            const userData = {
                nombre: 'John',
                apellidos: 'Doe',
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                plan: 'Activo',
                tipo: 'User',
            };

            const user = new User(userData);
            await user.save();

            const updatedData = {
                nombre: 'John Updated',
                apellidos: 'Doe Updated',
                username: 'updateduser',
                email: 'updateduser@example.com',
                plan: 'No activo',
                tipo: 'Admin',
            };

            const res = await request(app).put(`/users/${user._id}`)
                .send(updatedData)
                .expect(200);  // Espera que la respuesta sea un código 200 (OK)

            expect(res.body).toHaveProperty('nombre', updatedData.nombre);
            expect(res.body).toHaveProperty('apellidos', updatedData.apellidos);
            expect(res.body).toHaveProperty('plan', updatedData.plan);
            expect(res.body).toHaveProperty('tipo', updatedData.tipo);
        });

        it('should delete a user successfully', async () => {
            const userData = {
                nombre: 'John',
                apellidos: 'Doe',
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                plan: 'Activo',
                tipo: 'User',
            };

            const user = new User(userData);
            await user.save();

            const res = await request(app).delete(`/users/${user._id}`)
                .expect(200);  // Espera que la respuesta sea un código 200 (OK)

            expect(res.body).toHaveProperty('message', 'Usuario eliminado');
        });
    });
});

