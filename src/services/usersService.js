import UsersRepository from "../repositories/usersRepository.js";
import ValidationError from "../utils/ValidationError.js";
import jwt from "jsonwebtoken";

class UsersService {
  static async getAll() {
    return UsersRepository.getAll();
  }

  static async getSignature(user) {
    return UsersRepository.getSignature(user);
  }

  static async checkUsersExists(user) {
    return UsersRepository.checkUsersExists(user);
  }

  static async register(user) {
    const checkExists = await this.checkUsersExists(user);

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
    const passwordHash = await bcrypt.hash(password, salt);
    user.passwordHash = passwordHash;

    return UsersRepository.register(user);
  }

  static async login(user) {
    const userResult = UsersRepository.login(user);
    const userRow = userResult.rows[0] ?? null;

    if (!userRow) {
      throw new ValidationError("Nome de usuário ou Senha incorreta.", 404);
    }
    const checkPassword = await bcrypt.compare(user.password, userRow.password);
    if (!checkPassword) {
      throw new ValidationError("Nome de usuário ou Senha incorreta.", 404);
    }

    return UsersRepository.login(user);
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

  static async verifyRemoveUser(id) {
    return UsersRepository.verifyRemoveUser(id);
  }

  static async remove(id) {
    return UsersRepository.remove(id);
  }
}

export default UsersService;
