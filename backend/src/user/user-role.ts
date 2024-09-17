import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import type { UserRoleName } from '@bcms/selfhosted-backend/user/models/role';

export function checkUserRole(
    roles: UserRoleName[],
    user?: UserProtected,
): boolean {
    if (!user) {
        return false;
    }
    return !!user.roles.find((e) => roles.includes(e.name));
}

export function isUserAdmin(user?: UserProtected): boolean {
    return checkUserRole(['ADMIN'], user);
}
