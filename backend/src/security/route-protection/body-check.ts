import {
    type ObjectSchema,
    ObjectUtility,
    ObjectUtilityError,
} from '@bcms/selfhosted-backend/_utils/object-utility';
import {
    type HttpErrorHandler,
    HttpStatus,
} from '@bcms/selfhosted-backend/_server';

export class RPBodyCheck {
    verify<Body = unknown>(
        body: unknown,
        schema: ObjectSchema,
        errorHandler: HttpErrorHandler,
    ): Body {
        const bodyCheck = ObjectUtility.compareWithSchema(body, schema, 'body');
        if (bodyCheck instanceof ObjectUtilityError) {
            throw errorHandler(HttpStatus.Forbidden, bodyCheck.message);
        }
        return body as Body;
    }
}
