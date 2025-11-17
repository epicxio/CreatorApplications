"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePermission = exports.addPermission = exports.deleteRole = exports.updateRole = exports.getRole = exports.getRoles = exports.createRole = void 0;
const Role_1 = __importDefault(require("../models/Role"));
function isErrorWithMessage(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string');
}
function toErrorWithMessage(maybeError) {
    if (isErrorWithMessage(maybeError))
        return maybeError;
    try {
        return new Error(JSON.stringify(maybeError));
    }
    catch {
        return new Error(String(maybeError));
    }
}
function getErrorMessage(error) {
    return toErrorWithMessage(error).message;
}
const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const role = new Role_1.default({
            name,
            description,
            permissions
        });
        await role.save();
        res.status(201).json(role);
    }
    catch (error) {
        res.status(400).json({ message: getErrorMessage(error) });
    }
};
exports.createRole = createRole;
const getRoles = async (req, res) => {
    try {
        const roles = await Role_1.default.find({ isActive: true });
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
exports.getRoles = getRoles;
const getRole = async (req, res) => {
    try {
        const role = await Role_1.default.findById(req.params.id);
        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
exports.getRole = getRole;
const updateRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const role = await Role_1.default.findById(req.params.id);
        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }
        role.name = name || role.name;
        role.description = description || role.description;
        role.permissions = permissions || role.permissions;
        await role.save();
        res.json(role);
    }
    catch (error) {
        res.status(400).json({ message: getErrorMessage(error) });
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    try {
        const role = await Role_1.default.findById(req.params.id);
        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }
        role.isActive = false;
        await role.save();
        res.json({ message: 'Role deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: getErrorMessage(error) });
    }
};
exports.deleteRole = deleteRole;
const addPermission = async (req, res) => {
    try {
        const { resource, actions } = req.body;
        const role = await Role_1.default.findById(req.params.id);
        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }
        role.permissions.push({ resource, actions });
        await role.save();
        res.json(role);
    }
    catch (error) {
        res.status(400).json({ message: getErrorMessage(error) });
    }
};
exports.addPermission = addPermission;
const removePermission = async (req, res) => {
    try {
        const { resource } = req.body;
        const role = await Role_1.default.findById(req.params.id);
        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }
        role.permissions = role.permissions.filter(p => p.resource !== resource);
        await role.save();
        res.json(role);
    }
    catch (error) {
        res.status(400).json({ message: getErrorMessage(error) });
    }
};
exports.removePermission = removePermission;
