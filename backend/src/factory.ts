import type { Module } from '@becomes/purple-cheetah/types';
import { createBcmsApiKeyFactory } from './api';
import { createBcmsChangeFactory } from './change';
import { createBcmsColorFactory } from './color';
import { createBcmsEntryFactory } from './entry';
import { createBcmsGroupFactory } from './group';
import { createBcmsIdCounterFactory } from './id-counter';
import { createBcmsLanguageFactory } from './language';
import { createBcmsMediaFactory } from './media';
import { createBcmsPropFactory } from './prop';
import { createBcmsStatusFactory } from './status';
import { createBcmsTagFactory } from './tag';
import { createBcmsTemplateFactory } from './template';
import { createBcmsTemplateOrganizerFactory } from './template-organizer';
import type {
  BCMSApiKeyFactory,
  BCMSChangeFactory,
  BCMSColorFactory,
  BCMSEntryFactory,
  BCMSGroupFactory,
  BCMSIdCounterFactory,
  BCMSLanguageFactory,
  BCMSMediaFactory,
  BCMSPropFactory,
  BCMSStatusFactory,
  BCMSTagFactory,
  BCMSTemplateFactory,
  BCMSTemplateOrganizerFactory,
  BCMSUserFactory,
  BCMSWidgetFactory,
} from './types';
import { createBcmsUserFactory } from './user';
import { createBcmsWidgetFactory } from './widget';

export class BCMSFactory {
  static apiKey: BCMSApiKeyFactory;
  static entry: BCMSEntryFactory;
  static group: BCMSGroupFactory;
  static idc: BCMSIdCounterFactory;
  static language: BCMSLanguageFactory;
  static media: BCMSMediaFactory;
  static status: BCMSStatusFactory;
  static template: BCMSTemplateFactory;
  static templateOrganizer: BCMSTemplateOrganizerFactory;
  static user: BCMSUserFactory;
  static widget: BCMSWidgetFactory;
  static prop: BCMSPropFactory;
  static color: BCMSColorFactory;
  static tag: BCMSTagFactory;
  static change: BCMSChangeFactory;
}

export function createBcmsFactories(): Module {
  return {
    name: 'Create factories',
    initialize({ next }) {
      BCMSFactory.apiKey = createBcmsApiKeyFactory();
      BCMSFactory.entry = createBcmsEntryFactory();
      BCMSFactory.group = createBcmsGroupFactory();
      BCMSFactory.idc = createBcmsIdCounterFactory();
      BCMSFactory.language = createBcmsLanguageFactory();
      BCMSFactory.media = createBcmsMediaFactory();
      BCMSFactory.status = createBcmsStatusFactory();
      BCMSFactory.template = createBcmsTemplateFactory();
      BCMSFactory.templateOrganizer = createBcmsTemplateOrganizerFactory();
      BCMSFactory.user = createBcmsUserFactory();
      BCMSFactory.widget = createBcmsWidgetFactory();
      BCMSFactory.prop = createBcmsPropFactory();
      BCMSFactory.color = createBcmsColorFactory();
      BCMSFactory.tag = createBcmsTagFactory();
      BCMSFactory.change = createBcmsChangeFactory();
      next();
    },
  };
}
