# BCMS MCP Server

The backend exposes an MCP Streamable HTTP endpoint at `/mcp`. It uses the
configured BCMS API routes internally, so the normal API-key permissions,
validation, events, and socket notifications continue to apply.

## Connect

Use the URL of your BCMS instance followed by `/mcp`. Send the credential in
the HTTP `Authorization` header:

```text
Authorization: ApiKey <API_KEY_ID>.<API_KEY_SECRET>
```

An administrator JWT is also accepted:

```text
Authorization: Bearer <JWT>
```

The endpoint is stateless and accepts MCP JSON-RPC requests with `POST`.
Configure the MCP client to send the authorization header on every request.

## Tools

- `templates_list`: list available template schemas.
- `template_create`: create a template and optional fields.
- `languages_list`: list configured language codes.
- `entry_statuses_list`: list configured entry statuses.
- `entries_list`: list entries for a template.
- `entry_get`: retrieve a complete entry.
- `entry_create`: create an entry using the template's property IDs and BCMS
  property value format.
- `entry_update`: replace one language's property values and rich-text nodes.
- `entry_publish`: set one language to an existing status ID while preserving
  its saved content.

`entry_create` and `entry_update` expect the BCMS content model: metadata values
are `{ "id": "<template-property-id>", "data": ... }` objects, and rich-text
content is an array of the same ProseMirror nodes used by the BCMS editor. Use
`templates_list` to inspect property IDs and `entry_statuses_list` to identify
the status ID used for publication in this instance. API Keys must have the
required access to the relevant template.

`template_create` supports `STRING`, `NUMBER`, `BOOLEAN`, `DATE`, `MEDIA`, and
`RICH_TEXT` fields. Pointer and enumeration fields need references or options
that are not yet exposed by this MCP tool.
