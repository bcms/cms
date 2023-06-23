import type {
  BCMSApiKeyRepository,
  BCMSChangeRepository,
  BCMSColorRepository,
  BCMSEntryRepository,
  BCMSGroupRepository,
  BCMSIdCounterRepository,
  BCMSLanguageRepository,
  BCMSMediaRepository,
  BCMSStatusRepository,
  BCMSTagRepository,
  BCMSTemplateOrganizerRepository,
  BCMSTemplateRepository,
  BCMSUserRepository,
  BCMSWidgetRepository,
} from './types';

export class BCMSRepo {
  static apiKey: BCMSApiKeyRepository;
  static entry: BCMSEntryRepository;
  static group: BCMSGroupRepository;
  static idc: BCMSIdCounterRepository;
  static language: BCMSLanguageRepository;
  static media: BCMSMediaRepository;
  static status: BCMSStatusRepository;
  static template: BCMSTemplateRepository;
  static templateOrganizer: BCMSTemplateOrganizerRepository;
  static user: BCMSUserRepository;
  static widget: BCMSWidgetRepository;
  static color: BCMSColorRepository;
  static tag: BCMSTagRepository;
  static change: BCMSChangeRepository;
}

export type BCMSRepoType = Omit<typeof BCMSRepo, 'prototype'>;
