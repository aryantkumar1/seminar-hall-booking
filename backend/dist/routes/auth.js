"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("@/controllers/authController");
const validation_1 = require("@/middleware/validation");
const auth_1 = require("@/middleware/auth");
const router = express_1.default.Router();
router.post('/register', validation_1.validateUserRegistration, authController_1.register);
router.post('/login', validation_1.validateUserLogin, authController_1.login);
router.get('/me', auth_1.authenticateToken, authController_1.getCurrentUser);
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, authController_1.getAllUsers);
router.put('/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, authController_1.updateUser);
router.delete('/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, authController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=auth.js.map