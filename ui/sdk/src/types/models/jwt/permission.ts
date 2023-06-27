// eslint-disable-next-line no-shadow
export enum BCMSJwtPermissionName {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
}

export interface BCMSJwtPermission {
  name: BCMSJwtPermissionName;
}
