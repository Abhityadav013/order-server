
import { ApiError } from "../../utils/ApiError";
import { comparePassword, hashPassword } from "../../utils/passwordHelper";
import { signJwt } from "../../utils/jwtHelper";
import { OAuth2Client } from "google-auth-library";
import { UserRepository } from "../repository/user.repository";

const repo = new UserRepository();

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(googleClientId);

type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export class AuthService {
  async register(input: RegisterInput) {
    const existingEmail = await repo.findByEmail(input.email);
    if (existingEmail) {
      throw new ApiError(400, [{ field: "email", message: "Email already in use" }], "Validation failed");
    }
    const existingPhone = await repo.findByPhone(input.phone);
    if (existingPhone) {
      throw new ApiError(400, [{ field: "phone", message: "Phone already in use" }], "Validation failed");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await repo.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: passwordHash
    });

    const token = signJwt({ sub: user.id.toString(), email: user.email });
    return { user: this.safeUser(user), token };
  }

  async login(input: LoginInput) {
    const user = await repo.findByEmail(input.email);
    if (!user || !user.password) {
      throw new ApiError(401, [{ field: "email", message: "Invalid credentials" }], "Unauthorized");
    }
    const valid = await comparePassword(input.password, user.password);
    if (!valid) {
      throw new ApiError(401, [{ field: "password", message: "Invalid credentials" }], "Unauthorized");
    }
    const token = signJwt({ sub: user.id.toString(), email: user.email });
    return { user: this.safeUser(user), token };
  }

  async googleLogin(idToken: string) {
    if (!googleClientId) {
      throw new ApiError(500, [], "Google Client ID not configured");
    }
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId
      });
    } catch {
      throw new ApiError(400, [{ message: "Invalid Google token" }], "Bad Request");
    }
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new ApiError(400, [{ message: "Google token missing email" }], "Bad Request");
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await repo.findByGoogleId(googleId!);
    if (!user) {
      // If a user with same email exists (registered via email/password), link it
      const existingByEmail = await repo.findByEmail(email);
      if (existingByEmail) {
        user = await repo.updateById(existingByEmail.id.toString(), {
          googleId,
          picture: picture || existingByEmail.picture
        });
      } else {
        user = await repo.create({
          name: name || email.split("@")[0],
          email,
          phone: `g-${googleId}`, // placeholder phone to satisfy unique constraint
          googleId,
          picture
        });
      }
    }

    if (!user) {
      throw new ApiError(400, [{ message: "Failed to create or find user" }], "Bad Request");
    }

    const token = signJwt({ sub: user.id.toString(), email: user.email });
    return { user: this.safeUser(user), token };
  }

  private safeUser(user: any) {
    const { _id, name, email, phone, picture, googleId, createdAt, updatedAt } = user;
    return { id: _id, name, email, phone, picture, googleId, createdAt, updatedAt };
  }
}
