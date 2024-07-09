import {
    type ObjectSchema,
    ObjectUtility,
    ObjectUtilityError,
} from '@thebcms/selfhosted-backend/_utils/object-utility';
import type { SocketEventHandler } from '@thebcms/selfhosted-backend/server/modules/socket';

export function createSocketEventHandler<Data = unknown>(
    dataSchema: ObjectSchema,
    handler: SocketEventHandler<Data>,
): SocketEventHandler<Data> {
    return async (data, conn) => {
        const dataCheck = ObjectUtility.compareWithSchema(
            data,
            dataSchema,
            'data',
        );
        if (dataCheck instanceof ObjectUtilityError) {
            console.warn('socketEventHandler.error', {
                reason: dataCheck.message,
                data,
                conn,
            });
            return;
        }
        try {
            await handler(data, conn);
        } catch (err) {
            console.error(err);
        }
    };
}
