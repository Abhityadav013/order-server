import UserInfo, { IUserInfo } from "../models/user-details.model";
import { User, IUser } from "../models/user.model";

export class UserRepository {
  async create(user: Partial<IUser>): Promise<IUser> {
    return User.create(user);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return User.findOne({ phone });
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId });
  }

  async updateById(id: string, update: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, update, { new: true });
  }

  async findByDeviceId(deviceId: string, tid: string): Promise<IUserInfo | null> {
    return UserInfo.findOne({ deviceId: deviceId, tid: tid });
  }
}
