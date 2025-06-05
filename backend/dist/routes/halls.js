"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hallController_1 = require("@/controllers/hallController");
const validation_1 = require("@/middleware/validation");
const auth_1 = require("@/middleware/auth");
const router = express_1.default.Router();
router.get('/', hallController_1.getAllHalls);
router.get('/search', hallController_1.searchHalls);
router.get('/capacity', hallController_1.getHallsByCapacity);
router.get('/equipment', hallController_1.getHallsByEquipment);
router.get('/:id', hallController_1.getHallById);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateHallCreation, hallController_1.createHall);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateHallUpdate, hallController_1.updateHall);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, hallController_1.deleteHall);
exports.default = router;
//# sourceMappingURL=halls.js.map