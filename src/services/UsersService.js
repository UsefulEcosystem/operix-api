import UsersRepository from "../repositories/UsersRepository.js";
import ValidationError from "../utils/ValidationError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export default class UsersService {
  static async getAll() {
    return UsersRepository.getAll();
  }

  static async getSignature(user) {
    return UsersRepository.getSignature(user);
  }

  static async register(user) {
    const checkExists = await UsersRepository.checkUsersExists(user);

    if (checkExists[0] > 0 && checkExists[1] > 0) {
      throw new ValidationError("Este nome de usuário e email já estão cadastrados.", 422);
    }

    if (checkExists[0] > 0) {
      throw new ValidationError("Este email já tem uma conta ativa.", 422);
    }

    if (checkExists[1] > 0) {
      throw new ValidationError("Este nome de usuário já está sendo utilizado.", 422);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(user.password, salt);
    user.password = passwordHash;

    return UsersRepository.register(user);
  }

  static async login(user) {
    const userResult = await UsersRepository.login(user);
    const userRow = userResult[0] ?? null;

    if (!userRow) {
      throw new ValidationError("Nome de usuário ou Senha incorreta.", 404);
    }
    const checkPassword = await bcrypt.compare(user.password, userRow.password);
    if (!checkPassword) {
      throw new ValidationError("Nome de usuário ou Senha incorreta.", 404);
    }

    return await this.signToken(user, userRow);
  }

  static async signToken(user, login) {
    let expiration = "";
    if (user.remember == true) {
      expiration = "6d";
    } else {
      expiration = "1d";
    }

    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: login.id,
        username: login.username,
        admin: login.admin
      },
      secret,
      { expiresIn: expiration }
    );
    const decoded = jwt.decode(token);
    return { token: token, userData: decoded };
  }

  static async remove(user) {
    const result = await UsersRepository.getById(user);

    if (!result || result.length === 0) {
      throw new ValidationError("Usuário não encontrado.", 404);
    }
    if (result[0].admin === true) {
      throw new ValidationError("Usuário administrador não pode ser removido.", 422);
    }
    
    return UsersRepository.remove(user);
  }
}