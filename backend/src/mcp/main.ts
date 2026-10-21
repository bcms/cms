import type { FastifyInstance, FastifyRequest } from 'fastify';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { Repo } from '@bcms/selfhosted-backend/repo';
import { PropFactory } from '@bcms/selfhosted-backend/prop/factory';
import { PropType } from '@bcms/selfhosted-backend/prop/models/main';
import { entryContentNodeToHtml } from '@bcms/selfhosted-backend/entry/content';
import {
    JWTError,
    JWTManager,
} from '@bcms/selfhosted-backend/_server/modules/jwt';

type ItemsResponse = { items: any[] };

function authHeader(request: FastifyRequest): string {
    const value = request.headers.authorization;
    if (!value) {
        throw new Error(
            'Authorization header is required. Use ApiKey id.secret or Bearer <admin-jwt>.',
        );
    }
    const header = Array.isArray(value) ? value[0] : value;
    if (header.startsWith('ApiKey ')) {
        const [id, secret] = header.slice('ApiKey '.length).split('.');
        if (!id || !secret) {
            throw new Error(
                'Invalid API Key format. Expected ApiKey id.secret.',
            );
        }
        return header;
    }
    if (header.startsWith('Bearer ')) {
        const jwt = JWTManager.get({
            token: header.slice('Bearer '.length),
            roles: ['ADMIN', 'USER'],
        });
        if (jwt instanceof JWTError) {
            throw new Error('Invalid or expired JWT.');
        }
        return header;
    }
    throw new Error('Unsupported authorization scheme. Use ApiKey or Bearer.');
}

