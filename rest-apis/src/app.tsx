import { defineComponent, onMounted, ref } from 'vue';
import { Doc, DocGroup as DocGroupType, ModalService } from './services';
import { DocGroup, DocSection, Markdown, Nav, NavItem } from './components';
import { BCMSSelect } from '@ui/components';
import { AddServerModal } from './components/modals';
import { storage } from './storage';
import { OpenApiServer } from './types';

export const App = defineComponent({
  setup() {
    const doc = ref(Doc.doc);
    const navItems = ref<NavItem[]>(Doc.createNav(Doc.doc));
    const groups = ref<DocGroupType[]>(Doc.createGroups(Doc.doc));
    const selectedServer = ref(Doc.doc.servers ? Doc.doc.servers[0].url : '');

    onMounted(async () => {
      {
        const urlParts = Doc.base.split('/');
        urlParts.pop();
        if ((Doc.doc.info.description as any)?.$ref) {
          const descriptionParts =
            (Doc.doc.info.description as any)?.$ref?.split('/') || [];
          console.log({ descriptionParts });
          for (let i = 0; i < descriptionParts.length; i++) {
            const part = descriptionParts[i];
            if (part === '..') {
              urlParts.pop();
            } else {
              urlParts.push(part);
            }
          }
          const res = await fetch(urlParts.join('/'));
          doc.value.info.description = await res.text();
          navItems.value = Doc.createNav(doc.value);
          groups.value = Doc.createGroups(doc.value);
        }
      }
    });

    return () => (
      <div class="relative">
        <div class="overflow-auto max-h-screen">
          <div class="pl-80 pt-8 pr-8 pb-8 flex flex-col ">
            <div>
              <span class="text-grey">OpenAPI</span>
              <span class="ml-4 text-green">{doc.value.openapi}</span>
            </div>
            <div>
              <span class="text-grey">API Version</span>
              <span class="ml-4 text-green">{doc.value.info.version}</span>
            </div>
            <div class="mt-12 text-2xl">{doc.value.info.title}</div>
            <div class="mt-4">
              <span class="text-grey">Website</span>
              <span class="ml-4 text-pink">
                <a href={doc.value.info.contact?.url} target="_blank">
                  {doc.value.info.contact?.url}
                </a>
              </span>
            </div>
            <div>
              <span class="text-grey">Website</span>
              <span class="ml-4 text-pink">
                <a
                  href={`mailto:${doc.value.info.contact?.email}`}
                  target="_blank"
                >
                  {doc.value.info.contact?.email}
                </a>
              </span>
            </div>
            <div class="mt-8 markdown">
              <Markdown text={doc.value.info.description + ''} />
            </div>
            <div class="mt-8">
              <BCMSSelect
                class="max-w-xl"
                label="Servers"
                helperText="Select a server to which requests will be sent."
                selected={selectedServer.value}
                options={[
                  ...doc.value.servers.map((server) => {
                    return {
                      label: server.url,
                      value: server.url,
                    };
                  }),
                  {
                    label: 'Add a server',
                    value: '__add',
                  },
                ]}
                onChange={(option) => {
                  if (option.value === '__add') {
                    ModalService.addServer.show({
                      async onDone(url) {
                        let addedServers =
                          storage.get<OpenApiServer[]>('added-servers');
                        if (!addedServers) {
                          addedServers = [];
                        }
                        addedServers.push({
                          url,
                          description: '',
                        });
                        doc.value.servers.push({
                          url,
                          description: '',
                        });
                        selectedServer.value = url;
                        storage.set('added-servers', addedServers);
                      },
                    });
                  } else {
                    selectedServer.value = option.value;
                  }
                }}
              />
            </div>
            <div class="mt-16">
              {groups.value.map((group) => {
                return (
                  <DocGroup
                    group={group}
                    onClick={() => {
                      group.extend = !group.extend;
                    }}
                  >
                    {group.sections.map((section) => {
                      return (
                        <DocSection
                          section={section}
                          onExtend={() => {
                            section.extend = !section.extend;
                          }}
                          // on:send={async () => {
                          //   await send(section, sectionIndex, groupIndex);
                          // }}
                        />
                      );
                    })}
                  </DocGroup>
                );
              })}
            </div>
          </div>
        </div>
        <div class="absolute top-0 left-0 w-72 border-r-grey border-r-[1px] p-4 overflow-auto h-screen">
          <Nav items={navItems.value} root />
        </div>
        <AddServerModal />
        <div id="bcmsSelectList" />
        <div id="bcmsOverflowList" />
      </div>
    );
  },
});
