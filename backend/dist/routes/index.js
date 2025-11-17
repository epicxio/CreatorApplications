"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleRoutes_1 = __importDefault(require("./roleRoutes"));
const router = express_1.default.Router();
// Register routes
router.use('/roles', roleRoutes_1.default);
exports.default = router;