function createServer(fastify: FastifyInstance, authorization: string) {
    const server = new McpServer({
        name: 'bcms-content',
        version: '1.0.0',
    });

    async function api<T>(
        method: 'GET' | 'POST' | 'PUT',
        url: string,
        payload?: unknown,
    ): Promise<T> {
        const response: any = await fastify.inject({
            method,
            url,
            headers: { authorization },
            payload: payload as any,
        });
        let data: any;
        try {
            data = response.json();
        } catch {
            data = response.body;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw new Error(
                data?.message || `BCMS API returned ${response.statusCode}`,
            );
        }
        return data as T;
    }

    const textResult = (value: unknown) => ({
        content: [{ type: 'text' as const, text: JSON.stringify(value) }],
    });
    const toolError = (error: unknown) => ({
        content: [
            {
                type: 'text' as const,
                text: error instanceof Error ? error.message : String(error),
            },
        ],
        isError: true,
    });
    const run =
        (handler: (...args: any[]) => Promise<unknown>) =>
        async (...args: any[]) => {
            try {
                return textResult(await handler(...args));
            } catch (error) {
                return toolError(error);
            }
        };

    server.registerTool(
        'templates_list',
        {
            description:
                'List templates visible to this credential, including property schemas.',
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        run(
            async () =>
                (await api<ItemsResponse>('GET', '/api/v4/template/all'))
                    .items || [],
        ),
    );

    server.registerTool(
        'template_create',
        {
            description:
                'Create a content template and optional fields. Access follows the existing BCMS template-create API rules. Supported fields: STRING, NUMBER, BOOLEAN, DATE, MEDIA, RICH_TEXT.',
            inputSchema: {
                label: z.string().min(1),
                description: z.string().default(''),
                singleEntry: z.boolean().default(false),
                fields: z
                    .array(
                        z.object({
                            label: z.string().min(1),
                            type: z.enum([
                                PropType.STRING,
                                PropType.NUMBER,
                                PropType.BOOLEAN,
                                PropType.DATE,
                                PropType.MEDIA,
                                PropType.RICH_TEXT,
                            ]),
                            required: z.boolean().default(false),
                            array: z.boolean().default(false),
                        }),
                    )
                    .default([]),
            },
            annotations: { readOnlyHint: false, destructiveHint: false },
        },
        run(async ({ label, description, singleEntry, fields }) => {
            const created = await api<{ item: any }>(
                'POST',
                '/api/v4/template/create',
                {
                    label,
                    desc: description,
                    singleEntry,
                },
            );
            if (fields.length) {
                const propChanges = fields.map((field: any) => {
                    const prop = PropFactory.create(field.type, field.array);
                    if (!prop) {
                        throw new Error(
                            `Unsupported property type: ${field.type}`,
                        );
                    }
                    return {
                        add: {
                            label: field.label,
                            type: field.type,
                            required: field.required,
                            array: field.array,
                            data: prop.data,
                        },
                    };
                });
                const updated = await api<{ item: any }>(
                    'PUT',
                    '/api/v4/template/update',
                    {
                        _id: created.item._id,
                        propChanges,
                    },
                );
                return updated.item;
            }
            return created.item;
        }),
    );

    server.registerTool(
        'languages_list',
        {
            description:
                'List configured content languages and their language codes.',
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        run(
            async () =>
                (await api<ItemsResponse>('GET', '/api/v4/language/all'))
                    .items || [],
        ),
    );

    server.registerTool(
        'entry_statuses_list',
        {
            description:
                'List configured entry statuses. Use a returned status ID with entry_publish.',
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        run(
            async () =>
                (await api<ItemsResponse>('GET', '/api/v4/entry-status/all'))
                    .items || [],
        ),
    );

    server.registerTool(
        'entries_list',
        {
            description: 'List entries for a template.',
            inputSchema: { templateId: z.string().min(1) },
            annotations: { readOnlyHint: true },
        },
        run(
            async ({ templateId }) =>
                (
                    await api<ItemsResponse>(
                        'GET',
                        `/api/v4/template/${encodeURIComponent(templateId)}/entry/all`,
                    )
                ).items || [],
        ),
    );

    server.registerTool(
        'entry_get',
        {
            description:
                'Read a complete entry, including multilingual metadata and content nodes.',
            inputSchema: {
                templateId: z.string().min(1),
                entryId: z.string().min(1),
            },
            annotations: { readOnlyHint: true },
        },
        run(
            async ({ templateId, entryId }) =>
                (
                    await api<{ item: unknown }>(
                        'GET',
                        `/api/v4/template/${encodeURIComponent(templateId)}/entry/${encodeURIComponent(entryId)}`,
                    )
                ).item,
        ),
    );

    server.registerTool(
        'entry_create',
        {
            description:
                'Create an entry using BCMS PropValue objects from the template schema and ProseMirror content nodes. Set every required metadata property, including Title and Slug.',
            inputSchema: {
                templateId: z.string().min(1),
                language: z
                    .string()
                    .min(1)
                    .describe('Configured language code, for example en.'),
                props: z
                    .array(z.object({ id: z.string(), data: z.unknown() }))
                    .describe('Property values keyed by template property id.'),
                contentNodes: z
                    .array(z.unknown())
                    .default([])
                    .describe('BCMS rich text / ProseMirror document nodes.'),
                statusId: z
                    .string()
                    .optional()
                    .describe('Optional initial entry status ID.'),
            },
            annotations: { readOnlyHint: false, destructiveHint: false },
        },
        run(async ({ templateId, language, props, contentNodes, statusId }) => {
            const languages =
                (await api<ItemsResponse>('GET', '/api/v4/language/all'))
                    .items || [];
            if (!languages.some((item: any) => item.code === language)) {
                throw new Error(`Unknown language code: ${language}`);
            }
            const plainText = contentNodes
                .map((node: any) => entryContentNodeToHtml(node))
                .join('\n');
            const entry = await api<{ item: any }>(
                'POST',
                `/api/v4/template/${encodeURIComponent(templateId)}/entry/create`,
                {
                    statuses: statusId ? [{ lng: language, id: statusId }] : [],
                    meta: [{ lng: language, props }],
                    content: [
                        { lng: language, nodes: contentNodes, plainText },
                    ],
                },
            );
            return entry.item;
        }),
    );

    server.registerTool(
        'entry_update',
        {
            description:
                'Update one language of an entry. Supply the complete metadata property values and rich text nodes for that language.',
            inputSchema: {
                templateId: z.string().min(1),
                entryId: z.string().min(1),
                language: z.string().min(1),
                props: z.array(z.object({ id: z.string(), data: z.unknown() })),
                contentNodes: z.array(z.unknown()).default([]),
                statusId: z.string().optional(),
            },
            annotations: { readOnlyHint: false, destructiveHint: false },
        },
        run(
            async ({
                templateId,
                entryId,
                language,
                props,
                contentNodes,
                statusId,
            }) => {
                const updated = await api<{ item: any }>(
                    'PUT',
                    `/api/v4/template/${encodeURIComponent(templateId)}/entry/update`,
                    {
                        _id: entryId,
                        lng: language,
                        status: statusId,
                        meta: { props },
                        content: { nodes: contentNodes },
                    },
                );
                return updated.item;
            },
        ),
    );

    server.registerTool(
        'entry_publish',
        {
            description:
                'Set an entry language to a configured publication status. The target status must already exist; this updates only the status while preserving that language’s content.',
            inputSchema: {
                templateId: z.string().min(1),
                entryId: z.string().min(1),
                language: z.string().min(1),
                statusId: z.string().min(1),
            },
            annotations: { readOnlyHint: false, destructiveHint: false },
        },
        run(async ({ templateId, entryId, language, statusId }) => {
            const result = await api<{ item: any }>(
                'GET',
                `/api/v4/template/${encodeURIComponent(templateId)}/entry/${encodeURIComponent(entryId)}`,
            );
            const entry = result.item;
            const meta = entry.meta.find(
                (value: any) => value.lng === language,
            );
            const content = entry.content.find(
                (value: any) => value.lng === language,
            );
            if (!meta || !content) {
                throw new Error(
                    `Entry has no saved content for language ${language}.`,
                );
            }
            const updated = await api<{ item: any }>(
                'PUT',
                `/api/v4/template/${encodeURIComponent(templateId)}/entry/update`,
                {
                    _id: entryId,
                    lng: language,
                    status: statusId,
                    meta: { props: meta.props },
                    content: { nodes: content.nodes },
                },
            );
            return updated.item;
        }),
    );

    return server;
}

export function registerMcpEndpoint(fastify: FastifyInstance) {
    fastify.route({
        method: ['GET', 'POST', 'DELETE'],
        url: '/mcp',
        async handler(request, reply) {
            if (request.method !== 'POST') {
                reply.code(405).send({
                    jsonrpc: '2.0',
                    error: { code: -32000, message: 'Method not allowed.' },
                    id: null,
                });
                return;
            }
            let authorization: string;
            try {
                authorization = authHeader(request);
                if (authorization.startsWith('ApiKey ')) {
                    const [id, secret] = authorization.slice(7).split('.');
                    const key = await Repo.apiKey.findById(id);
                    if (!key || key.blocked || key.secret !== secret) {
                        reply
                            .code(401)
                            .send({ message: 'Invalid or blocked API Key.' });
                        return;
                    }
                }
            } catch (error) {
                reply
                    .code(401)
                    .send({
                        message:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                return;
            }

            const server = createServer(fastify, authorization);
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });
            await server.connect(transport);
            reply.raw.once('close', () => {
                void transport.close();
                void server.close();
            });
            reply.hijack();
            try {
                await transport.handleRequest(
                    request.raw,
                    reply.raw,
                    request.body,
                );
            } catch (error) {
                if (!reply.raw.headersSent) {
                    reply.raw.statusCode = 500;
                    reply.raw.end(
                        error instanceof Error ? error.message : String(error),
                    );
                }
            }
        },
    });
}
