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
                new User({"name": "juan", "phone": "555"}),
                new User({"name": "pepe", "phone": "1232"}),
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
        it("Should post a new user", () => {

        })
    })
});
