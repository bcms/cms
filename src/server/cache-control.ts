import { Service } from 'purple-cheetah';
import { EntryService, EntryServiceCache } from './entry';

export class CacheControl {
  @Service(EntryService)
  private static entryService: EntryService;
  public static Entry: EntryServiceCache;

  public static init() {
    this.Entry = new EntryServiceCache(this.entryService);
  }
}
