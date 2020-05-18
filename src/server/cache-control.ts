import { Service } from 'purple-cheetah';
import { EntryService } from './entry';
import { EntryServiceCache } from './entry/entry.service.cache';

export class CacheControl {
  @Service(EntryService)
  private static entryService: EntryService;
  public static Entry: EntryServiceCache;

  public static init() {
    this.Entry = new EntryServiceCache(this.entryService);
  }
}
