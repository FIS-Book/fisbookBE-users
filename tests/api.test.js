const app = require('../app');
const request = require('supertest');
const User = require('../models/user');

describe("Users API", () => {
    describe("GET /", () => {
        it("Should return an HTML document", () => {
            return request(app).get("/").then((response) => {
                expect(response.status).toBe(200);
                expect(response.type).toEqual(expect.stringContaining("html"));
                expect(response.text).toEqual(expect.stringContaining("h1"));
            });
        });
    });

    describe("GET /users", () => {
        it("Should return all users", () => {
            const users = [
                new User({ nombre: "Juan", email: "juan@mail.com", plan: "Activo", tipo: "User" }),
                new User({ nombre: "Pepe", email: "pepe@mail.com", plan: "Activo", tipo: "Admin" }),
            ];

            const dbFind = jest.spyOn(User, "find");
            dbFind.mockImplementation(async () => Promise.resolve(users));

            return request(app).get("/api-v1/users").then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe("POST /users", () => {
        const user = new User({ nombre: "Luis", email: "luis@mail.com", plan: "Activo", tipo: "User" });
        var dbSave;
        beforeEach(() => {
            dbSave = jest.spyOn(User.prototype, "save")
        });

        it("Should post a new user if everything is fine", () => {
            dbSave.mockImplementation(async () => Promise.resolve(true));

            return request(app).post("/api-v1/users").send(user).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
            })
        });

        it("Should return 500 if there is a problem with the connection", () => {
            dbSave.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).post("/api-v1/users").send(user).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
            });
        });
    });
});
