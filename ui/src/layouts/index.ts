import { AuthLayout } from '@thebcms/selfhosted-ui/layouts/auth';
import { NoneLayout } from './none';
import { DashboardLayout } from '@thebcms/selfhosted-ui/layouts/dashboard';

export const layouts = {
    AuthLayout,
    DashboardLayout,
    NoneLayout,
};

export type LayoutNames = keyof typeof layouts;
