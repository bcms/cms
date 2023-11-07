import '../../ui/src/styles/_main.scss';
import './styles/_main.scss';
import { createApp } from 'vue';
import { App } from './app';
import { parse as parseYaml } from 'yamljs';
import { Doc } from './services';
import { storage } from './storage';
import { OpenAPIV3 } from 'openapi-types';

(window as any).bcmsRestApis = async (elId: string, ymlRoot: string) => {
  const res = await fetch(ymlRoot);
  const rawDocs = await res.text();
  Doc.doc = parseYaml(rawDocs);
  Doc.base = ymlRoot;
  const addedServers =
    storage.get<OpenAPIV3.ServerObject[]>('added-servers') || [];
  if (!Doc.doc.servers) {
    Doc.doc.servers = [];
  }
  Doc.doc.servers.push(...addedServers);
  createApp(App).mount(elId);
};
