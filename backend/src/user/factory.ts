import type {
    User,
    UserProtected,
} from '@bcms/selfhosted-backend/user/models/main';
import { ObjectId } from '@fastify/mongodb';

export class UserFactory {
    static create(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): User {
        return {
            _id: new ObjectId().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }

    static toProtected(user: User): UserProtected {
        return {
            _id: user._id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles: user.roles,
            customPool: user.customPool,
            email: user.email,
            username: user.username,
        };
    }
}
