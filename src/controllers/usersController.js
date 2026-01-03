import bcrypt from "bcrypt";
import UsersService from "../services/usersService.js";
import User from "../models/Users.js";

class UsersController {
  static async getAll(_req, res) {
    const users = await UsersService.getAll();
    return res.status(200).json(users);
  }

  static async getSignature(req, res) {
    const user = User.fromRequestParams(req.params);
    const users = await UsersService.getSignature(user);
    return res.status(200).json(users);
  }

  static async register(req, res) {
    try {
      const user = User.fromRequest(req.body);
      const register = await UsersService.register(user);
      return res.status(200).json(register);
    } catch (error) {
      res.status(error.status || 500).json({ msg: error.message });
    }
  }

  static async login(req, res) {
    try {
      const user = User.fromRequestLogin(req.body);
      const login = await UsersService.login(user);
      const response = await UsersService.signToken(user, login);
      return res.status(200).json({ token: response.token, user: response.userData });
    } catch (error) {
      res.status(error.status || 500).json({ msg: error.message });
    }
  }

  static async remove(req, res) {
    const { id } = req.params;
    // Removendo usuário via service/repository
    await UsersService.remove(id);
    return res.status(204).json();
  }
}

// Export named handlers for compatibility with current router imports
export const getSignature = (req, res) => UsersController.getSignature(req, res);
export const getAll = (req, res) => UsersController.getAll(req, res);
export const register = (req, res) => UsersController.register(req, res);
export const login = (req, res) => UsersController.login(req, res);
export const remove = (req, res) => UsersController.remove(req, res);

export default UsersController;
