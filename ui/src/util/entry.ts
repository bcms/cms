import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import type { Entry } from '@thebcms/selfhosted-backend/entry/models/main';
import { propValuesFromSchema } from '@thebcms/selfhosted-ui/util/prop';
import type { EntryMeta } from '@thebcms/selfhosted-backend/entry/models/meta';
import type {
    EntryContent,
    EntryContentNode,
    EntryContentNodeWidgetAttr,
} from '@thebcms/selfhosted-backend/entry/models/content';

export async function entryNewFromTemplate(
    template: Template,
    _inputEntry?: Entry,
): Promise<Entry> {
    const inputEntry = _inputEntry
        ? (JSON.parse(JSON.stringify(_inputEntry)) as Entry)
        : undefined;
    const sdk = window.bcms.sdk;
    const languages = await sdk.language.getAll();
    const entry: Entry = inputEntry
        ? JSON.parse(JSON.stringify(inputEntry))
        : {
              _id: '',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              templateId: template._id,
              userId: sdk.accessToken?.payload.userId || '_none',
              meta: [],
              content: [],
          };
    entry.meta = [];
    entry.content = [];
    for (let i = 0; i < languages.length; i++) {
        const language = languages[i];
        // Parse meta
        {
            const values = inputEntry
                ? inputEntry.meta.find((e) => e.lng === language.code)
                : undefined;
            const props = await propValuesFromSchema(
                template.props,
                values?.props,
            );
            const meta: EntryMeta = {
                lng: language.code,
                props,
            };
            entry.meta.push(meta);
        }
        // Parse content
        {
            const entryContent = inputEntry
                ? inputEntry.content.find((e) => e.lng === language.code)
                : undefined;
            const nodes: EntryContentNode[] = [];
            if (entryContent) {
                for (let j = 0; j < entryContent.nodes.length; j++) {
                    const node = JSON.parse(
                        JSON.stringify(entryContent.nodes[j]),
                    );
                    if (node.type === 'widget') {
                        const attrs = node.attrs as EntryContentNodeWidgetAttr;
                        const widget = await sdk.widget.get({
                            widgetId: attrs.data._id,
                        });
                        if (widget) {
                            attrs.data.props = await propValuesFromSchema(
                                widget.props,
                                attrs.data.props,
                            );
                            node.attrs = {
                                // This is required because ProseMirror attributes need to be
                                // of type string because they are passed via HTML attributes.
                                //
                                // Data is deserialized in `widget-component.tsx`
                                data: JSON.stringify(attrs.data) as never,
                                propPath: `entry.content.${i}.nodes.${j}.attrs.data`,
                            };
                            (node.attrs as any).entryId = entry._id;
                            nodes.push(node);
                        }
                    } else {
                        nodes.push(node);
                    }
                }
            }
            const content: EntryContent = {
                lng: language.code,
                nodes,
                plainText: entryContent?.plainText || '',
            };
            entry.content.push(content);
        }
    }
    return entry;
}
