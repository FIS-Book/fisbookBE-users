const app = require('../app');
const request = require('supertest');
const User = require('../models/user'); 
const mongoose = require('mongoose');
const axios = require('axios');
const { generateToken } = require('../authentication/generateToken');
 
jest.mock('../authentication/auth', () => (req, res, next) => {
    req.user = { id: 'mockedUserId', role: 'Admin' }; 
    next();
});
 
jest.mock('../authentication/generateToken', () => ({
    generateToken: jest.fn() 
  }));

 
jest.mock('axios');


describe("Users API", () => {
  beforeAll(() => {
    // Mocking the console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(async () => {
  await mongoose.connection.close(); // Cierra la conexión a MongoDB
  jest.restoreAllMocks(); // Restaura cualquier mock de Jest
});
    describe("GET /api/v1/auth/users", () => {
        const mockUsers = [
            {
                _id: new mongoose.Types.ObjectId(),
                nombre: "Juan",
                apellidos: "Pérez",
                username: "juanperez",
                email: "juan@example.com",
                password: "hashedpassword",
                plan: "Plan1",
                rol: "User",
                listaLecturasId: ["123"],
                numDescargas: 5,
                resenasId: ["456"]
            },
            {
                _id: new mongoose.Types.ObjectId(),
                nombre: "Ana",
                apellidos: "Gómez",
                username: "anagomez",
                email: "ana@example.com",
                password: "hashedpassword",
                plan: "Plan2",
                rol: "Admin",
                listaLecturasId: ["789"],
                numDescargas: 2,
                resenasId: ["101112"]
            }
        ];
 
        beforeEach(() => {
            jest.clearAllMocks();
        });
 
        it("Debe obtener la lista de usuarios (200)", async () => {
            jest.spyOn(User, "find").mockResolvedValue(mockUsers.map((user) => {
                user.cleanup = jest.fn().mockReturnValue({
                    id: user._id.toString(),
                    nombre: user.nombre,
                    apellidos: user.apellidos,
                    username: user.username,
                    email: user.email,
                    plan: user.plan,
                    rol: user.rol,
                    listaLecturasId: user.listaLecturasId,
                    numDescargas: user.numDescargas,
                    resenasId: user.resenasId
                });
                return user;
            }));
 
            return request(app).get('/api/v1/auth/users').then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeInstanceOf(Array);
                expect(response.body.length).toBe(2);
 
                expect(response.body[0]).toHaveProperty("id", mockUsers[0]._id.toString());
                expect(response.body[0]).toHaveProperty("nombre", mockUsers[0].nombre);
                expect(response.body[0]).toHaveProperty("apellidos", mockUsers[0].apellidos);
                expect(response.body[0]).toHaveProperty("username", mockUsers[0].username);
                expect(response.body[0]).toHaveProperty("email", mockUsers[0].email);
                expect(response.body[0]).toHaveProperty("plan", mockUsers[0].plan);
                expect(response.body[0]).toHaveProperty("rol", mockUsers[0].rol);
                expect(response.body[0].listaLecturasId).toEqual(expect.arrayContaining(mockUsers[0].listaLecturasId));
                expect(response.body[0].resenasId).toEqual(expect.arrayContaining(mockUsers[0].resenasId));
 
                expect(mockUsers[0].cleanup).toHaveBeenCalled();
            });
        });

        it("Debe retornar un error 500 si ocurre un problema con la base de datos", async () => {
            jest.spyOn(User, "find").mockRejectedValue(new Error("Database error"));
 
            return request(app).get('/api/v1/auth/users').then((response) => {
                expect(response.statusCode).toBe(500);
            });
        });        
    });

    describe("GET /api/v1/auth/users/:id", () => {
        const mockUserId = new mongoose.Types.ObjectId(); 
        const mockUser = new User({
          _id: mockUserId,
          nombre: "Juan",
          apellidos: "Pérez",
          username: "juanperez",
          email: "juan@example.com",
          password: "hashedpassword",
          plan: "Plan1",
          rol: "User",
          listaLecturasId: ["123"],
          numDescargas: 5,
          resenasId: ["456"]
        });
        beforeEach(() => {
          jest.clearAllMocks();
        });
        it("Debe obtener los detalles de un usuario (200)", async () => {
          jest.spyOn(User, "findById").mockResolvedValue(mockUser);
          const response = await request(app)
            .get(`/api/v1/auth/users/${mockUserId}`) 
            .then((response) => {
              expect(response.statusCode).toBe(200);
              expect(response.body).toHaveProperty("id", mockUser._id.toString());
              expect(response.body).toHaveProperty("nombre", mockUser.nombre);
              expect(response.body).toHaveProperty("apellidos", mockUser.apellidos);
              expect(response.body).toHaveProperty("username", mockUser.username);
              expect(response.body).toHaveProperty("email", mockUser.email);
              expect(response.body).toHaveProperty("plan", mockUser.plan);
              expect(response.body).toHaveProperty("rol", mockUser.rol);
              expect(response.body.listaLecturasId).toEqual(expect.arrayContaining(mockUser.listaLecturasId));
              expect(response.body.resenasId).toEqual(expect.arrayContaining(mockUser.resenasId));
            });
        });
        it("Debe retornar 404 si el usuario no existe", async () => {
          jest.spyOn(User, "findById").mockResolvedValue(null);
          const response = await request(app)
            .get(`/api/v1/auth/users/${mockUserId}`)
            .then((response) => {
              expect(response.statusCode).toBe(404);
              expect(response.body).toHaveProperty("message", "Usuario no encontrado");
            });
        });
        it("Debe retornar 500 si ocurre un problema con la base de datos", async () => {
          jest.spyOn(User, "findById").mockRejectedValue(new Error("Database error"));
          const response = await request(app)
            .get(`/api/v1/auth/users/${mockUserId}`)
            .then((response) => {
              expect(response.statusCode).toBe(500);
            });
        });
    });

    describe('PUT /api/v1/auth/users/:id', () => {
        const mockUserId = new mongoose.Types.ObjectId(); 
      
        const mockUser = new User({
          _id: mockUserId,
          nombre: "Juan",
          apellidos: "Pérez",
          username: "juanperez",
          email: "juan@example.com",
          password: "hashedpassword",
          plan: "Plan1",
          rol: "User",
          listaLecturasId: ["123"],
          numDescargas: 5,
          resenasId: ["456"]
        });
      
        const updatedUserData = {
          nombre: "Juan Carlos",
          apellidos: "Pérez Fernández",
          username: "juancarlosperez",
          email: "juancarlos@example.com",
          plan: "Plan2",
          rol: "Admin"
        };
      
        beforeEach(() => {
          jest.clearAllMocks();
        });
      
        it('Debe actualizar los detalles de un usuario (200)', async () => {
          jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      
          jest.spyOn(mockUser, 'save').mockResolvedValue(mockUser);
      
          const response = await request(app)
            .put(`/api/v1/auth/users/${mockUserId}`)
            .send(updatedUserData);
      
          expect(response.statusCode).toBe(200);
      
          expect(response.body).toHaveProperty('nombre', updatedUserData.nombre);
          expect(response.body).toHaveProperty('apellidos', updatedUserData.apellidos);
          expect(response.body).toHaveProperty('username', updatedUserData.username);
          expect(response.body).toHaveProperty('email', updatedUserData.email);
          expect(response.body).toHaveProperty('plan', updatedUserData.plan);
          expect(response.body).toHaveProperty('rol', updatedUserData.rol);
        });
      
        it('Debe retornar 404 si el usuario no existe', async () => {
          jest.spyOn(User, 'findById').mockResolvedValue(null);
      
          const response = await request(app)
            .put(`/api/v1/auth/users/${mockUserId}`)
            .send(updatedUserData);
      
          expect(response.statusCode).toBe(404);
          expect(response.body).toHaveProperty('message', 'Usuario no encontrado');
        });
      
        it('Debe retornar 500 si ocurre un problema con la base de datos', async () => {
          jest.spyOn(User, 'findById').mockRejectedValue(new Error('Database error'));
      
          const response = await request(app)
            .put(`/api/v1/auth/users/${mockUserId}`)
            .send(updatedUserData);
      
          expect(response.statusCode).toBe(500);
        });
    });

    describe("DELETE /api/v1/auth/users/:id", () => {
        const mockUserId = new mongoose.Types.ObjectId();
        const mockUser = {
          _id: mockUserId,
          nombre: "Juan",
          apellidos: "Pérez",
          username: "juanperez",
          email: "juan@example.com",
          password: "hashedpassword",
          plan: "Plan1",
          rol: "User",
          listaLecturasId: ["123"],
          numDescargas: 5,
          resenasId: ["456"]
        };
      
        beforeEach(() => {
          jest.clearAllMocks();
        });
      
        it("Debe eliminar un usuario con un ID válido (200)", async () => {
            jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(mockUser);
          
            const response = await request(app)
              .delete(`/api/v1/auth/users/${mockUser._id}`)
              .set('Authorization', 'Bearer token'); 
          
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Usuario eliminado");
            expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id.toString()); 
          });
          
      
        it("Debe retornar 400 si el ID es inválido", async () => {
          const invalidId = "12345"; 
      
          const response = await request(app)
            .delete(`/api/v1/auth/users/${invalidId}`)
            .set('Authorization', 'Bearer token'); 

          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("message", "ID inválido");
        });
      
        it("Debe retornar 404 si el usuario no existe", async () => {
          jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(null);
      
          const response = await request(app)
            .delete(`/api/v1/auth/users/${mockUser._id}`)
            .set('Authorization', 'Bearer token'); 
      
          expect(response.statusCode).toBe(404);
          expect(response.body).toHaveProperty("message", "Usuario no encontrado");
        });
      
        it("Debe retornar 500 si ocurre un problema con la base de datos", async () => {
          jest.spyOn(User, "findByIdAndDelete").mockRejectedValue(new Error("Database error"));
      
          const response = await request(app)
            .delete(`/api/v1/auth/users/${mockUser._id}`)
            .set('Authorization', 'Bearer token'); 
      
          expect(response.statusCode).toBe(500);
        });
    });

    describe("PATCH /users/:username/downloads", () => {
        const mockUser = {
          _id: new mongoose.Types.ObjectId(),
          username: "juanperez",
          numDescargas: 5,
        };
      
        const newDownloadCount = 10;
        const invalidUsername = "nonexistentuser";
      
        beforeEach(() => {
          jest.clearAllMocks();
        });
      
        it("Debe retornar 400 si no se proporciona 'numDescargas'", async () => {
          const response = await request(app)
            .patch(`/api/v1/auth/users/${mockUser.username}/downloads`)
            .send({});  
      
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("error", "'numDescargas' is required.");
        });
      
        it("Debe retornar 404 si el usuario no existe", async () => {
          jest.spyOn(User, "findOneAndUpdate").mockResolvedValue(null);
      
          const response = await request(app)
            .patch(`/api/v1/auth/users/${invalidUsername}/downloads`)
            .send({ numDescargas: newDownloadCount });
      
          expect(response.statusCode).toBe(404);
          expect(response.body).toHaveProperty("error", "Usuario no encontrado.");
        });
      
        it("Debe actualizar el número de descargas de un usuario (200)", async () => {
          const updatedUser = { ...mockUser, numDescargas: newDownloadCount };
          jest.spyOn(User, "findOneAndUpdate").mockResolvedValue(updatedUser);
      
          const response = await request(app)
            .patch(`/api/v1/auth/users/${mockUser.username}/downloads`)
            .send({ numDescargas: newDownloadCount });
      
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("message", "El número de descargas del usuario se ha actualizado éxitosamente.");
          expect(response.body.user).toHaveProperty("numDescargas", newDownloadCount);
        });
      
        it("Debe retornar 400 si la validación falla", async () => {
          const validationError = new Error("Fallo en la validación.");
          validationError.name = "ValidationError";
          jest.spyOn(User, "findOneAndUpdate").mockRejectedValue(validationError);
      
          const response = await request(app)
            .patch(`/api/v1/auth/users/${mockUser.username}/downloads`)
            .send({ numDescargas: newDownloadCount });
      
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("error", "Fallo en la validación. Compruebe los datos proporcionados.");
        });
      
        it("Debe retornar 500 si ocurre un error inesperado", async () => {
          const unexpectedError = new Error("Error en el servidor");
          jest.spyOn(User, "findOneAndUpdate").mockRejectedValue(unexpectedError);
      
          const response = await request(app)
            .patch(`/api/v1/auth/users/${mockUser.username}/downloads`)
            .send({ numDescargas: newDownloadCount });
      
          expect(response.statusCode).toBe(500);
          expect(response.body).toHaveProperty("message", "Ha ocurrido un error inesperado en el servidor");
        });
    });

    describe("POST /users/register", () => {
        const newUser = {
            nombre: "Juan",
            apellidos: "Pérez",
            username: "juanperez",
            email: "juan@example.com",
            password: "juan123",
            plan: "Plan1", 
            rol: "User" 
        };
    
        const mockUser = {
            nombre: "Juan",
            apellidos: "Pérez",
            username: "juanperez",
            email: "juan@example.com",
            password: "juan123",
            plan: "Plan1",
            rol: "User"
        };
    
        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        it('Debe registrar un usuario exitosamente', async () => {
            const userData = {
              nombre: 'Kristina',
              apellidos: 'Lacasta',
              username: 'kristina123',
              password: 'password123',
              email: 'kristina@example.com',
              plan: 'premium',
              rol: 'user'
            };
        
            const saveMock = jest.spyOn(User.prototype, 'save').mockResolvedValue(userData);
        
            const response = await request(app)
              .post('/api/v1/auth/users/register')
              .send(userData)
              .expect(201);
        
            expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
        
            expect(saveMock).toHaveBeenCalledTimes(1);
        
            saveMock.mockRestore();
          }); 
        
        it("Debe retornar 409 si el email o username ya están en uso", async () => {
          const error = new Error();
          error.code = 11000; 
          jest.spyOn(User.prototype, "save").mockRejectedValue(error);
      
          const response = await request(app)
            .post('/api/v1/auth/users/register')
            .send(newUser);
      
          expect(response.statusCode).toBe(409);
          expect(response.body).toHaveProperty("message", "El username o el email ya está en uso");
        });
      
        it("Debe retornar 400 si ocurre un error al registrar el usuario", async () => {
          jest.spyOn(User.prototype, "save").mockRejectedValue(new Error("Error de base de datos"));
      
          const response = await request(app)
            .post('/api/v1/auth/users/register')
            .send(newUser);
      
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("message", "Error al registrar usuario");
          expect(response.body).toHaveProperty("error", "Error de base de datos");
        });
    });

    /*
    describe("GET /users/:id/readings", () => {
        const userId = "12345";
        const token = "valid-jwt-token";
      
        beforeEach(() => {
          jest.clearAllMocks();
        });
      
        it("Debe retornar 401 si el token de autorización falta", async () => {
          const response = await request(app)
            .get(`/api/v1/auth/users/${userId}/readings`);
      
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("message", "Token de autorización faltante.");
        });
      
        it("Debe retornar 200 si las lecturas son obtenidas correctamente", async () => {
          const mockResponse = {
            data: {
              genres: ["Ficción", "Historia", "Ciencia"]
            }
          };
          jest.spyOn(axios, "get").mockResolvedValue(mockResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/${userId}/readings`)
            .set('Authorization', token);
      
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("message", "Listas de lectura obtenidas con éxito.");
          expect(response.body).toHaveProperty("readings");
          expect(response.body.readings).toEqual(mockResponse.data.genres);
        });
      
        it("Debe retornar 404 si no se encuentran lecturas para el usuario", async () => {
          const mockResponse = {
            data: {
              genres: [] 
            }
          };
          jest.spyOn(axios, "get").mockResolvedValue(mockResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/${userId}/readings`)
            .set('Authorization', token);
      
          expect(response.statusCode).toBe(404);
          expect(response.body).toHaveProperty("message", "No se encontraron lecturas para este usuario.");
        });
      
        it("Debe retornar 401 si el token es inválido o no autorizado", async () => {
          const mockErrorResponse = {
            response: {
              status: 401,
              data: { message: "Token inválido" }
            }
          };
          jest.spyOn(axios, "get").mockRejectedValue(mockErrorResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/${userId}/readings`)
            .set('Authorization', "invalid-jwt-token");
      
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("message", "No autorizado: Token inválido o faltante.");
        });
      
        it("Debe retornar 500 si ocurre un error inesperado del servidor", async () => {
          const mockErrorResponse = {
            message: "Error inesperado en el servidor"
          };
          jest.spyOn(axios, "get").mockRejectedValue(mockErrorResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/${userId}/readings`)
            .set('Authorization', token);
      
          expect(response.statusCode).toBe(500);
          expect(response.body).toHaveProperty("message", "Error inesperado en el servidor.");
          expect(response.body).toHaveProperty("error", "Error inesperado en el servidor");
        });
      });

      describe("GET /users/reviews/user/:userId/book", () => {
        const userId = "12345";
        const token = "valid-jwt-token";
      
        beforeEach(() => {
          jest.clearAllMocks();
        });
          
      
        it("Debe retornar 200 si las reseñas del usuario se obtienen correctamente", async () => {
          const mockResponse = {
            data: [
              { bookId: "1", review: "Excelente libro", rating: 5 },
              { bookId: "2", review: "Muy bueno", rating: 4 }
            ]
          };
          jest.spyOn(axios, "get").mockResolvedValue(mockResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/reviews/user/${userId}/book`)
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("message", "Reseñas del usuario para libros obtenidas exitosamente.");
          expect(response.body).toHaveProperty("reviews");
          expect(response.body.reviews).toEqual(mockResponse.data);
        });
      
        it("Debe retornar 404 si no se encuentran reseñas para el usuario", async () => {
          const mockResponse = {
            data: [] 
          };
         
          jest.spyOn(axios, "get").mockResolvedValue(mockResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/reviews/user/${userId}/book`)
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.statusCode).toBe(404);
          expect(response.body).toHaveProperty("message", "No se encontraron reseñas para este usuario.");
        });
      
        it("Debe retornar 401 si el token es inválido o no autorizado", async () => {
          const mockErrorResponse = {
            response: {
              status: 401,
              data: { message: "Token inválido" }
            }
          };
          jest.spyOn(axios, "get").mockRejectedValue(mockErrorResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/reviews/user/${userId}/book`)
            .set('Authorization', "Bearer invalid-jwt-token");
      
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("message", "No autorizado: verifica tu token.");
        });
      
        it("Debe retornar 500 si ocurre un error inesperado en el servidor", async () => {
          const mockErrorResponse = {
            message: "Error inesperado en el servidor"
          };
          jest.spyOn(axios, "get").mockRejectedValue(mockErrorResponse);
      
          const response = await request(app)
            .get(`/api/v1/auth/users/reviews/user/${userId}/book`)
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.statusCode).toBe(500);
          expect(response.body).toHaveProperty("message", "Error inesperado en el servidor.");
          expect(response.body).toHaveProperty("error", "Error inesperado en el servidor");
        });
      });

       */
      describe("POST /users/login", () => {
        const userCredentials = {
          email: "juan@example.com",
          password: "juan123", 
        };
      
        const mockUser = {
          email: "juan@example.com",
          password: "juan123", 
        };
      
        beforeEach(() => {
          jest.clearAllMocks();
        });
      
        // it("Debe iniciar sesión exitosamente (200)", async () => {
        //   // Simular que User.findOne devuelve el mockUser cuando se pasa el email correcto
        //   jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
          
        //   // Simulamos que generateToken devuelve un token mockeado
        //   const { generateToken } = require('../authentication/generateToken');
        //   generateToken.mockReturnValue("mocked-jwt-token");
      
        //   // Realizamos la solicitud de inicio de sesión
        //   const response = await request(app)
        //     .post('/api/v1/auth/users/login')
        //     .send(userCredentials);
      
        //   // Aseguramos que la respuesta sea 200
        //   expect(response.statusCode).toBe(200);
        //   expect(response.body).toHaveProperty("message", "Inicio de sesión exitoso");
        //   expect(response.body).toHaveProperty("token", "mocked-jwt-token");
      
        //   // Verificamos que se haya llamado a User.findOne con el email y la contraseña correctos
        //   expect(User.findOne).toHaveBeenCalledWith({
        //     email: userCredentials.email,
        //     password: userCredentials.password, // Compara también la contraseña en la simulación
        //   });
      
        //   // Verificamos que la contraseña que se pasó coincida con la que se simuló en mockUser
        //   expect(userCredentials.password).toBe(mockUser.password);
      
        //   // Verificamos que generateToken haya sido llamado correctamente con el mockUser
        //   expect(generateToken).toHaveBeenCalledWith(mockUser);
        // });

        it("Debe retornar 404 si el usuario no se encuentra (usuario no encontrado)", async () => {
          jest.spyOn(User, "findOne").mockResolvedValue(null);
      
          const response = await request(app)
            .post('/api/v1/auth/users/login')
            .send(userCredentials);
      
          expect(response.statusCode).toBe(404);
          expect(response.body).toHaveProperty("message", "Usuario no encontrado");
        });
      
        it("Debe retornar 400 si ocurre un error al iniciar sesión", async () => {
          jest.spyOn(User, "findOne").mockRejectedValue(new Error("Error de base de datos"));
      
          const response = await request(app)
            .post('/api/v1/auth/users/login')
            .send(userCredentials);
      
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("message", "Error al iniciar sesión");
          expect(response.body).toHaveProperty("error", "Error de base de datos");
        });
      });
});