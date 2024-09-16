import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Logger } from '@thebcms/selfhosted-backend/_server/logger';

export class HttpStatus {
    public static readonly 'Continue' = 100;
    public static readonly 'SwitchingProtocols' = 101;
    public static readonly 'Processing' = 102;
    public static readonly 'EarlyHints' = 103;
    public static readonly 'OK' = 200;
    public static readonly 'Created' = 201;
    public static readonly 'Accepted' = 202;
    public static readonly 'NonAuthoritativeInformation' = 203;
    public static readonly 'NoContent' = 204;
    public static readonly 'ResetContent' = 205;
    public static readonly 'PartialContent' = 206;
    public static readonly 'MultiStatu' = 207;
    public static readonly 'AlreadyReported' = 208;
    public static readonly 'IMUsed' = 226;
    public static readonly 'MultipleChoices' = 300;
    public static readonly 'MovedPermanently' = 301;
    public static readonly 'Found' = 302;
    public static readonly 'SeeOther' = 303;
    public static readonly 'NotModified' = 304;
    public static readonly 'UseProxy' = 305;
    public static readonly 'TemporaryRedirect' = 307;
    public static readonly 'PermanentRedirect' = 308;
    public static readonly 'BadRequest' = 400;
    public static readonly 'Unauthorized' = 401;
    public static readonly 'PaymentRequired' = 402;
    public static readonly 'Forbidden' = 403;
    public static readonly 'NotFound' = 404;
    public static readonly 'MethodNotAllowed' = 405;
    public static readonly 'NotAcceptable' = 406;
    public static readonly 'ProxyAuthenticationRequired' = 407;
    public static readonly 'RequestTimeout' = 408;
    public static readonly 'Conflict' = 409;
    public static readonly 'Gone' = 410;
    public static readonly 'LengthRequired' = 411;
    public static readonly 'PreconditionFailed' = 412;
    public static readonly 'PayloadTooLarge' = 413;
    public static readonly 'URITooLong' = 414;
    public static readonly 'UnsupportedMediaType' = 415;
    public static readonly 'RangeNotSatisfiable' = 416;
    public static readonly 'ExpectationFailed' = 417;
    public static readonly 'ImaTeapot' = 418;
    public static readonly 'MisdirectedRequest' = 421;
    public static readonly 'UnprocessableEntity' = 422;
    public static readonly 'Locked' = 423;
    public static readonly 'FailedDependency' = 424;
    public static readonly 'TooEarly' = 425;
    public static readonly 'UpgradeRequired' = 426;
    public static readonly 'PreconditionRequired' = 428;
    public static readonly 'TooManyRequests' = 429;
    public static readonly 'RequestHeaderFieldsTooLarge' = 431;
    public static readonly 'UnavailableForLegalReasons' = 451;
    public static readonly 'InternalServerError' = 500;
    public static readonly 'NotImplemented' = 501;
    public static readonly 'BadGateway' = 502;
    public static readonly 'ServiceUnavailable' = 503;
    public static readonly 'GatewayTimeout' = 504;
    public static readonly 'HTTPVersionNotSupported' = 505;
    public static readonly 'VariantAlsoNegotiates' = 506;
    public static readonly 'InsufficientStorage' = 507;
    public static readonly 'LoopDetected' = 508;
    public static readonly 'BandwidthLimitExceeded' = 509;
    public static readonly 'NotExtended' = 510;
    public static readonly 'NetworkAuthenticationRequired' = 511;
}
/**
 * Object understandable by the Serval controller method wrapper.
 * If this object is thrown from a controller method handler, exception
 * payload will be sent to the client and information about exception
 * will be logged.
 */
export class HttpException<Message = unknown> {
    constructor(
        /**
         * Status of the response (non 200)
         */
        public status: number,
        /**
         * Message/payload which will be sent to the client.
         */
        public message: Message | { message: Message },
        /**
         * Error stack.
         */
        public stack: string[],
    ) {}
}

export interface HTTPErrorErrorConfig {
    /**
     * Place in the code where error handler is used.
     */
    place: string;
    /**
     * Parent logger object or any Serval logger object.
     */
    logger: Logger;
}

/**
 * Object for generating controller exception objects.
 */
export interface HttpErrorHandler extends HTTPErrorErrorConfig {
    <Message = unknown>(
        status: number,
        message: Message,
    ): HttpException<Message>;
}

/**
 * Creates an HTTP error object which is used for throwing controlled
 * HTTP exceptions.
 */
export function createHttpErrorHandler(
    config: HTTPErrorErrorConfig,
): HttpErrorHandler {
    return Object.assign(
        <Message = unknown>(status: number, message: Message) => {
            return new HttpException<Message>(
                status,
                typeof message === 'object' ? message : { message },
                (new Error().stack as string).split('\n'),
            );
        },
        {
            place: config.place,
            logger: config.logger,
        },
    );
}

export function defaultHttpErrorHandler(
    error: unknown,
    request: FastifyRequest,
    replay: FastifyReply,
    logger: Logger,
) {
    const exception = error as unknown as HttpException;
    if (exception.status && exception.message) {
        logger.warn(request.url, error);
        if (typeof exception.message === 'object') {
            replay.code(exception.status).send(exception.message);
        } else {
            replay.code(exception.status).send({ message: exception.message });
        }
    } else {
        logger.error(request.url, {
            method: request.method,
            path: request.url,
            error: {
                message: (error as Error).message,
                stack: (error as Error).stack
                    ? ((error as Error).stack as string).split('\n')
                    : '',
            },
        });
        replay.code(500).send({ message: 'Unknown exception' });
    }
}
