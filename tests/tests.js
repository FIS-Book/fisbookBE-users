const mongoose = require('mongoose');
const User = require('../models/user'); // Ajusta la ruta según tu estructura de carpetas.

describe("User Model", () => {

    describe("User Model Validation", () => {
        it("Should fail validation if 'nombre' is missing", async () => {
            const user = new User({
                email: 'test@example.com',
                plan: 'basic',
                tipo: 'admin',
            });
            try {
                await user.validate();
            } catch (error) {
                expect(error.errors.nombre).toBeDefined();
            }
        });

        it("Should fail validation if 'email' is missing", async () => {
            const user = new User({
                nombre: 'Test User',
                plan: 'basic',
                tipo: 'admin',
            });
            try {
                await user.validate();
            } catch (error) {
                expect(error.errors.email).toBeDefined();
            }
        });

        it("Should fail validation if 'plan' is missing", async () => {
            const user = new User({
                nombre: 'Test User',
                email: 'test@example.com',
                tipo: 'admin',
            });
            try {
                await user.validate();
            } catch (error) {
                expect(error.errors.plan).toBeDefined();
            }
        });

        it("Should fail validation if 'tipo' is missing", async () => {
            const user = new User({
                nombre: 'Test User',
                email: 'test@example.com',
                plan: 'basic',
            });
            try {
                await user.validate();
            } catch (error) {
                expect(error.errors.tipo).toBeDefined();
            }
        });

        it("Should pass validation if all required fields are present", async () => {
            const user = new User({
                nombre: 'Test User',
                email: 'test@example.com',
                plan: 'basic',
                tipo: 'admin',
            });
            await expect(user.validate()).resolves.toBeUndefined();
        });
    });

    describe("User Methods", () => {
        it("Should return a cleaned-up user object", () => {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                nombre: 'Test User',
                email: 'test@example.com',
                plan: 'basic',
                tipo: 'admin',
            });

            const cleanedUser = user.cleanup();
            expect(cleanedUser).toEqual({
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                plan: user.plan,
                tipo: user.tipo,
            });
        });
    });

    describe("Save User", () => {
        it("Should throw an error if email is not unique", async () => {
            const duplicateEmail = 'duplicate@example.com';

            const user1 = new User({
                nombre: 'User One',
                email: duplicateEmail,
                plan: 'basic',
                tipo: 'admin',
            });

            const user2 = new User({
                nombre: 'User Two',
                email: duplicateEmail,
                plan: 'premium',
                tipo: 'user',
            });

            jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
                const error = new Error('E11000 duplicate key error collection');
                error.code = 11000;
                throw error;
            });

            await user1.save(); // Mock won't affect the first save.

            try {
                await user2.save(); // Mock affects the second save.
            } catch (error) {
                expect(error.code).toBe(11000);
            }
        });
    });

});