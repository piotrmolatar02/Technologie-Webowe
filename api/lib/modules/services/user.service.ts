import UserModel from '../schemas/user.schema';
import { IUser } from '../models/user.model';

class UserService {
    public async createNewOrUpdate(user: IUser) {
        try {
            if (!user._id) {
                const dataModel = new UserModel(user);
                return await dataModel.save();
            } else {
                return await UserModel.findByIdAndUpdate(user._id, { $set: user }, { new: true });
            }
        } catch (error) {
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }

    public async getByEmailOrName(name: string) {
        try {
            const result = await UserModel.findOne({ $or: [{ email: name }, { name: name }] });
            if (result) {
                return result;
            }
        } catch (error) {
            throw new Error('Wystąpił błąd podczas pobierania danych');
        }
    }

    public async deleteById(userId: string) {
        try {
            const deletedUser = await UserModel.findByIdAndDelete(userId);
            return deletedUser;
        } catch (error) {
            throw new Error('Wystąpił błąd podczas usuwania użytkownika');
        }
    }

    public async getAll() {
    const users = await UserModel.find().select('-password');
    console.log('getAll users:', users);
    return users;
}

    public async changeUserRole(userId: string, role: string, isAdmin: boolean) {
        return await UserModel.findByIdAndUpdate(userId, {
            $set: { role, isAdmin }
        }, { new: true });
    }
}

export default UserService;
