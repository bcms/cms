import { AuthLayout } from '@bcms/selfhosted-ui/layouts/auth';
import { NoneLayout } from './none';
import { DashboardLayout } from '@bcms/selfhosted-ui/layouts/dashboard';

export const layouts = {
    AuthLayout,
    DashboardLayout,
    NoneLayout,
};

export type LayoutNames = keyof typeof layouts;
