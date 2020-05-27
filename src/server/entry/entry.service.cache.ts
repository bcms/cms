import { Entry } from './models/entry.model';
import { Cache } from '../util/cache';

export class EntryServiceCache extends Cache<Entry> {
  findByTemplateIdAndEntrySlug(templateId: string, entrySlug: string) {
    const result = this.cache.find(
      (entry) =>
        entry.templateId === templateId &&
        entry.content.find((content) =>
          content.props.find(
            (prop) =>
              (prop.value as any).heading &&
              (prop.value as any).heading.slug === entrySlug,
          ),
        ),
    );
    return result ? result : null;
  }

  findAllByTemplateId(templateId: string) {
    const result = this.cache.filter(
      (entry) => entry.templateId === templateId,
    );
    return result ? result : null;
  }

  count() {
    return this.cache.length;
  }
}
