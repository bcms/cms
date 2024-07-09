import type { UserRoleName } from '@thebcms/selfhosted-backend/user/models/role';
import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';

export function userHasRole(
    check: UserRoleName[],
    user?: UserProtected | null,
): boolean {
    if (!user) {
        return false;
    }
    return !!user.roles.find((role) => check.includes(role.name));
}
