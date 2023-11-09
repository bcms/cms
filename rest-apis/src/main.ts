import '../../ui/src/styles/_main.scss';
import './styles/_main.scss';
import { createApp } from 'vue';
import { App } from './app';
import { parse as parseYaml } from 'yamljs';
import { Doc, Sub } from './services';
import { storage } from './storage';
import { OpenApiServer } from './types';
import { clickOutside, cy, tooltip } from '@ui/directives';

(window as any).bcmsRestApis = async (elId: string, ymlRoot: string) => {
  (window as any).bcmsRestApisToggleSection = (id: string) => {
    const el = document.getElementById(`col${id}`);
    if (el) {
      el.classList.toggle('colBlock_hide');
    }
  };
  (window as any).bcmsRestApisLinkClick = (event: Event, href: string) => {
    event.preventDefault();
    event.stopPropagation();
    window.history.replaceState(null, '', window.location.pathname + href);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      const bb = el.getBoundingClientRect();
      if (
        bb.top > window.scrollX + window.innerHeight ||
        bb.bottom < window.scrollX
      ) {
        el.scrollIntoView();
        el.classList.add('bg-green');
        setTimeout(() => {
          el.classList.remove('bg-green');
        }, 1000);
      }
    }
    Sub.trigger('nav', id);
  };
  const res = await fetch(ymlRoot);
  const rawDocs = await res.text();
  Doc.doc = parseYaml(rawDocs);
  Doc.base = ymlRoot;
  const addedServers = storage.get<OpenApiServer[]>('added-servers') || [];
  if (!Doc.doc.servers) {
    Doc.doc.servers = [];
  }
  Doc.doc.servers.push(...addedServers);
  const app = createApp(App);
  app.directive('cy', cy as any);
  app.directive('clickOutside', clickOutside as any);
  app.directive('tooltip', tooltip as any);
  app.mount(elId);
};
